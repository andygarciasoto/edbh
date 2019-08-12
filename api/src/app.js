var express = require('express');
import { join } from 'path';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'body-parser';
import data from './routes/data';
import auth from './routes/auth';
var cors = require('cors');
import config from  '../config.json';

var corsOptions = {
    origin: config['cors'],
    optionsSuccessStatus: 200 
  }

var app = express();
app.use(express.static(join(__dirname, 'public')));

app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser())

app.get('/', function(req, res) {
    res.send('Welcome to the Parker Hannifin DBH API');
});

app.use('/api', cors(corsOptions), data);
app.use('/login', cors(corsOptions), auth);

var port = process.env.PORT || '3001';
app.listen(port);
console.log('Started API on port', port);



