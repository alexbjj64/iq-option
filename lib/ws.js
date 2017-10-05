'use strict';

const WebSocket = require('ws');

let ws = null,
    wsMessages = [];

module.exports = {
    connect(uri) {
        return new Promise(resolve => {
            ws = new WebSocket('ws://localhost:3000/websocket');
            ws.on('open', () => resolve(ws));
            ws.on('message', message => wsMessages.push(JSON.parse(message)));
        });
    },

    disconnect() {
        ws && ws.terminate();
        ws = null;
        wsMessages = [];
    },

    send(message) {
        return ws.send(JSON.stringify(message));
    },

    receive(count) {
        return wsMessages.splice(0, count || wsMessages.length);
    }
}
