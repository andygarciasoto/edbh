"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _lodash = _interopRequireDefault(require("lodash"));

var _moment = _interopRequireDefault(require("moment"));

var _vm = require("vm");

var _dummyPredictions = require("../objects/dummyPredictions");

var _dummyCommunications = require("../objects/dummyCommunications");

var _config = _interopRequireDefault(require("../../config.json"));

var fs = require('fs');

var express = require('express');

var router = express.Router();

var sqlQuery = require('../objects/sqlConnection');

var utils = require('../objects/utils');

var nJwt = require('njwt');

router.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401);
    res.json({
      "message": err.name + ": " + err.message
    });
  } else next(err);
});
router.use(function (req, res, next) {
  var allowedOrigins = _config["default"]['cors'];
  var origin = req.headers.origin;

  if (allowedOrigins.indexOf(origin) > -1) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
router.use(function (err, req, res, next) {
  var authorization = req.get('Authorization');
  if (!authorization) return res.sendStatus(401);
  var token = authorization.split(" ")[1];
  nJwt.verify(token, _config["default"]["signingKey"], function (err) {
    if (err) {
      console.log(err);
      return res.sendStatus(401);
    } else {
      console.log('ACCEPTED TOKEN', token);
      next();
    }
  });
});
router.get('/data',
/*#__PURE__*/
function () {
  var _ref = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee2(req, res) {
    var params, structureShiftdata, _structureShiftdata;

    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _structureShiftdata = function _ref3() {
              _structureShiftdata = (0, _asyncToGenerator2["default"])(
              /*#__PURE__*/
              _regenerator["default"].mark(function _callee(query) {
                var response, structuredObject, structuredByContent, nameMapping, mappedObject, objectWithLatestComment, objectWithTimelossSummary;
                return _regenerator["default"].wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        response = JSON.parse(Object.values(query)[0].Shift_Data);
                        structuredObject = utils.restructureSQLObject(response, 'shift');
                        structuredByContent = utils.restructureSQLObjectByContent(structuredObject);
                        nameMapping = utils.nameMapping;
                        mappedObject = utils.replaceFieldNames(structuredByContent, nameMapping);
                        objectWithLatestComment = utils.createLatestComment(mappedObject);
                        objectWithTimelossSummary = utils.createTimelossSummary(objectWithLatestComment);
                        res.json(objectWithTimelossSummary);

                      case 8:
                      case "end":
                        return _context.stop();
                    }
                  }
                }, _callee);
              }));
              return _structureShiftdata.apply(this, arguments);
            };

            structureShiftdata = function _ref2(_x3) {
              return _structureShiftdata.apply(this, arguments);
            };

            params = req.query;
            params.dt = (0, _moment["default"])(params.dt, 'YYYYMMDD').format('YYYYMMDD');
            // await sqlQuery(`exec spLocal_EY_DxH_Get_Shift_Data '${params.mc}','${params.dt}',${params.sf};`, response => structureShiftdata(response));
            res.json(_dummyPredictions.data);

          case 5:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}());
router.get('/machine',
/*#__PURE__*/
function () {
  var _ref4 = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee3(req, res) {
    var structureMachines;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            structureMachines = function _ref5(response) {
              var machines = utils.structureMachines(response);
              res.json(machines);
            };

            // await sqlQuery(`select * from dbo.Asset;`, response => structureMachines(response));
            res.json([]);

          case 2:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function (_x4, _x5) {
    return _ref4.apply(this, arguments);
  };
}());
router.get('/', function (req, res) {
  res.send('Got to /data');
});
router.get('/me', function (req, res) {
  console.log('got to users/me'); // return res.status(200).json({name: 'Administrator', role: 'admin'});

  res.sendStatus(200);
});
router.get('/shifts', function (req, res) {
  var shifts = [{
    "shifts": [{
      "value": "First Shift"
    }, {
      "value": "Second Shift"
    }, {
      "value": "Third Shift"
    }, {
      "value": "All Shifts"
    }]
  }];
  res.json([]);
});
router.get('/intershift_communication',
/*#__PURE__*/
function () {
  var _ref6 = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee5(req, res) {
    var mc, sf, structureCommunication, _structureCommunication;

    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _structureCommunication = function _ref8() {
              _structureCommunication = (0, _asyncToGenerator2["default"])(
              /*#__PURE__*/
              _regenerator["default"].mark(function _callee4(communication) {
                var response, structuredObject;
                return _regenerator["default"].wrap(function _callee4$(_context4) {
                  while (1) {
                    switch (_context4.prev = _context4.next) {
                      case 0:
                        response = JSON.parse(Object.values(communication)[0].InterShiftData);
                        structuredObject = utils.restructureSQLObject(response, 'communication');
                        res.json(structuredObject);

                      case 3:
                      case "end":
                        return _context4.stop();
                    }
                  }
                }, _callee4);
              }));
              return _structureCommunication.apply(this, arguments);
            };

            structureCommunication = function _ref7(_x8) {
              return _structureCommunication.apply(this, arguments);
            };

            mc = parseInt(req.query.mc);
            sf = parseInt(req.query.sf);
            // await sqlQuery("exec spLocal_EY_DxH_Get_InterShiftData '10832', '2019-07-25', '3';", response => structureCommunication(response));
            res.json(_dummyCommunications.communications);

          case 5:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));

  return function (_x6, _x7) {
    return _ref6.apply(this, arguments);
  };
}());
router.post('/dxh_new_comment',
/*#__PURE__*/
function () {
  var _ref9 = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee6(req, res) {
    var params, update, respondPost;
    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            respondPost = function _ref10(response) {
              var res = JSON.parse(Object.values(Object.values(response)[0])[0])[0].Return.Status;

              if (res === 0) {
                res.status(200).send('Message Entered Succesfully');
              } else {
                res.status(500).send('Database Connection Error');
              }
            };

            params = req.body;
            update = params.comment_id ? params.comment_id : 0;

            if (!params.clocknumber) {
              _context6.next = 8;
              break;
            }

            _context6.next = 6;
            return sqlQuery("Exec spLocal_EY_DxH_Put_CommentData ".concat(params.dhx_data_id, ", '").concat(params.comment, "', '").concat(params.clocknumber, "', Null, Null, '").concat(params.timestamp, "', ").concat(update), function (response) {
              return respondPost(response);
            });

          case 6:
            _context6.next = 10;
            break;

          case 8:
            _context6.next = 10;
            return sqlQuery("Exec spLocal_EY_DxH_Put_CommentData ".concat(params.dhx_data_id, ", '").concat(params.comment, "', 'Null', '").concat(params.first_name, "', '").concat(params.last_name, "', '").concat(params.timestamp, "', ").concat(update), function (response) {
              return respondPost(response);
            });

          case 10:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));

  return function (_x9, _x10) {
    return _ref9.apply(this, arguments);
  };
}());
module.exports = router;