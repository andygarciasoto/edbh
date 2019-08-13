var express = require('express');
import { join } from 'path';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'body-parser';
import data from './routes/data';
import auth from './routes/auth';
var cors = require('cors');
import config from  '../config.json';

var corsOptions = {
    origin: "http://localhost:3000",
    optionsSuccessStatus: 200 
  }

var app = express();
app.use(express.static(join(__dirname, 'public')));

app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser())

app.get('/', cors(corsOptions), function(req, res) {
  return res.json({name: 'Administator', role: 'admin'});
});

app.use('/api', cors(corsOptions), data);
app.use('/auth', cors(corsOptions), auth);

var port = process.env.PORT || '3001';
app.listen(port);
console.log('Started API on port', port);



