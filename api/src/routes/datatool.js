var express = require('express');
import moment from 'moment-timezone';
var router = express.Router();
var sqlQuery = require('../objects/sqlConnection');
var constants = require('../objects/constants');
import config from '../../config.json';
const Excel = require('exceljs');
var nJwt = require('njwt');
const multer = require('multer');
var bodyParser = require('body-parser');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
});
const upload = multer({ storage });
router.use(bodyParser.urlencoded());
router.use(bodyParser.json());

router.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401);
    res.json({ "message": err.name + ": " + err.message });
  } else
    next(err);
});

router.use(function (req, res, next) {
  var allowedOrigins = config['cors']
  var origin = req.headers.origin;
  if (allowedOrigins.indexOf(origin) > -1) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader("Access-Control-Allow-Credentials", "true")
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

router.use(function (req, res, next) {
  let token = req.header('Authorization');
  if (token && token.startsWith('Bearer ')) {
    token = token.slice(7, token.length).trimLeft();
  }
  if (token) {
    nJwt.verify(token, config["signingKey"], function (err) {
      if (err) {
        return res.sendStatus(401);
      } else {
        next()
      }
    });
  } else {
    res.status(401);
    return res.json({
      success: false,
      message: 'Auth token is not supplied'
    });
  }
});

function getValuesFromHeaderTable(headers, header, value) {
  let newValue = '';
  if (value != null){
  switch (header.type) {
    case 'VARCHAR': case 'DATETIME':
      if (header.type == 'DATETIME'){
        value = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
      }
      newValue = `'${value}'`;
      break;
    case 'TIME':
      value = new Date(value).toISOString();
      value = value.substring(11, 19);
      newValue = `'${value}'`;
      break;
    case 'BIT':
      newValue = value === 'TRUE' ? 1 : 0;
      break;
    default:
      newValue = value;
  }
} else {
  newValue = null;
}
  newValue += (headers[headers.length - 1].header === header.header) ? '' : ',';
  return newValue;
}

function getParametersOfTable(tableName, siteId) {
  let parametersObject = {
    extraColumns: '',
    joinSentence: '',
    matchParameters: '',
    updateSentence: '',
    insertSentence: '',
  };
  switch (tableName) {
    case 'Asset':
      parametersObject.matchParameters = 's.asset_code = t.asset_code AND s.site_code = t.site_code AND s.parent_asset_code = t.parent_asset_code';
      parametersObject.updateSentence = `t.[asset_name] = s.[asset_name], t.[asset_description] = s.[asset_description], t.[asset_level] = s.[asset_level], t.[value_stream] = s.[value_stream], t.[automation_level] = s.[automation_level], t.[include_in_escalation] = s.[include_in_escalation], t.[grouping1] = s.[grouping1], t.[grouping2] = s.[grouping2], t.[grouping3] = s.[grouping3], t.[grouping4] = s.[grouping4], t.[grouping5] = s.[grouping5], t.[status] = s.[status], t.[entered_by] = s.[entered_by], t.[last_modified_by] = s.[last_modified_by], t.[last_modified_on] = s.[last_modified_on]`;
      parametersObject.insertSentence = `([asset_code], [asset_name], [asset_description], [asset_level], [site_code], [parent_asset_code], [value_stream], [automation_level], [include_in_escalation], [grouping1], [grouping2], [grouping3], [grouping4], [grouping5], [status], [entered_by], [entered_on], [last_modified_by], [last_modified_on]) VALUES (s.[asset_code], s.[asset_name], s.[asset_description], s.[asset_level], s.[site_code], s.[parent_asset_code], s.[value_stream], s.[automation_level], s.[include_in_escalation], s.[grouping1], s.[grouping2], s.[grouping3], s.[grouping4], s.[grouping5], s.[status], s.[entered_by], s.[entered_on], s.[last_modified_by], s.[last_modified_on])`;
      break;
    case 'DTReason':
      parametersObject.extraColumns = ', a.asset_id';
      parametersObject.joinSentence = `JOIN dbo.Asset a ON s.asset_code = a.asset_code`;
      parametersObject.matchParameters = 's.dtreason_code = t.dtreason_code AND s.asset_id = t.asset_id';
      parametersObject.updateSentence = `t.[dtreason_name] = s.[dtreason_name], t.[dtreason_description] = s.[dtreason_description], t.[dtreason_category] = s.[dtreason_category], t.[reason1] = s.[reason1], t.[reason2] = s.[reason2], t.[status] = s.[status], t.[entered_by] = s.[entered_by], t.[last_modified_by] = s.[last_modified_by], t.[last_modified_on] = s.[last_modified_on]`;
      parametersObject.insertSentence = `([dtreason_code], [dtreason_name], [dtreason_description], [dtreason_category], [reason1], [reason2], [status], [entered_by], [entered_on], [last_modified_by], [last_modified_on], [asset_id]) VALUES (s.[dtreason_code], s.[dtreason_name], s.[dtreason_description], s.[dtreason_category], s.[reason1], s.[reason2], s.[status], s.[entered_by], s.[entered_on], s.[last_modified_by], s.[last_modified_on], s.[asset_id])`;
      break;
    case 'Shift':
      parametersObject.extraColumns = ', a.asset_id';
      parametersObject.joinSentence = `JOIN dbo.Asset a ON s.asset_code = a.asset_code WHERE a.asset_level = 'Site'`;
      parametersObject.matchParameters = 's.shift_code = t.shift_code AND s.asset_id = t.asset_id';
      parametersObject.updateSentence = `t.[shift_name] = s.[shift_name], t.[shift_description] = s.[shift_description], t.[shift_sequence] = s.[shift_sequence], t.[start_time] = s.[start_time], t.[end_time] = s.[end_time], t.[duration_in_minutes] = s.[duration_in_minutes], t.[valid_from] = s.[valid_from], t.[valid_to] = s.[valid_to], t.[team_code] = s.[team_code], t.[is_first_shift_of_day] = s.[is_first_shift_of_day], t.[status] = s.[status], t.[entered_by] = s.[entered_by], t.[last_modified_by] = s.[last_modified_by], t.[last_modified_on] = s.[last_modified_on]`;
      parametersObject.insertSentence = `([shift_code], [shift_name], [shift_description], [shift_sequence], [start_time], [end_time], [duration_in_minutes], [valid_from], [valid_to], [team_code], [is_first_shift_of_day], [status], [entered_by], [entered_on], [last_modified_by], [last_modified_on], [asset_id]) VALUES (s.[shift_code], s.[shift_name], s.[shift_description], s.[shift_sequence], s.[start_time], s.[end_time], s.[duration_in_minutes], s.[valid_from], s.[valid_to], s.[team_code], s.[is_first_shift_of_day], s.[status], s.[entered_by], s.[entered_on], s.[last_modified_by], s.[last_modified_on], s.[asset_id])`;
      break;
    case 'Tag':
      parametersObject.extraColumns = ', a.asset_id';
      parametersObject.joinSentence = `JOIN dbo.Asset a ON s.asset_code = a.asset_code`;
      parametersObject.matchParameters = 's.tag_code = t.tag_code AND s.UOM_code = t.UOM_code AND s.asset_id = t.asset_id';//consultar columna con Andres
      parametersObject.updateSentence = `t.[tag_name] = s.[tag_name], t.[tag_description] = s.[tag_description], t.[tag_group] = s.[tag_group], t.[datatype] = s.[datatype], t.[tag_type] = s.[tag_type], t.[rollover_point] = s.[rollover_point], t.[aggregation] = s.[aggregation], t.[status] = s.[status], t.[entered_by] = s.[entered_by], t.[last_modified_by] = s.[last_modified_by], t.[last_modified_on] = s.[last_modified_on], t.[max_change] = s.[max_change], t.[site_id] = ${siteId}`;
      parametersObject.insertSentence = `([tag_code], [tag_name], [tag_description], [tag_group], [datatype], [tag_type], [UOM_code], [rollover_point], [aggregation], [status], [entered_by], [entered_on], [last_modified_by], [last_modified_on], [asset_id], [max_change], [site_id]) VALUES (s.[tag_code], s.[tag_name], s.[tag_description], s.[tag_group], s.[datatype], s.[tag_type], s.[UOM_code], s.[rollover_point], s.[aggregation], s.[status], s.[entered_by], s.[entered_on], s.[last_modified_by], s.[last_modified_on], s.[asset_id], s.[max_change], ${siteId})`;
      break;
    case 'CommonParameters':
      parametersObject.extraColumns = ', a.asset_id as site_id';
      parametersObject.joinSentence = `JOIN dbo.Asset a ON s.asset_code = a.asset_code WHERE a.asset_level = 'Site'`;
      parametersObject.matchParameters = 's.site_id = t.site_id';
      parametersObject.updateSentence = `t.site_id = s.site_id, t.[site_name] = s.[site_name], t.[production_day_offset_minutes] = s.[production_day_offset_minutes], t.[site_timezone] = s.[site_timezone], t.[ui_timezone] = s.[ui_timezone], t.[escalation_level1_minutes] = s.[escalation_level1_minutes], t.[escalation_level2_minutes] = s.[escalation_level2_minutes], t.[default_target_percent_of_ideal] = s.[default_target_percent_of_ideal], t.[default_setup_minutes] = s.[default_setup_minutes], t.[default_routed_cycle_time] = s.[default_routed_cycle_time], t.[setup_lookback_minutes] = s.[setup_lookback_minutes], t.[language] = s.[language], t.[status] = s.[status], t.[entered_by] = s.[entered_by], t.[last_modified_by] = s.[last_modified_by], t.[last_modified_on] = s.[last_modified_on]`;
      parametersObject.insertSentence = `([site_id], [site_name], [production_day_offset_minutes], [site_timezone], [ui_timezone], [escalation_level1_minutes], [escalation_level2_minutes], [default_target_percent_of_ideal], [default_setup_minutes], [default_routed_cycle_time], [setup_lookback_minutes], [language], [status], [entered_by], [entered_on], [last_modified_by], [last_modified_on]) VALUES (s.[site_id], s.[site_name], s.[production_day_offset_minutes], s.[site_timezone], s.[ui_timezone], s.[escalation_level1_minutes], s.[escalation_level2_minutes], s.[default_target_percent_of_ideal], s.[default_setup_minutes], s.[default_routed_cycle_time], s.[setup_lookback_minutes], s.[language], s.[status], s.[entered_by], s.[entered_on], s.[last_modified_by], s.[last_modified_on])`;
      break;
    case 'UOM':
      parametersObject.extraColumns = ', a.asset_id as site_id';
      parametersObject.joinSentence = `JOIN dbo.Asset a ON s.site_code = a.asset_code WHERE a.asset_level = 'Site'`;
      parametersObject.matchParameters = 's.UOM_code = t.UOM_code AND s.site_id = t.site_id';
      parametersObject.updateSentence = `t.[UOM_name] = s.[UOM_name], t.[UOM_description] = s.[UOM_description], t.[status] = s.[status], t.[entered_by] = s.[entered_by], t.[last_modified_by] = s.[last_modified_by], t.[last_modified_on] = s.[last_modified_on], t.[decimals] = s.[decimals], t.[site_id] = s.[site_id]`;
      parametersObject.insertSentence = `([UOM_code], [UOM_name], [UOM_description], [status], [entered_by], [entered_on], [last_modified_by], [last_modified_on], [site_id], [decimals]) VALUES (s.[UOM_code], s.[UOM_name], s.[UOM_description], s.[status], s.[entered_by], s.[entered_on], s.[last_modified_by], s.[last_modified_on], s.[site_id], s.[decimals])`;
      break;
    case 'Unavailable':
      parametersObject.extraColumns = ', a.asset_id';
      parametersObject.joinSentence = `JOIN dbo.Asset a ON s.asset_code = a.asset_code`;
      parametersObject.matchParameters = 's.unavailable_code = t.unavailable_code AND s.asset_id = t.asset_id';//consultar con Andres
      parametersObject.updateSentence = `t.[unavailable_name] = s.[unavailable_name], t.[unavailable_description] = s.[unavailable_description], t.[start_time] = s.[start_time], t.[end_time] = s.[end_time], t.[duration_in_minutes] = s.[duration_in_minutes], t.[valid_from] = s.[valid_from], t.[valid_to] = s.[valid_to], t.[status] = s.[status], t.[entered_by] = s.[entered_by], t.[last_modified_by] = s.[last_modified_by], t.[last_modified_on] = s.[last_modified_on], t.[site_id] = ${siteId}`;
      parametersObject.insertSentence = `([unavailable_code], [unavailable_name], [unavailable_description], [start_time], [end_time], [duration_in_minutes], [valid_from], [valid_to], [status], [entered_by], [entered_on], [last_modified_by], [last_modified_on], [asset_id], [site_id]) VALUES (s.[unavailable_code], s.[unavailable_name], s.[unavailable_description], s.[start_time], s.[end_time], s.[duration_in_minutes], s.[valid_from], s.[valid_to], s.[status], s.[entered_by], s.[entered_on], s.[last_modified_by], s.[last_modified_on], s.[asset_id], ${siteId})`;
      break;
    case 'TFDUsers':
      parametersObject.extraColumns = ', a.asset_id as Site';
      parametersObject.joinSentence = `JOIN dbo.Asset a ON s.asset_code = a.asset_code WHERE a.asset_level = 'Site'`;
      parametersObject.matchParameters = 's.Badge = t.Badge AND s.Site = t.Site';
      parametersObject.updateSentence = `t.[Username] = s.[Username], t.[First_Name] = s.[First_Name], t.[Last_Name] = s.[Last_Name], t.[Role] = s.[Role], t.[Site] = s.[Site]`;
      parametersObject.insertSentence = `([Badge], [Username], [First_Name], [Last_Name], [Role], [Site]) VALUES (s.[Badge], s.[Username], s.[First_Name], s.[Last_Name], s.[Role], s.[Site])`;
      break;
  }
  return parametersObject;
}

router.post('/import_asset', upload.single('file'), (req, res) => {
  const file = req.file;
  const items = req.body.configurationItems;
  const arrayItems = JSON.parse(items);
  const site_id = JSON.parse(req.body.site_id);

  if (!file) {
    return res.status(400).json({ message: "Bad Request - Missing Excel file to import." });
  }
  if (!items || !site_id) {
    return res.status(400).json({ message: "Bad Request - Missing data to import." });
  }
  // read from a file
  var workbook = new Excel.Workbook();
  workbook.xlsx.readFile(file.path)
    .then(() => {
      workbook.eachSheet((worksheet, sheetId) => {
        arrayItems.forEach(function (value) {
          if (worksheet.name == value.id) {
            if (!constants[worksheet.name]) return res.status(400).json({ message: "Bad Request - Invalid tab name" + " " + worksheet.name });
            let columns = constants[worksheet.name];
            let tableSourcesValues = [];
            let parameters = getParametersOfTable(worksheet.name, site_id);
            let mergeQuery = `MERGE [dbo].[${worksheet.name}] t USING (SELECT ${'s.' + columns.map(e => e.header).join(', s.') + parameters.extraColumns} FROM (VALUES`;

            //Read and get data from each row of the sheet
            worksheet.eachRow((row, rowNumber) => {
              let updateRow = '';
              let validRow = false;
              row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                if (rowNumber === 1) {
                  if (cell.value === 'NULL') return res.status(400).json({ message: "Bad Request - Please review that the all the columns have names" });
                } else {
                  if (cell.value !== 'NULL') validRow = true;
                  updateRow += getValuesFromHeaderTable(constants[worksheet.name], constants[worksheet.name][colNumber - 1], cell.value);
                }
              });
              if (rowNumber !== 1) {
                if (!validRow) return res.status(400).json({ message: 'Bad Request - Invalid file format contains a entire empty row. Please check file' });
                  updateRow += worksheet.name == 'Tag' || worksheet.name == 'Unavailable' ? site_id : "";
                tableSourcesValues.push('(' + updateRow + ')');
              }
            });

            //create merge sentence with the data extracted from the sheet
            mergeQuery += tableSourcesValues.join(',') + `) AS S(${columns.map(e => e.header)}) ${parameters.joinSentence}) as s ON (${parameters.matchParameters}) WHEN MATCHED THEN UPDATE SET ${parameters.updateSentence} WHEN NOT MATCHED BY TARGET THEN INSERT ${parameters.insertSentence};`;
            //console.log(mergeQuery);
            sqlQuery(mergeQuery,
                (err, response) => {
                    if (err) {
                        console.log(err);
                        res.status(500).send({ message: 'Error', database_error: err });
                        return;
                    }
                });   
          }
        });
      });
      return res.status(200).send('Excel File ' + file + ' Entered Succesfully');
    }).catch((e) => { return res.status(500).send({ message: 'Error', application_error: e.message }); });
});

