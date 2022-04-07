/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The sample REST server can be configured using the environment variables
 * documented below
 *
 * In a local development environment, these variables can be loaded from a
 * .env file by starting the server with the following command:
 *
 *   npm start:dev
 *
 * The scripts/generateEnv.sh script can be used to generate a suitable .env
 * file for the Fabric Test Network
 */

import * as env from 'env-var';

/**
 * Log level for the REST server
 */
export const logLevel = env
    .get('LOG_LEVEL')
    .default('debug')
    .asEnum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']);

/**
 * The port to start the REST server on
 */
export const port = env.get('PORT').default('3000').example('3000').asPortNumber();

/**
 * runhfsc config file
 */
export const JSONCfg = env.get('RUNHFSC_CONFIG_JSON_FILE').required().asString();
