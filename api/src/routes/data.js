import _ from 'lodash';
import moment from 'moment';
import { runInNewContext } from 'vm';
const fs = require('fs')
import { data as shiftD } from '../objects/dummyPredictions';
import { communications as communicationsD } from '../objects/dummyCommunications';

var express = require('express');
var router = express.Router();
var sqlQuery = require('../objects/sqlConnection');
var utils = require('../objects/utils');
var nJwt = require('njwt');

// router.use(function (req, res, next){

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

router.get('/data', async function (req, res) {
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
    await sqlQuery(`exec spLocal_EY_DxH_Get_Shift_Data '${params.mc}','${params.dt}',${params.sf};`, response => structureShiftdata(response));
    // res.json(shiftD);
});

router.get('/machine', async function (req, res) {
    function structureMachines(response) {
        const machines = utils.structureMachines(response);
        res.json(machines);
    }
    await sqlQuery(`select * from dbo.Asset;`, response => structureMachines(response));
    // res.json([])
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
    res.json([]);
});

router.get('/intershift_communication', async function (req, res) {
    const mc = parseInt(req.query.mc);
    const sf = parseInt(req.query.sf);
    async function structureCommunication(communication) {
        const response = JSON.parse(Object.values(communication)[0].InterShiftData);
        const structuredObject = utils.restructureSQLObject(response, 'communication');
        res.json(structuredObject);
    }
    await sqlQuery("exec spLocal_EY_DxH_Get_InterShiftData '10832', '2019-07-25', '3';", response => structureCommunication(response));
    // res.json(communicationsD);

});
module.exports = router;