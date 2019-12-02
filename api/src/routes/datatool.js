var express = require('express');
var router = express.Router();
var sqlQuery = require('../objects/sqlConnection');
var constants = require('../objects/constants');
import config from '../../config.json';
import cors from 'cors';
import moment from 'moment-timezone';
var request = require('request');
var localStorage = require('localStorage');
const Excel = require('exceljs');
var fs = require('fs');
var path = require('path');
const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
});
const upload = multer({ storage });

function getDataType(table, value, position) {
  let hour = '';
  let minutes = '';
  let seconds = '';
  if (value === 'NULL' || value === null) {
    value = null;
    return value;
  }
  if (table === 'asset' || table === 'tag') {
    if (position === 10) {
      return value;
    } else {
      value = `'` + value + `'`;
      return value;
    }
  }
  if (table === 'dtreason' || table === 'uom') {
    value = `'` + value + `'`;
    return value;
  }
  if (table === 'shift') {
    if (position === 5 || position === 8 || position === 13) {
      return value;
    } else {
      if (position === 6 || position === 7){
       value = new Date(value).toISOString();
       value = value.substring(11, 19);
      }
      value = `'` + value + `'`;
      return value;
    }
  }
  if (table === 'unavailable') {
    if (position === 7) {
      return value;
    } else {
      if (position === 5 || position === 6){
       value = new Date(value).toISOString();
       value = value.substring(11, 19);
      }
      value = `'` + value + `'`;
      return value;
    }
  }
}

function getForeignKey(table, validation) {
  if (table === 'asset') {
    validation = 'source.[' + 'asset_code' + ']' + ' = ' + 'target.[' + 'asset_code' + ']' + ' AND ' +
      'source.[' + 'asset_name' + ']' + ' = ' + 'target.[' + 'asset_name' + ']';
    return validation;
  }
  if (table === 'dtreason') {
    validation = 'source.[' + 'dtreason_code' + ']' + ' = ' + 'target.[' + 'dtreason_code' + ']' + ' AND ' +
      'source.[' + 'asset_code' + ']' + ' = ' + 'target.[' + 'asset_code' + ']';
    return validation;
  }
  if (table === 'shift') {
    validation = 'source.[' + 'shift_code' + ']' + ' = ' + 'target.[' + 'shift_code' + ']' + ' AND ' +
      'source.[' + 'asset_code' + ']' + ' = ' + 'target.[' + 'asset_code' + ']';
    return validation;
  }
  if (table === 'tag') {
    validation = 'source.[' + 'tag_code' + ']' + ' = ' + 'target.[' + 'tag_code' + ']' + ' AND ' +
      'source.[' + 'asset_code' + ']' + ' = ' + 'target.[' + 'asset_code' + ']';
    return validation;
  }
  if (table === 'uom') {
    validation = 'source.[' + 'uom_code' + ']' + ' = ' + 'target.[' + 'uom_code' + ']';
    return validation;
  }
  if (table === 'unavailable') {
    validation = 'source.[' + 'unavailable_code' + ']' + ' = ' + 'target.[' + 'unavailable_code' + ']' + ' AND ' +
      'source.[' + 'asset_code' + ']' + ' = ' + 'target.[' + 'asset_code' + ']';
    return validation;
  }
}
function responsePostPut(response, req, res) {
  try {
    const resBD = JSON.parse(Object.values(Object.values(response)[0])[0])[0].Return.Status;
    if (resBD === 0) {
      res.status(200).send('Message Entered Succesfully');
    } else {
      res.status(500).send({ message: 'Error', database_error: response });
    }
  } catch (e) { res.status(500).send({ message: 'Error', api_error: e, database_response: response }); }
};

