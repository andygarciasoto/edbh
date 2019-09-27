var express = require('express');
import jwt from 'jsonwebtoken';
var router = express.Router();
var nJwt = require('njwt');
var sqlQuery = require('../objects/sqlConnection');
import config from '../../config.json';
import cors from 'cors';
var request = require('request');
var localStorage = require('localStorage');

router.get("/", function (req, res) {
    res.redirect(401, config['loginURL']);
});

router.get("/token", cors(), async function (req, res) {
    const param = req.query;
    if (!param.code) {
        return res.status(400).json({ message: "Bad Request - Missing Token" });
    }
    const code = param.code;
    const url = `https://login.microsoftonline.com/${config['tenant_id']}/oauth2/token`;
    var params = {
        client_id: config['client_id'],
        client_secret: config['secret'],
        grant_type: 'authorization_code',
        redirect_uri: config['redirect_uri'],
        code: code
    };
    request({
        url: url,
        method: "POST",
        form: params,
        timeout: 10000
    }, function (error, resp, body) {
        if (error) {
            res.status(500).send({ message: 'Error' });
            return;
        }
        body = JSON.parse(body);
        if (!('id_token' in body)) {
            return res.status(400).json({ message: "Bad Request - Missing Token" });
        }
        var jsonwebtoken = jwt.decode(body['id_token']);
        if (jsonwebtoken.aud && jsonwebtoken.aud != config['client_id']) {
            return res.status(400).json({ message: "JWT audience mismatch" });
        }
        if ((jsonwebtoken.exp + 5 * 60) * 1000 < Date.now()) {
            return res.status(400).json({ message: "Expired JWT" });
        }
        var jwtx = nJwt.create(jsonwebtoken, config['signingKey']);
        var token = jwtx.compact();
        return res.redirect(302, config['loginURL'] + `#token=${token}`);
    });
});
router.get("/badge", cors(), async function (req, res) {
    const params = req.query;
    if (!params.badge) {
        return res.status(400).json({ message: "Bad Request - Missing Clock Number" });
    }
    sqlQuery(`exec dbo.sp_clocknumberlogin '${params.badge}'`,
        (err, data) => {
            if (err) {
                console.log(err);
                res.sendStatus(500);
                return;
            }
            try {
                let response = JSON.parse(Object.values(data)[0].GetDataByClockNumber);
                if (response === null) {
                    res.sendStatus(401);
                    return;
                }
                let username = response[0].Username;
                localStorage.setItem("username", username);
                let role = response[0].Role;

                if (role === 'Supervisor' || role === 'Administrator') {
                    const url = `https://login.microsoftonline.com/${config['tenant_id']}/oauth2/authorize?client_id=${config['client_id']}&response_type=code&scope=openid&redirect_uri=${config['redirect_uri']}`;
                    return res.redirect(302, url);
                } else {
                    var claimsList = {
                        user: { iss: config['URL'], sub: 'users/' + username, scope: role },
                    }
                    var jwt = nJwt.create(claimsList.user, config['signingKey']);
                    jwt.setExpiration(new Date().getTime() + config['token_expiration']);
                    var token = jwt.compact();
                    return res.redirect(302, config['loginURL'] + `#token=${token}`);
                }
            } catch (e) {
                res.redirect(401, config['badLogin']);
            }
        });
});

router.post("/", function (req, res) {
    const params = req.body;
    if (!params.username) {
        return res.status(400).json({ message: "Bad Request - Missing Username" });
    }
    sqlQuery(`exec dbo.sp_usernamelogin '${params.username}'`,
        (err, data) => {
            if (err) {
                console.log(err);
                res.sendStatus(500);
                return;
            }
            let response = JSON.parse(Object.values(data)[0].GetDataByUsername);
            if (response === null) {
                res.redirect(303, config['badLogin']);
                return;
            }
            let role = response[0].Role;
            var claimsList = {
                user: { iss: config['URL'], sub: 'users/' + params.username, scope: role },
            }

            if (claimsList.user && params.password === 'parkerdxh2019') {
                var jwt = nJwt.create(claimsList.user, config['signingKey']);
                jwt.setExpiration(new Date().getTime() + config['token_expiration']);
                var token = jwt.compact();
                const url = `${config['URL']}/dashboard#token=${token}`;
                res.redirect(302, url);
                return;
            }
            return res.redirect(401, config['loginURL']);
        });
});



module.exports = router;