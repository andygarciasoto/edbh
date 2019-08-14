"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _path = require("path");

var _cookieParser = _interopRequireDefault(require("cookie-parser"));

var _bodyParser = require("body-parser");

var _data = _interopRequireDefault(require("./routes/data"));

var _auth = _interopRequireDefault(require("./routes/auth"));

var _config = _interopRequireDefault(require("../config.json"));

var express = require('express');

var cors = require('cors');

var whitelist = _config["default"]['cors'];
var corsOptions = {
  origin: function origin(_origin, callback) {
    if (whitelist.indexOf(_origin) !== -1) {
      console.log(true);
      callback(null, true);
    } else {
      console.log(false);
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200,
  allowedHeaders: ['Authorization', 'Content-Type', 'Content-disposition', 'X-Requested-With', 'X-XSRF-TOKEN'],
  exposedHeaders: ['Location', 'Content-Disposition'],
  credentials: true
};
var app = express();
app.use(express["static"]((0, _path.join)(__dirname, 'public')));
app.options('*', cors(corsOptions));
app.use((0, _bodyParser.json)());
app.use((0, _bodyParser.urlencoded)({
  extended: false
}));
app.use((0, _cookieParser["default"])());
app.use('/auth', _auth["default"]);
app.use('/api', _data["default"]);
var port = process.env.PORT || '3001';
app.listen(port);
console.log('Started API on port', port);