router.get('/export_data', async function (req, res) {

  let site_id = req.query.site_id;

  res.writeHead(200, {
    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'Content-Disposition': 'attachment; filename="Report.xlsx"',
    'Transfer-Encoding': 'chunked'
  });

  let workbook = new Excel.stream.xlsx.WorkbookWriter({ stream: res });
  let promiseArray = [];
  promiseArray.push(constants.getPromise(constants.AssetSQL(site_id), 'Asset'));
  promiseArray.push(constants.getPromise(constants.DTReasonSQL(site_id), 'DTReason'));
  promiseArray.push(constants.getPromise(constants.ShiftSQL(site_id), 'Shift'));
  promiseArray.push(constants.getPromise(constants.TagSQL(site_id), 'Tag'));
  promiseArray.push(constants.getPromise(constants.CommonParametersSQL(site_id), 'CommonParameters'));
  promiseArray.push(constants.getPromise(constants.UOMSQL(site_id), 'UOM'));
  promiseArray.push(constants.getPromise(constants.UnavailableSQL(site_id), 'Unavailable'));
  promiseArray.push(constants.getPromise(constants.TFDUsersSQL(site_id), 'TFDUsers'));

  Promise.all(promiseArray).then(responseAll => {
    responseAll.forEach(responsePromise => {
      var worksheet = workbook.addWorksheet(responsePromise.table);
      worksheet.columns = constants[responsePromise.table];
      responsePromise.response.forEach(element => {
        worksheet.addRow(element);
      });
      worksheet.commit();
    });
    workbook.commit();
  }).catch(e => res.status(500).send({ message: 'Error', database_error: e }));
});

module.exports = router;