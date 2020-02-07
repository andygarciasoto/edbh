
const appInsights = require("applicationinsights");
appInsights.setup("363e8d3c-d6ee-465a-898c-71e8b489718d");
appInsights.start();

var express = require('express');
import { join } from 'path';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'body-parser';
import data from './routes/data';
import auth from './routes/auth';
import datatool from './routes/datatool';
var cors = require('cors');
import config from '../config.json';
const io = require('socket.io');
var sqlQuery = require('./objects/sqlConnection');

var whitelist = config['cors'];
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  optionsSuccessStatus: 200,
  allowedHeaders: [
    'Authorization',
    'Content-Type',
    'Content-disposition',
    'X-Requested-With',
    'X-XSRF-TOKEN',
  ],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  exposedHeaders: ['Location', 'Content-Disposition'],
  credentials: true,
}

var app = express();
app.use(express.static(join(__dirname, 'public')));

app.options('*', cors(corsOptions));

app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser())

app.get("/", function (req, res) {
  res.send("Dxh Service");
});
app.use('/auth', auth);
app.use('/api', data);
app.use('/datatool', datatool);

var port = process.env.PORT || 8080;
var server = app.listen(port);
console.log('Started API on port', port);

const ioServer = io();

ioServer.on('connection', function (socket) { })

sqlQuery(`SELECT [socket_timeout] FROM [dbo].[GlobalParameters];`,
  (err, response) => {
    if (err) { console.log(err.message) }
    console.log('working with refresh of ', response[0].socket_timeout);
    setInterval(
      function () {
        try {
          ioServer.emit('message', { id: `All connected clients`, message: true });
        } catch (ex) {
          console.log(ex);
        }
      }, response[0].socket_timeout);
  });


ioServer.attach(server, {
  origins: config['cors'],
  cookie: false,
  serveClient: false
});



