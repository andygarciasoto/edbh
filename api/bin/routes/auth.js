"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _config = _interopRequireDefault(require("../../config.json"));

var _cors = _interopRequireDefault(require("cors"));

var express = require('express');

var router = express.Router();

var nJwt = require('njwt');

var claims = {
  iss: _config["default"]['URL'],
  sub: "users/Administrator",
  scope: "admin"
};
router.get("/", function (req, res) {
  res.redirect(401, _config["default"]['loginURL']);
});
router.post("/", function (req, res) {
  if (req.body.username == "Administrator" && req.body.password == "parkerdxh2019") {
    var jwt = nJwt.create(claims, _config["default"]["signingKey"]);
    var token = jwt.compact();
    var url = "".concat(_config["default"]['URL'], "/dashboard#token=").concat(token);
    res.redirect(302, url);
    return;
  }

  console.log('this is bad');
  return res.redirect(401, _config["default"]['loginURL']);
});
module.exports = router;