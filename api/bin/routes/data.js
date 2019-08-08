"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _lodash = _interopRequireDefault(require("lodash"));

var _moment = _interopRequireDefault(require("moment"));

var _vm = require("vm");

var fs = require('fs');

var shiftData = JSON.parse(fs.readFileSync('../dummyPredictions.json', 'utf-8'));
var communicationData = JSON.parse(fs.readFileSync('../dummyCommunications.json', 'utf-8'));

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
//           next()]\
//         }
//       });
// });


router.get('/data',
/*#__PURE__*/
function () {
  var _ref = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee(req, res) {
    var params;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            params = req.query;
            params.dt = (0, _moment["default"])(params.dt, 'YYYYMMDD').format('YYYYMMDD'); // async function structureShiftdata(query) {
            //     const response = JSON.parse(Object.values(query)[0].Shift_Data);
            //     const structuredObject = utils.restructureSQLObject(response, 'shift');
            //     const structuredByContent = utils.restructureSQLObjectByContent(structuredObject);
            //     const nameMapping = utils.nameMapping;
            //     const mappedObject = utils.replaceFieldNames(structuredByContent, nameMapping);
            //     const objectWithLatestComment = utils.createLatestComment(mappedObject);
            //     const objectWithTimelossSummary = utils.createTimelossSummary(objectWithLatestComment);
            //     res.json(objectWithTimelossSummary);
            // }
            // await sqlQuery(`exec spLocal_EY_DxH_Shift_Data '${params.mc}','${params.dt}',${params.sf};`, response => structureShiftdata(response));

            res.json(shiftData);

          case 3:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}());
router.get('/machine',
/*#__PURE__*/
function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee2(req, res) {
    var structureMachines;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            structureMachines = function _ref3(response) {
              var machines = utils.structureMachines(response);
              res.json(machines);
            };

            _context2.next = 3;
            return sqlQuery("select * from dbo.Asset;", function (response) {
              return structureMachines(response);
            });

          case 3:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
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
  var _ref4 = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee3(req, res) {
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            // const mc = parseInt(req.query.mc);
            // const sf = parseInt(req.query.sf);
            // async function structureCommunication(communication) {
            //     const response = JSON.parse(Object.values(communication)[0].InterShiftData);
            //     const structuredObject = utils.restructureSQLObject(response, 'communication');
            //     res.json(structuredObject);
            // }
            // await sqlQuery("exec spLocal_EY_DxH_InterShiftData '10832', '2019-07-25', '3';", response => structureCommunication(response));
            res.json(communicationData);

          case 1:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function (_x5, _x6) {
    return _ref4.apply(this, arguments);
  };
}());
module.exports = router;