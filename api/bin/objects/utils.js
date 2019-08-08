"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.restructureSQLObject = restructureSQLObject;
exports.replaceFieldNames = replaceFieldNames;
exports.restructureSQLObjectByContent = restructureSQLObjectByContent;
exports.createLatestComment = createLatestComment;
exports.createTimelossSummary = createTimelossSummary;
exports.structureMachines = structureMachines;
exports.nameMapping = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _lodash = _interopRequireDefault(require("lodash"));

function restructureSQLObject(obj, format) {
  var newArray = [];

  if (format === 'primitive_shif') {
    obj.map(function (item, key) {
      var newObj = Object.assign(item.hour);
      newObj.comments = item.comment;
      newObj.production = item.production;
      newObj.timelost = item.timelost;
      newArray.push(newObj);
    });
  } else if (format === 'shift') {
    obj.map(function (item, key) {
      item = Object.values(item)[0];
      newArray.push(item);
    });
  } else if (format === 'communication') {
    obj.map(function (item, key) {
      item = Object.values(item)[0];
      newArray.push(item);
    });
  }

  return newArray;
}

function restructureSQLObjectByContent(obj) {
  var newArray = [];
  obj.map(function (item, key) {
    if (item.production !== null && item.production) {
      item.production.map(function (prod, index) {
        var newItem = _lodash["default"].cloneDeep(item);

        newItem['product_code'] = prod.product_code;
        newItem['ideal'] = prod.ideal;
        newItem['target'] = prod.target;
        newItem['actual'] = prod.actual;
        newItem['order_number'] = prod.order_number;
        newArray.push(newItem);
        delete newItem.production;
      });
    } else {
      item['product_code'] = '';
      item['ideal'] = '';
      item['target'] = '';
      item['actual'] = '';
      item['order_number'] = '';
      delete item.production;
      newArray.push(item);
    }
  });
  return newArray;
}

function replaceFieldNames(obj, mapping) {
  var newObjArray = [];
  obj.map(function (objItem, index1) {
    var keyValues = Object.keys(objItem).map(function (key) {
      var newKey = mapping[key] || key;
      return (0, _defineProperty2["default"])({}, newKey, objItem[key]);
    });
    newObjArray.push(Object.assign.apply(Object, [{}].concat((0, _toConsumableArray2["default"])(keyValues))));
  });
  return newObjArray;
}

var nameMapping = {
  hour_interval: "hour_interval",
  ideal: "ideal",
  target: "target_pcs",
  actual: "actual_pcs",
  cumulative_target: "cumulative_target_pcs",
  cumulative_actual: "cumulative_pcs",
  timelost: "timelost",
  // get the latest time lost or calculate the total
  dtreason_code: "timelost_reason_code",
  comment: "actions_comments",
  operator_signoff: "oper_id",
  supervisor_signoff: "superv_id"
};
exports.nameMapping = nameMapping;

function createLatestComment(obj) {
  obj.map(function (item, index) {
    if (item.actions_comments) {
      item['latest_comment'] = item.actions_comments[0].comment;
    }
  });
  return obj;
}

function createTimelossSummary(obj) {
  obj.map(function (item, index) {
    var summary = 0;

    if (item.timelost) {
      item.timelost.map(function (loss, indexB) {
        summary = summary + loss.dtminutes;
      });
    }

    item['timelost_summary'] = summary === 0 ? null : summary;
    item['latest_timelost_code'] = item.timelost !== null ? item.timelost[0].dtreason_code : null;
  });
  return obj;
}

function structureMachines(obj) {
  var machines = [];
  obj.map(function (item, index) {
    var machineObj = {};
    machineObj.asset_id = item.asset_id, machineObj.asset_code = item.asset_code, machineObj.asset_name = item.asset_name, machineObj.asset_description = item.asset_description, machineObj.asset_level = item.asset_level, machineObj.site_code = item.site_code, machineObj.parent_asset_code = item.parent_asset_code;
    machines.push(machineObj);
  });
  return machines;
}