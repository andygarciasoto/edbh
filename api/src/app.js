var express = require('express');
import { join } from 'path';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'body-parser';
import data from './routes/data';
import auth from './routes/auth';

var app = express();
app.use(express.static(join(__dirname, 'public')));

app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser())

app.get('/', function(req, res) {
    res.send('Welcome to the Parker Hannifin DBH API');
});

app.use('/api', data);

app.use('/login', auth);

var port = process.env.PORT || '3001';
app.listen(port);
console.log('Started API on port', port);



