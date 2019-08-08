"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _config = _interopRequireDefault(require("../../config.json"));

var ConnectionPool = require('tedious-connection-pool');

var Request = require('tedious').Request;

var poolConfig = {
  min: 2,
  max: 4,
  log: true
};
var connectionConfig = {
  userName: _config["default"]['user'],
  password: _config["default"]['password'],
  server: _config["default"]['server'],
  options: {
    database: _config["default"]['database'],
    encrypt: true,
    rowCollectionOnDone: true,
    // Only get row set instead of row by row
    useColumnNames: true // For easier JSON formatting

  }
}; //create the pool

var pool = new ConnectionPool(poolConfig, connectionConfig);

function PerformQuery(_x, _x2) {
  return _PerformQuery.apply(this, arguments);
}

function _PerformQuery() {
  _PerformQuery = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee2(statement, callback) {
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            pool.on('error', function (err) {
              console.error(err);
            });
            pool.acquire(
            /*#__PURE__*/
            function () {
              var _ref = (0, _asyncToGenerator2["default"])(
              /*#__PURE__*/
              _regenerator["default"].mark(function _callee(err, connection) {
                var results, request;
                return _regenerator["default"].wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        if (!err) {
                          _context.next = 5;
                          break;
                        }

                        console.error(err);
                        return _context.abrupt("return");

                      case 5:
                        results = [];
                        request = new Request(statement, function (error) {
                          if (error) {
                            return callback(error);
                          } //pass the results array on through the callback


                          callback(results);
                        });
                        _context.next = 9;
                        return request.on("row", function (columns) {
                          var _item = {}; // Converting the response row to a JSON formatted object: [property]: value

                          for (var name in columns) {
                            _item[name] = columns[name].value;
                          }

                          results.push(_item);
                        });

                      case 9:
                        connection.execSql(request);

                      case 10:
                      case "end":
                        return _context.stop();
                    }
                  }
                }, _callee);
              }));

              return function (_x3, _x4) {
                return _ref.apply(this, arguments);
              };
            }());

          case 2:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _PerformQuery.apply(this, arguments);
}

;
module.exports = PerformQuery;