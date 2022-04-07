/*
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import websocket from 'express-ws';
import * as nunjucks from 'nunjucks';
import * as path from 'path';
import * as pty from 'node-pty';
import pinoMiddleware from 'pino-http';
import { logger } from './logger';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';
const app = express();
const expressWs = websocket(app);

const { BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND } = StatusCodes;

app.use(
    pinoMiddleware({
        logger,
        customLogLevel: function customLogLevel(res, err) {
            if (res.statusCode >= BAD_REQUEST && res.statusCode < INTERNAL_SERVER_ERROR) {
                return 'warn';
            }

            if (res.statusCode >= INTERNAL_SERVER_ERROR || err) {
                return 'error';
            }

            return 'debug';
        },
    }),
);

const JSONCfg = process.env['RUNHFSC_CONFIG_JSON_FILE'];

nunjucks.configure(path.join(__dirname, '..', 'views'), {
    autoescape: true,
    express: app,
});
// Serve static assets from ./static
app.use(express.static(`${__dirname}/../static`));

// tslint:disable-next-line:variable-name
app.get('/', (_req, res) => {
    res.render('runhfsc');
});

// view engine setup
app.set('views', path.join(__dirname, '..', 'views'));
app.set('view engine', 'njk');

// Instantiate shell and set up data handlers
expressWs.app.ws('/shell/runhfsc', (ws, _req) => {
    // Spawn the shell
    // For all shell data send it to the websocket
    const env: { [key: string]: string } = process.env as any;

    const shell = pty.spawn('runhfsc', ['-c', JSONCfg!], {
        // "--preserve-env=CORE_PEER_ADDRESS",
        cwd: process.cwd(),
        env,
        name: 'xterm-color',
        cols: 100,
        rows: 60,
    });

    // For all shell data send it to the websocket
    shell.on('data', (data: any) => {
        ws.send(data);
    });
    // For all websocket data send it to the shell
    ws.on('message', (msg: any) => {
        shell.write(msg);
    });
    // eg....... shell.write('ls -l');
});

// // Start the application

const port = normalizePort(process.env['PORT'] || '3000');
app.listen(port);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val: string) {
    const p = parseInt(val, 10);

    if (isNaN(p)) {
        // named pipe
        return val;
    }

    if (p >= 0) {
        // port number
        return p;
    }

    return false;
}
