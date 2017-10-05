'use strict';

const chai = require('chai'),
    cookie = require('cookie');

module.exports = {
    login(uri, login, password) {
        return chai.request(uri)
                .post('/login')
                .send({
                    login: login,
                    password: password
                });
    },

    parseCookies(header) {
        let jar = {};
        header.forEach(cookieString => jar = Object.assign(jar, cookie.parse(cookieString.split(';')[0])));
        return jar;
    },

    wait(timeout) {
        return new Promise(resolve => setTimeout(resolve, timeout));
    }
}
