const express = require('express'),
    app = express(),
    expressWs = require('express-ws')(app),
    bodyParser = require('body-parser'),
    uuid = require('uuid/v4'),
    config = require('../config.json');

const PORT = config.port || 3000,
    USERS = config.users || [];
 
let clients = {};

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Server is running');
});

app.post('/login', (req, res) => {
    if (req.body && req.body.login && req.body.password
        && !!USERS.find(el => el.login === req.body.login && el.password === req.body.password)) {
        let id = uuid();
        clients[id] = null;
        console.log('client added:', id);
        res.cookie('ssid', id);
        res.status(200).json({status: 'success', msg: id});
    } else {
        res.status(401).json({status: 'error'});
    }
});

app.ws('/websocket', (ws, req) => {
    ws.on('message', msg => {
        console.log('got message', msg);

        let message;
        try {
            message = JSON.parse(msg);
        } catch(e) {
            message = {};
        }

        switch(message.name) {
            case 'ssid':
                if (message.msg && clients[message.msg] !== undefined) {
                    clients[message.msg] = ws;
                }
             break;
        }
    });

    ws.on('close', () => {
        Object.keys(clients).forEach(key => {
            if (clients[key] === ws) {
                console.log('client removed:', key);
                delete clients[key];
            }
        });
    })
});

setInterval(() => {
    Object.keys(clients).forEach(key => {
        const ws = clients[key];
        ws && ws.send(JSON.stringify({
            "name": "timeSync",
            "msg": Date.now()
        }));
    });
}, 1000);

app.listen(PORT).on('error', () => process.exit(1));
