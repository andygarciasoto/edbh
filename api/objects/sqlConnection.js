var ConnectionPool = require('tedious-connection-pool');
var Request = require('tedious').Request;
import config from '../config.json';

var poolConfig = {
    min: 2,
    max: 4,
    log: true
};

var connectionConfig = {
    userName: config['user'],
    password: config['password'],
    server: config['server'],
    options: {
      database: config['database']
    }
};

//create the pool
function sqlQuery(statement) {
var pool = new ConnectionPool(poolConfig, connectionConfig);
  async function PerformQuery(query, callback, connection) {

    var request = new Request(
    query,
    function(err, rowCount) {
    if (err) {
        callback(err);
    } else {
        console.log(rowCount + ' row(s) were changed or read.');
        callback(null);
    }
    });

    var result = "";
    try {
    await request.on('row', function(columns) {
        columns.forEach(function(column) {
            if (column.value === null) {
                console.log(column.metadata.colName, 'value is NULL');
            } else {
                result += column.value + " ";
            }
        });
        console.log(result);
        result = "";
    });

  } catch (e) {console.log(e)}

    await connection.execSql(request);
  }

  pool.on('error', function(err) {
    console.error(err);
  });

  pool.acquire(async function (err, connection) {
    if (err) {
        console.error(err);
        return;
    } else {
      try {
        PerformQuery(statement, (a) => console.log('Callback:', a), connection)
    } catch (e) {console.log(e)}
    }
  });
}
module.exports = sqlQuery;