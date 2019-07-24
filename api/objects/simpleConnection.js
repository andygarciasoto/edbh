var Connection = require('tedious').Connection;
var Request = require('tedious').Request;

function conn() {
    var config = {
        server: "",
        // If you're on Windows Azure, you will need this:
        options: {encrypt: true},
        authentication: {
          type: "default",
          options: {  
            userName: "962153",
            password: "318iBT9crNqD",
              }
          }
      }
      
      var connection = new Connection(config);

      connection.on('connect', function(err, succ) {
          console.log('connection established')
         console.log(succ)
         executeStatement();
        }
      );
      
      connection.on('debug', function(text) {
          console.log(text);
        }
      );
      
      function executeStatement() {
        request = new Request("select 42, 'hello world'", function(err, rowCount) {
          if (err) {
            console.log(err);
          } else {
            console.log(rowCount + ' rows');
          }
      
          connection.close();
        });
      
        request.on('row', function(columns) {
          columns.forEach(function(column) {
            if (column.value === null) {
              console.log('NULL');
            } else {
              console.log(column.value);
            }
          });
        });
      
        request.on('done', function(rowCount, more) {
          console.log(rowCount + ' rows returned');
        });
      
        // In SQL Server 2000 you may need: connection.execSqlBatch(request);
        connection.execSql(request);
      }
}

module.exports = conn;