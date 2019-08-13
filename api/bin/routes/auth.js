"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _config = _interopRequireDefault(require("../../config.json"));

var express = require('express');

var router = express.Router();

var nJwt = require('njwt');

var claims = {
  iss: _config["default"]['URL'],
  sub: "users/Administrator",
  scope: "admin"
};
router.get("/", function (req, res) {
  res.redirect(_config["default"]['loginURL']);
});
router.post("/", function (req, res) {
  console.log(req.body);

  if (req.body.username == "Administrator" && req.body.password == "parkerdxh2019") {
    var jwt = nJwt.create(claims, _config["default"]["signingKey"]);
    var token = jwt.compact();
    res.redirect(_config["default"]['URL'] + "/callback?token=" + token);
    return;
  }

  return res.redirect(401, _config["default"]['loginURL']);
});
module.exports = router;