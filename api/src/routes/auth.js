var express = require('express');
var router = express.Router();
var nJwt = require('njwt');
var sqlQuery = require('../objects/sqlConnection');
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

router.post("/badge", cors(), async function (req, res) {
    const params = req.body;
    if (!params.badge)
    return res.status(400).json({ message: "Bad Request - Missing Clock Number" });

    sqlQuery(`exec dbo.sp_clocknumberlogin '${params.badge}'`,
    (err, data) => {
        if (err){
            console.log(err);
            res.sendStatus(500);
            return;
        }
        if (data.length === 0){
            res.sendStatus(401);
            return;
        }
        try {
            let response = JSON.parse(Object.values(data)[0].GetDataByClockNumber);
            let role = response[0].Role;
            req.body.username = role;
            var jwt = nJwt.create(claimsList[req.body.username], config['signingKey']);
            var token = jwt.compact();
            const url = `${config['URL']}/dashboard#token=${token}`;
            res.status(200).send({token: token});
            return;

          }  catch (e) { res.status(500).send({ message: 'Error', api_error: e, database_response: data }); }
          return res.redirect(401, config['loginURL']);
                });
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