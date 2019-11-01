var express = require('express');
var router = express.Router();
var sqlQuery = require('../objects/sqlConnection');
import config from '../../config.json';
import cors from 'cors';
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
  if (table === 'dtreason') {
    value = `'` + value + `'`;
    return value;
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
      var worksheet = workbook.getWorksheet(1);
      if (worksheet.name !== 'dtreason') {
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

module.exports = router;