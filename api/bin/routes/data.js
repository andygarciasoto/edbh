"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _lodash = _interopRequireDefault(require("lodash"));

var _moment = _interopRequireDefault(require("moment"));

var _config = _interopRequireDefault(require("../../config.json"));

var _vm = require("vm");

var express = require('express');

var router = express.Router();

var sqlQuery = require('../objects/sqlConnection');

var utils = require('../objects/utils');

var nJwt = require('njwt'); // router.use(function (req, res, next){
//     if(!req.headers['Authorization']) return res.redirect(401, config['loginURL']);
//     var token = req.headers['Authorization'];
//     nJwt.verify(token,config["signingKey"],function(err){
//         if(err){
//           return res.redirect(401, config['loginURL']);
//         }else{
//           next();
//         }
//       });
// });


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
            _context2.next = 6;
            return sqlQuery("exec spLocal_EY_DxH_Shift_Data '".concat(params.mc, "','").concat(params.dt, "',").concat(params.sf, ";"), function (response) {
              return structureShiftdata(response);
            });

          case 6:
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

            _context3.next = 3;
            return sqlQuery("select * from dbo.Asset;", function (response) {
              return structureMachines(response);
            });

          case 3:
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
  res.json(shifts);
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
            _context5.next = 6;
            return sqlQuery("exec spLocal_EY_DxH_InterShiftData '10832', '2019-07-25', '3';", function (response) {
              return structureCommunication(response);
            });

          case 6:
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
module.exports = router;