var express = require('express');
var router = express.Router();
var cors = require('cors');
var sqlQuery = require('../objects/sqlConnection');
var utils = require('../objects/utils');
var nJwt = require('njwt');

import _ from 'lodash';
import moment from 'moment';
import config from '../../config.json';
import { runInNewContext } from 'vm';

var corsOptions = {
    origin: config['cors'],
    optionsSuccessStatus: 200 
  }

router.use(function (req, res, next){

    if(!req.headers['Authorization']) return res.redirect(401, config['loginURL']);

    var token = req.headers['Authorization'];

    nJwt.verify(token,config["signingKey"],function(err){
        if(err){
          return res.redirect(401, config['loginURL']);
        }else{
          next();
        }
      });
});

router.get('/data', cors(corsOptions), async function (req, res) {
    const params = req.query;
    params.dt = moment(params.dt, 'YYYYMMDD').format('YYYYMMDD');
    async function structureShiftdata(query) {
        const response = JSON.parse(Object.values(query)[0].Shift_Data);
        const structuredObject = utils.restructureSQLObject(response, 'shift');
        const structuredByContent = utils.restructureSQLObjectByContent(structuredObject);
        const nameMapping = utils.nameMapping;
        const mappedObject = utils.replaceFieldNames(structuredByContent, nameMapping);
        const objectWithLatestComment = utils.createLatestComment(mappedObject);
        const objectWithTimelossSummary = utils.createTimelossSummary(objectWithLatestComment);
        res.json(objectWithTimelossSummary);
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