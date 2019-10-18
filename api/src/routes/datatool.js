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
  var assetValues = {};
  var key = 1;
  const file = req.files;
  if (!file) {
    return res.status(400).json({ message: "Bad Request - Missing Excel file to import" });
  }
  // read from a file
  var workbook = new Excel.Workbook();
  workbook.xlsx.readFile(file[0].path)
    .then(function () {
      var worksheet = workbook.getWorksheet(2);
      if (worksheet.name !== 'asset') {
        return res.status(400).json({ message: "Bad Request - Please review that the Excel sheets are in place" });
      }
      // Iterate over all rows that have values in a worksheet
      worksheet.eachRow(function (row, rowNumber) {
        if (rowNumber !== 1) {
          assetValues['asset' + key] = JSON.stringify(row.values);
          key++;
        }
        //console.log('Row ' + rowNumber + ' = ' + JSON.stringify(row.values));
      });
      console.log(assetValues);
      // use workbook
    });
  return res.status(200).send('Excel File ' + file + ' Entered Succesfully');
});

module.exports = router;