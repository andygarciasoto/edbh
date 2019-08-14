var express = require('express');
import { join } from 'path';
import cookieParser from 'cookie-parser';
import { json, urlencoded, bodyParser } from 'body-parser';
import data from './routes/data';
import auth from './routes/auth';
var cors = require('cors');
import config from  '../config.json';

var whitelist = config['cors'];
var corsOptions = {
    origin: function(origin, callback) {
      if (whitelist.indexOf(origin) !== -1) {
        console.log(true)
        callback(null, true)
      } else {
        console.log(false)
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
  exposedHeaders: ['Location', 'Content-Disposition'],
  credentials: true,
}

var app = express();
app.use(express.static(join(__dirname, 'public')));

app.options('*', cors(corsOptions));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser())


app.use('/auth', auth);
app.use('/api', data);

var port = process.env.PORT || '3001';
app.listen(port);
console.log('Started API on port', port);



