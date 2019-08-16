import _ from 'lodash';
import moment from 'moment';
import { runInNewContext } from 'vm';
const fs = require('fs')
import { data as shiftD } from '../objects/dummyPredictions';
import { communications as communicationsD } from '../objects/dummyCommunications';
import config from '../../config.json';

var express = require('express');
var router = express.Router();
var sqlQuery = require('../objects/sqlConnection');
var utils = require('../objects/utils');
var nJwt = require('njwt');

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
                console.log(err);
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

router.get('/data', async function (req, res) {
    const params = req.query;
    if (params.dt == undefined || params.mc == undefined || params.sf == undefined) return res.status(500).send("Missing parameters");
    params.dt = moment(params.dt, 'YYYYMMDD').format('YYYYMMDD');
    async function structureShiftdata(query) {
        const response = JSON.parse(Object.values(query)[0].Shift_Data);
        const structuredObject = utils.restructureSQLObject(response, 'shift');
        const structuredByContent = utils.restructureSQLObjectByContent(structuredObject);
        const nameMapping = utils.nameMapping;
        const mappedObject = utils.replaceFieldNames(structuredByContent, nameMapping);
        const objectWithLatestComment = utils.createLatestComment(mappedObject);
        const objectWithTimelossSummary = utils.createTimelossSummary(objectWithLatestComment);
        res.status(200).json(objectWithTimelossSummary);
    }
    await sqlQuery(`exec spLocal_EY_DxH_Get_Shift_Data '${params.mc}','${params.dt}',${params.sf};`, response => structureShiftdata(response));
    // res.json(shiftD);
});

router.get('/machine', async function (req, res) {
    function structureMachines(response) {
        const machines = utils.structureMachines(response);
        res.status(200).json(machines);
    }
    await sqlQuery(`select * from dbo.Asset;`, response => structureMachines(response));
    // res.json([])
});

router.get('/me', function (req, res) {
    return res.status(200).json({ name: 'Administrator', role: 'admin' });
});