router.put('/import_asset', cors(), upload.any(), function (req, res) {
  var assetValues = ``;
  var source = "";
  var target = "";
  var foreign = "";
  var update = "";
  var insert = "";
  const file = req.files;
  if (!file) {
    return res.status(400).json({ message: "Bad Request - Missing Excel file to import" });
  }
  // read from a file
  var workbook = new Excel.Workbook();
  workbook.xlsx.readFile(file[0].path)
    .then(function () {
      var worksheet = workbook.getWorksheet(7);
      if (worksheet.name !== 'unavailable') {
        return res.status(400).json({ message: "Bad Request - Please review that the Excel sheets are in place" });
      }
      // Iterate over all rows that have values in a worksheet
      worksheet.eachRow(function (row, rowNumber) {
        row.eachCell({ includeEmpty: true }, function (cell, colNumber) {
          if (colNumber !== 1) {
            if (rowNumber === 1) {
              if (cell.value === 'NULL') {
                return res.status(400).json({ message: "Bad Request - Please review that the all the columns have names" });
              }
              source = source !== "" ? source + ', ' + '[source].' + '[' + cell.value + ']' :
                '[source].' + '[' + cell.value + ']';
              target = target !== "" ? target + ', ' + cell.value : cell.value;
              update = update !== "" ? update + ', ' + '[' + cell.value + ']' + ' = ' + '[source].' + '[' + cell.value + ']' :
                '[' + cell.value + ']' + ' = ' + '[source].' + '[' + cell.value + ']';
              insert = insert !== "" ? insert + ', ' + 'source.' + cell.value : 'source.' + cell.value;
            } else {
              cell.value = getDataType(worksheet.name, cell.value, colNumber);
              if (assetValues === ``) {
                assetValues = `(` + cell.value;
              } else if (colNumber === 2 && assetValues !== ``) {
                assetValues = assetValues + `),(` + cell.value;
              } else {
                assetValues = assetValues + `,` + cell.value;
              }
            }
          }
        });
      });
      foreign = getForeignKey(worksheet.name, foreign);
      assetValues = assetValues + `)`;
      const query = `MERGE [${worksheet.name}] AS target 
        USING (
        SELECT ${source} FROM (VALUES
        ${assetValues}) AS source (${target})) AS source ON ${foreign}
        WHEN MATCHED THEN 
        UPDATE SET ${update}
        WHEN NOT MATCHED THEN
        INSERT (${target})
        VALUES (${insert});`;
        console.log(query);
      sqlQuery(query,
        (err, response) => {
          if (err) {
            console.log(err);
            res.status(500).send({ message: 'Error', database_error: err });
            return;
          }
        });
      // use workbook
    });
  return res.status(200).send('Excel File ' + file + ' Entered Succesfully');
});

function getPromise(sqlSentence, table) {
  return new Promise((resolve, reject) => {
    sqlQuery(sqlSentence,
      (err, response) => {
        if (err) return reject(err);
        resolve({ 'response': response, 'table': table });
      })
  });
}

router.get('/export_data', cors(), upload.any(), async (req, res, next) => {

  let site_name = req.query.site_name;

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader("Content-Disposition", "attachment; filename=" + "Report.xlsx");

  let workbook = new Excel.Workbook();

  let promiseArray = [];
  promiseArray.push(getPromise(constants.DTReasonSQL(site_name), 'DTReason'));
  promiseArray.push(getPromise(constants.AssetSQL(site_name), 'Asset'));
  promiseArray.push(getPromise(constants.ShiftSQL(site_name), 'Shift'));
  promiseArray.push(getPromise(constants.TagSQL(site_name), 'Tag'));
  promiseArray.push(getPromise(constants.CommonParametersSQL, 'CommonParameters'));
  promiseArray.push(getPromise(constants.UOMSQL, 'UOM'));
  promiseArray.push(getPromise(constants.UnavailableSQL(site_name), 'Unavailable'));

  Promise.all(promiseArray).then(responseAll => {
    responseAll.forEach(responsePromise => {
      console.log(responsePromise.table);
      var worksheet = workbook.addWorksheet(responsePromise.table);
      worksheet.columns = constants[responsePromise.table];
      responsePromise.response.forEach(element => {
        worksheet.addRow(element);
      });
    });
    workbook.xlsx.write(res)
      .then(() => {
        res.end();
        console.log('File write done........');
      });
  });
});

module.exports = router;