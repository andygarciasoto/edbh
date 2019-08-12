import _ from 'lodash';
import moment from 'moment';
import { runInNewContext } from 'vm';
const fs = require('fs')
import {data as shiftD} from '../objects/dummyPredictions';
import {communications as communicationsD} from '../objects/dummyCommunications';
import config from '../../config.json';

var express = require('express');
var router = express.Router();
var sqlQuery = require('../objects/sqlConnection');
var utils = require('../objects/utils');
var nJwt = require('njwt');

router.use(function (req, res, next){
    if(!req.headers['Authorization']) return res.sendStatus(401);
    var token = req.headers['Authorization'];
    nJwt.verify(token,config["signingKey"],function(err){
        if(err){
          return res.sendStatus(401);
        }else{
          next()
        }
      });
});

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

router.get('/me', async function (req, res) {
    return res.json({name: 'Administator', role: 'admin'});
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

router.post('/dxh_new_comment', async function (req, res) {
    const params = req.body;
    const update = params.comment_id ? params.comment_id : 0;
    params.clocknumber ?
    await sqlQuery(`Exec spLocal_EY_DxH_Put_CommentData ${params.dhx_data_id}, '${params.comment}', '${params.clocknumber}', Null, Null, '${params.timestamp}', ${update}`, response => respondPost(response)) :
    await sqlQuery(`Exec spLocal_EY_DxH_Put_CommentData ${params.dhx_data_id}, '${params.comment}', 'Null', '${params.first_name}', '${params.last_name}', '${params.timestamp}', ${update}`, response => respondPost(response))
    function respondPost(response) {
        const res = JSON.parse(Object.values(Object.values(response)[0])[0])[0].Return.Status;
        if (res === 0) {
            res.status(200).send('Message Entered Succesfully');
        } else {
            res.status(500).send('Database Connection Error');
        }
    }
})

module.exports = router;