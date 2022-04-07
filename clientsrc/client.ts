import { Terminal } from 'xterm';
import { AttachAddon } from 'xterm-addon-attach';
import { Terminal as TerminalType, ITerminalOptions } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

// Custom theme to match style of xterm.js logo
const baseTheme = {
    foreground: '#F8F8F8',
    background: '#2D2E2C',
    selection: '#5DA5D533',
    black: '#1E1E1D',
    brightBlack: '#262625',
    red: '#CE5C5C',
    brightRed: '#FF7272',
    green: '#5BCC5B',
    brightGreen: '#72FF72',
    yellow: '#CCCC5B',
    brightYellow: '#FFFF72',
    blue: '#5D5DD3',
    brightBlue: '#7279FF',
    magenta: '#BC5ED1',
    brightMagenta: '#E572FF',
    cyan: '#5DA5D5',
    brightCyan: '#72F0FF',
    white: '#F8F8F8',
    brightWhite: '#FFFFFF',
};
// vscode-snazzy https://github.com/Tyriar/vscode-snazzy
const otherTheme = {
    foreground: '#eff0eb',
    background: '#282a36',
    selection: '#97979b33',
    black: '#282a36',
    brightBlack: '#686868',
    red: '#ff5c57',
    brightRed: '#ff5c57',
    green: '#5af78e',
    brightGreen: '#5af78e',
    yellow: '#f3f99d',
    brightYellow: '#f3f99d',
    blue: '#57c7ff',
    brightBlue: '#57c7ff',
    magenta: '#ff6ac1',
    brightMagenta: '#ff6ac1',
    cyan: '#9aedfe',
    brightCyan: '#9aedfe',
    white: '#f1f1f0',
    brightWhite: '#eff0eb',
};

export function launch(id: string) {
    let attachinstance;
    const fitinstance = new FitAddon();
    // let isWebglEnabled = false;
    // try {
    //   const webgl = new window!.WebglAddon.WebglAddon();
    //   term.loadAddon(webgl);
    //   isWebglEnabled = true;
    // } catch (e) {
    //   console.warn('WebGL addon threw an exception during load', e);
    // }

    // // Cancel wheel events from scrolling the page if the terminal has scrollback
    // document.querySelector('.xterm').addEventListener('wheel', e => {
    //   if (term.buffer.active.baseY > 0) {
    //     e.preventDefault();
    //   }
    // });

    const term = new Terminal({
        rows: 60,
        cols: 100,
        fontFamily: '"Cascadia Code", Menlo, monospace',
        theme: baseTheme,
        cursorBlink: true,
    } as ITerminalOptions);
    // No idea what this does
    //term.winptyCompatInit();
    // This kinda makes sense
    const container = document.getElementById(id);

    term.loadAddon(fitinstance);
    term.open(container!);
    fitinstance!.fit();
    term.focus();
    // Open the websocket connection to the backend
    const protocol = location.protocol === 'https:' ? 'wss://' : 'ws://';
    const port = location.port ? `:${location.port}` : '';
    const socketUrl = `${protocol}${location.hostname}${port}/shell/runhfsc`;
    const socket = new WebSocket(socketUrl);

    term.write('\n');

    socket.onopen = () => {
        attachinstance = new AttachAddon(socket);
        term.loadAddon(attachinstance);
    };
}
