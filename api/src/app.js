var express = require('express');
import { join } from 'path';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'body-parser';
import data from './routes/data';
import auth from './routes/auth';
var cors = require('cors');
import config from  '../config.json';
const io = require('socket.io')(4000);

var whitelist = config['cors'];
var corsOptions = {
    origin: function(origin, callback) {
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

app.get("/", function(req, res){
  res.send("Dxh Service");
});
app.use('/auth', auth);
app.use('/api', data);

io.on('connection', function(socket){
  setInterval(
    function() {io.emit('message', {id: 1, message: true})}, config['socket_timeout']
  )
})

var port = process.env.PORT || 8080;
app.listen(port);
console.log('Started API on port', port);



