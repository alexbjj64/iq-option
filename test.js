'use strict';

const chai = require('chai'),
    chaiHttp = require('chai-http'),
    expect = chai.expect,
    ws = require('./lib/ws'),

    {login, parseCookies, wait, auth} = require('./lib/utils');

// const URI = 'http://localhost:3000',
const URI = 'https://auth.iqoption.com/api/v1.0/login',
    WS_URI = 'ws://localhost:3000/websocket',
    REG_URI = 'https://iqoption.com/api/register';
let express = require('express')

chai.use(chaiHttp);

describe('A login API and websocket BDD test', () => {

    describe('General checks', () => {
            it('should be a running server', () => {
                chai.request(URI)
                    .get('/')
                    .end((err, res) => {
                        expect(res.status).to.equal(200);
                    });
            });

    });

    describe('Login scenario', () => {

        before(() => {
            chai.request(URI)
                .get('/')
                .end((err, res) => {
                    expect(res.status).to.equal(200);
                });
        });

        it('should be able to successfully login', () => {
            return login(URI, 'test@shit.ru', 'password').then(res => {
                expect(res.status).to.equal(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.a.property('status');
                expect(res.body).to.have.a.property('msg');
                expect(res.body.status).to.be.a('string').and.equal('success');
                expect(res).to.have.cookie('ssid');
            });
        });


        it('should return 403 in case of unsuccessful login', () => {
            return login(URI, 'test@mai.ua', 'incorrect').then(null, err => err.response).then(res => {
                expect(res.status).to.equal(401);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.a.property('status');
                expect(res.body).to.not.have.a.property('msg');
                expect(res.body.status).to.be.a('string').and.equal('error');
            });
        });

    });

    describe('Authorization scenario', () => {

        before(() => {
            chai.request(URI)
                .get('/')
                .end((err, res) => {
                    expect(res.status).to.equal(200);
                });
        });

        it('should be able to successfully auth', () => {
            return auth(REG_URI, 'defailtName', 'defaultSecondNAme', 'test@shit.ru', 'password').then(res => {
                expect(res.status).to.equal(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.a.property('status');
                expect(res.body).to.have.a.property('msg');
                expect(res.body.status).to.be.a('string').and.equal('success');
                expect(res).to.have.cookie('ssid');
            });
        });


        it('should return 401 in case of unsuccessful auth', () => {
            return auth(REG_URI, 'defailtName', 'defaultSecondNAme','test@mai.ua', 'incorrect').then(null, err => err.response).then(res => {
                expect(res.status).to.equal(401);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.a.property('status');
                expect(res.body).to.not.have.a.property('msg');
                expect(res.body.status).to.be.a('string').and.equal('error');
            });
        });

    });


    describe('Websocket subscription', () => {
        let ssid = '';

        before(() => {
            return login(URI, 'test', 'password').then(res => {
                expect(res).to.have.cookie('ssid'); 
                const cookies = parseCookies(res.headers['set-cookie']);
                expect(cookies.ssid).to.be.a('string');
                ssid = cookies.ssid;
            });
        });

        before(() => {
            return ws.connect(WS_URI).then(() => {
                ws.send({
                    name: 'ssid',
                    msg: ssid
                });
            });
        });

        after(() => ws.disconnect());

        for(let i=1; i<=5; i++) {
            it(`should respond with timeSync after ${i * 1000} ms`, () => {
                return wait(1000).then(() => {
                    const messages = ws.receive().filter(msg => msg.name === 'timeSync');
                    expect(messages.length).to.equal(1);
                    const message = messages[0];
                    expect(message).to.have.a.property('name');
                    expect(message.name).to.equal('timeSync');
                    expect(message).to.have.a.property('msg');
                    expect(message.msg).to.be.a('number');         
                });
            });
        }
    });
});

