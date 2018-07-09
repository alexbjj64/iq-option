'use strict';

const chai = require('chai'),
    cookie = require('cookie');

module.exports = {
    login(uri, email, password) {
        return chai.request(uri)
                .post('')
                .send({
                    email: email,
                    password: password
                });
    },

    auth(uri, firstName, secondName, email, password) {
        return chai.request(uri)
            .post('')
            .send({
                email: email,
                password: password,
                firstName: firstName,
                secondName: secondName
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
