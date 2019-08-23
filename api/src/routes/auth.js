var express = require('express');
var router = express.Router();
var nJwt = require('njwt');
import config from '../../config.json';
import cors from 'cors';

var claims = {
    iss: config['URL'],
    sub: "users/Administrator",
    scope: "admin"
}

var claimsList = {
    Administrator: { iss: config['URL'], sub: 'users/Administrator', scope: 'admin' },
    Operator: { iss: config['URL'], sub: 'users/Operator', scope: 'operator' },
    Supervisor: { iss: config['URL'], sub: 'users/Supervisor', scope: 'supervisor' }
}

router.get("/", function (req, res) {
    res.redirect(401, config['loginURL']);
});

router.post("/", function (req, res) {
    if (claimsList[req.body.username] && req.body.password === 'parkerdxh2019') {
        var jwt = nJwt.create(claimsList[req.body.username], config['signingKey']);
        var token = jwt.compact();
        const url = `${config['URL']}/dashboard#token=${token}`;
        res.redirect(302, url);
        return;
    }
    return res.redirect(401, config['loginURL']);
});

module.exports = router;