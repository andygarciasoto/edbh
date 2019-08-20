var ConnectionPool = require('tedious-connection-pool');
var Request = require('tedious').Request;
import config from '../../config.json';

var poolConfig = {
  log: true,
  min: 10,
  max: 50
};

var connectionConfig = {
  userName: config['user'],
  password: config['password'],
  server: config['server'],
  options: {
    database: config['database'],
    encrypt: true,
    useColumnNames: true, // For easier JSON formatting
    requestTimeout: 30000,
  }
};

//create the pool
var pool = new ConnectionPool(poolConfig, connectionConfig);

async function PerformQuery(statement, callback) {
  pool.on('error', function (err) {
    console.error(err);
  });

  pool.acquire(async function (err, connection) {
    if (err) {
      console.error(err);
      return;
    } else {
      var results = [];
      var request = new Request(statement, function (error) {
        if (error) {
          return callback(error);
        }

        //release the connection back to the pool when finished
        connection.release();
        //pass the results array on through the callback
        callback(results);
      });
      await request.on("row", columns => {
        var _item = {};
        // Converting the response row to a JSON formatted object: [property]: value
        for (var name in columns) {
          _item[name] = columns[name].value;
        }
        results.push(_item);
      });
      connection.execSql(request);
    }
  });
};

module.exports = PerformQuery;