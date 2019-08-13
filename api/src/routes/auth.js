var express = require('express');
var router = express.Router();
var nJwt = require('njwt');
import config from '../../config.json';

var claims = {
    iss: config['URL'],
    sub: "users/Administrator",
    scope: "admin"
  }

router.get("/", function(req, res){
    res.redirect(config['loginURL']);
});

router.post("/", function(req, res) {
    console.log(req.body);
    if(req.body.username == "Administrator" && req.body.password == "parkerdxh2019") {
        var jwt = nJwt.create(claims,config["signingKey"]);
        var token = jwt.compact();
        res.redirect(config['URL'] + "/callback?token=" + token);
        return;
    }
    return res.redirect(401, config['loginURL']);
});

module.exports = router;