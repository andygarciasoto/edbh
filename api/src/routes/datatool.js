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
  if (table === 'asset') {
    if (position === 10) {
      return value;
    } else {
      value = `'` + value + `'`;
      return value;
    }
  }
  if (table === 'uom') {
    if (position === 12) {
      return value;
    } else {
      value = `'` + value + `'`;
      return value;
    }
  }
  if (table === 'tag') {
    if (position === 9 || position === 16 || position === 17) {
      return value;
    } else {
      value = `'` + value + `'`;
      return value;
    }
  }
  if (table === 'dtreason') {
    if (position === 14) {
      return value;
    } else {
      value = `'` + value + `'`;
      return value;
    }
  }
  if (table === 'shift') {
    if (position === 5 || position === 8 || position === 12 || position === 18) {
      return value;
    } else {
      if (position === 6 || position === 7) {
        value = new Date(value).toISOString();
        value = value.substring(11, 19);
      }
      value = `'` + value + `'`;
      return value;
    }
  }
  if (table === 'unavailable') {
    if (position === 7 || position === 15 || position === 16) {
      return value;
    } else {
      if (position === 5 || position === 6) {
        value = new Date(value).toISOString();
        value = value.substring(11, 19);
      }
      value = `'` + value + `'`;
      return value;
    }
  }
  if (table === 'commonparameterstest') {
    if (position === 2 || position === 4 || position === 7 || position === 8 || position === 9
      || position === 10 || position === 11 || position === 12 || position === 13) {
      return value;
    } else {
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
      'source.[' + 'asset_id' + ']' + ' = ' + 'target.[' + 'asset_id' + ']';
    return validation;
  }
  if (table === 'shift') {
    validation = 'source.[' + 'shift_code' + ']' + ' = ' + 'target.[' + 'shift_code' + ']' + ' AND ' +
      'source.[' + 'asset_id' + ']' + ' = ' + 'target.[' + 'asset_id' + ']';
    return validation;
  }
  if (table === 'tag') {
    validation = 'source.[' + 'tag_code' + ']' + ' = ' + 'target.[' + 'tag_code' + ']' + ' AND ' +
      'source.[' + 'asset_id' + ']' + ' = ' + 'target.[' + 'asset_id' + ']';
    return validation;
  }
  if (table === 'uom') {
    validation = 'source.[' + 'uom_code' + ']' + ' = ' + 'target.[' + 'uom_code' + ']';
    return validation;
  }
  if (table === 'unavailable') {
    validation = 'source.[' + 'unavailable_code' + ']' + ' = ' + 'target.[' + 'unavailable_code' + ']' + ' AND ' +
      'source.[' + 'asset_id' + ']' + ' = ' + 'target.[' + 'asset_id' + ']';
    return validation;
  }
  if (table === 'commonparameterstest') {
    validation = 'source.[' + 'site_id' + ']' + ' = ' + 'target.[' + 'site_id' + ']';
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
      var worksheet = workbook.getWorksheet(6);
      if (worksheet.name !== 'uom') {
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
  let site_id = req.query.site_id;

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader("Content-Disposition", "attachment; filename=" + "Report.xlsx");

  let workbook = new Excel.Workbook();

  let promiseArray = [];
  promiseArray.push(getPromise(constants.DTReasonSQL(site_id), 'DTReason'));
  promiseArray.push(getPromise(constants.AssetSQL(site_id), 'Asset'));
  promiseArray.push(getPromise(constants.ShiftSQL(site_id), 'Shift'));
  promiseArray.push(getPromise(constants.TagSQL(site_id), 'Tag'));
  promiseArray.push(getPromise(constants.CommonParametersSQL(site_id), 'CommonParameters'));
  promiseArray.push(getPromise(constants.UOMSQL(site_id), 'UOM'));
  promiseArray.push(getPromise(constants.UnavailableSQL(site_id), 'Unavailable'));
  promiseArray.push(getPromise(constants.TFDUsersSQL(site_id), 'TFDUsers'));

  Promise.all(promiseArray).then(responseAll => {
    responseAll.forEach(responsePromise => {
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
  }).catch(e => res.status(500).send({ message: 'Error', database_error: e }));
});

module.exports = router;