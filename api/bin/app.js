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
      callback(null, true);
    } else {
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
app.use((0, _bodyParser.json)());
app.options('*', cors());
app.use((0, _bodyParser.urlencoded)({
  extended: false
}));
app.use((0, _cookieParser["default"])());
app.get('/', cors(corsOptions), function (req, res) {
  return res.json({
    name: 'Administator',
    role: 'admin'
  });
});
app.use('/api', cors(corsOptions), _data["default"]);
app.use('/auth', cors(corsOptions), _auth["default"]);
var port = process.env.PORT || '3001';
app.listen(port);
console.log('Started API on port', port);