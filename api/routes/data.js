var express = require('express');
var router = express.Router();
var cors = require('cors');
var sqlQuery = require('../objects/sqlConnection');
var utils = require('../objects/utils');
import _ from 'lodash';
import moment from 'moment';

var corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200 
  }

router.get('/'), function(req, res) {
    res.send({response: 'Welcome to the Parker Hannifin DBH API'});
}
router.get('/data', cors(corsOptions), async function (req, res) {
    const params = req.query;
    params.dt = moment(params.dt, 'YYYYMMDD').format('YYYYMMDD');
    async function structureShiftdata(query) {
        // console.log(params, query)
        const response = JSON.parse(Object.values(query)[0].Shift_Data);
        const structuredObject = utils.restructureSQLObject(response, 'shift');
        const structuredByContent = utils.restructureSQLObjectByContent(structuredObject);
        const nameMapping = utils.nameMapping;
        const mappedObject = utils.replaceFieldNames(structuredByContent, nameMapping);
        const objectWithLatestComment = utils.createLatestComment(mappedObject);
        const objectWithTimelossSummary = utils.createTimelossSummary(objectWithLatestComment);
        const mc = parseInt(req.query.mc);
        if (mc == 12532) {
            res.json(objectWithTimelossSummary);
        } else {
            res.send('Invalid \'mc\' parameter');
        }
    }
    await sqlQuery(`exec spLocal_EY_DxH_Shift_Data '${params.mc}','${params.dt}',${params.sf};`, response => structureShiftdata(response));
});

router.get('/machine', cors(corsOptions), async function (req, res) {
    function structureMachines(response) {
        const machines = utils.structureMachines(response);
        res.json(machines);
    }
    await sqlQuery(`select * from dbo.Asset;`, response => structureMachines(response));
});

router.get('/shifts', function (req, res) {
    const shifts = [{
        "shifts": [
            {
                "value": "First Shift"
            },
            {
                "value": "Second Shift"
            },
            {
                "value": "Third Shift"
            },
            {
                "value": "All Shifts"
            }
        ]
    }];
    res.json(shifts);
});

router.get('/intershift_communication', cors(corsOptions), async function (req, res) {
    const mc = parseInt(req.query.mc);
    const sf = parseInt(req.query.sf);
    async function structureCommunication(communication) {
        const response = JSON.parse(Object.values(communication)[0].InterShiftData);
        const structuredObject = utils.restructureSQLObject(response, 'communication');
        res.json(structuredObject);
    }
    await sqlQuery("exec spLocal_EY_DxH_InterShiftData '10832', '2019-07-25', '3';", response => structureCommunication(response));
    // add validation

});
module.exports = router;

// data
// machines
// http://localhost:3001/?machine=23123&date=12/12/12&sf=1
// comments receives: order number - returns: comments from that order
// observations: receives machine number + shift + date - returns: commnpents
// ideal: receives: order number and ideal number - updates: ideal number


/*
router.get('/data', function(req, res, next) {
  // res.json({users: [{name: 'Timmy'}]});
  const params = req.params;
  const data = [];
  // have two repeated shift hours

  s
}); */