router.get('/intershift_communication', async function (req, res) {
    const mc = parseInt(req.query.mc);
    const sf = parseInt(req.query.sf);
    async function structureCommunication(communication) {
        const response = JSON.parse(Object.values(communication)[0].InterShiftData);
        const structuredObject = utils.restructureSQLObject(response, 'communication');
        res.status(200).json(structuredObject);
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
});

router.get('/timelost_reasons', async function (req, res) {
    const machine = req.query.mc;
    function returnReasons(data) {
        const response = JSON.parse(Object.values(data)[0].DTReason);
        res.status(200).json(response);
    }
    await sqlQuery(`Exec spLocal_EY_DxH_Get_DTReason ${machine};`, response => returnReasons(response));

});

router.get('/dxh_data_id', async function (req, res) {
    const asset_code = parseInt(req.query.asset_code);
    const timestamp = req.query.timestamp;
    const require_order_create = req.query.require_order_create ? 1 : 0;
    if (asset_code == undefined || timestamp == undefined) return res.status(500).send("Missing parameters");

    function returnData(data) {
        console.log(data);
        const response = JSON.parse(Object.values(data)[0].GetDxHDataId);
        res.status(200).json(response);
    }

    try {
        await sqlQuery(`exec dbo.spLocal_EY_DxH_Get_DxHDataId '${asset_code}', '${timestamp}', ${require_order_create};`, response => returnData(response));
    } catch (e) { console.log(e) }

});

router.put('/dt_data', async function (req, res) {
    const dxh_data_id = parseInt(req.body.dxh_data_id);
    const dt_reason_id = parseInt(req.body.dt_reason_id);
    const dt_minutes = parseFloat(req.body.dt_minutes);
    const clocknumber = req.body.clocknumber;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const Timestamp = moment().format('YYYY-MM-DD HH:MM:SS');
    const update = req.body.dtdata_id ? parseInt(req.body.dtdata_id) : 0;

    if (dxh_data_id == undefined || dt_reason_id == undefined || dt_minutes == undefined) return res.status(500).send("Missing parameters");

    function respondPut(response) {
        console.log(response);
        const resBD = JSON.parse(Object.values(Object.values(response)[0])[0])[0].Return.Status;
        if (resBD === 0) {
            res.status(200).send('Message Entered Succesfully');
        } else {
            res.status(500).send('Database Connection Error');
        }
    }

    console.log(Timestamp);

    try {
        clocknumber ? await sqlQuery(`exec spLocal_EY_DxH_Put_DTData ${dxh_data_id}, ${dt_reason_id}, ${dt_minutes}, '${clocknumber}', Null, Null, '${Timestamp}', ${update};`, response => respondPut(response)) :
            await sqlQuery(`exec spLocal_EY_DxH_Put_DTData ${dxh_data_id}, ${dt_reason_id}, ${dt_minutes}, Null, '${first_name}', '${last_name}', '${Timestamp}', ${update};`, response => respondPut(response))
    } catch (e) { console.log(e) }
});

router.put('/intershift_communication', async function (req, res) {
    const dhx_data_id = parseInt(req.body.dhx_data_id);
    const comment = req.body.comment;
    const clocknumber = req.body.clocknumber;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const Timestamp = moment().format('YYYY-MM-DD HH:MM:SS');
    const update = req.body.inter_shift_id ? parseInt(req.body.inter_shift_id) : 0;

    if (dhx_data_id == undefined || comment == undefined) return res.status(500).send("Missing parameters");

    function respondPut(response) {
        const resBD = JSON.parse(Object.values(Object.values(response)[0])[0])[0].Return.Status;
        if (resBD === 0) {
            res.status(200).send('Message Entered Succesfully');
        } else {
            res.status(500).send('Database Connection Error');
        }
    }

    try {
        clocknumber ? await sqlQuery(`exec spLocal_EY_DxH_Put_InterShiftData ${dhx_data_id}, '${comment}', '${clocknumber}', Null, Null, '${Timestamp}', ${update};`, response => respondPut(response)) :
            await sqlQuery(`exec spLocal_EY_DxH_Put_InterShiftData ${dhx_data_id}, '${comment}', Null, '${first_name}', '${last_name}', '${Timestamp}', ${update};`, response => respondPut(response));
    } catch (e) { console.log(e) }
});

router.put('/operator_sign_off', async function (req, res) {

    const dhx_data_id = parseInt(req.body.dhx_data_id);
    const clocknumber = req.body.clocknumber;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const Timestamp = moment().format('YYYY-MM-DD HH:MM:SS');
    if (dhx_data_id == undefined) return res.status(500).send("Missing parameters");

    function respondPut(response) {
        const resBD = JSON.parse(Object.values(Object.values(response)[0])[0])[0].Return.Status;
        if (resBD === 0) {
            res.status(200).send('Message Entered Succesfully');
        } else {
            res.status(500).send('Database Connection Error');
        }
    }

    try {
        clocknumber ? await sqlQuery(`exec spLocal_EY_DxH_Put_OperatorSignOff ${dhx_data_id}, '${clocknumber}', Null, Null, '${Timestamp}';`, response => respondPut(response)) :
            await sqlQuery(`exec spLocal_EY_DxH_Put_OperatorSignOff ${dhx_data_id}, Null, '${first_name}', '${last_name}', '${Timestamp}';`, response => respondPut(response));
    } catch (e) { console.log(e) }
});

router.put('/supervisor_sign_off', async function (req, res) {
    const dhx_data_id = parseInt(req.body.dhx_data_id);
    const clocknumber = req.body.clocknumber;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const Timestamp = moment().format('YYYY-MM-DD HH:MM:SS');
    if (dhx_data_id == undefined) return res.status(500).send("Missing parameters");

    function respondPut(response) {
        const resBD = JSON.parse(Object.values(Object.values(response)[0])[0])[0].Return.Status;
        if (resBD === 0) {
            res.status(200).send('Message Entered Succesfully');
        } else {
            res.status(500).send('Database Connection Error');
        }
    }

    try {
        clocknumber ? await sqlQuery(`exec spLocal_EY_DxH_Put_SupervisorSignOff ${dhx_data_id}, '${clocknumber}', Null, Null, '${Timestamp}';`, response => respondPut(response)) :
            await sqlQuery(`exec spLocal_EY_DxH_Put_SupervisorSignOff ${dhx_data_id}, Null, '${first_name}', '${last_name}', '${Timestamp}';`, response => respondPut(response));
    } catch (e) { console.log(e) }
});

module.exports = router;