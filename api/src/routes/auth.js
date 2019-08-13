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

router.get("/", function(req, res){
    res.redirect(config['loginURL']);
});

router.post("/", function(req, res) {
    if(req.body.username == "Administrator" && req.body.password == "parkerdxh2019") {
        var jwt = nJwt.create(claims,config["signingKey"]);
        var token = jwt.compact();
        const url = `${config['URL']}/callback?token=${token}`;
        res.redirect(200, url);
        return;
    }
    return res.redirect(401, config['loginURL']);
});

module.exports = router;