import _ from 'lodash';
import moment from 'moment';
import { runInNewContext } from 'vm';
const fs = require('fs')

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

function responsePostPut(response, req, res) {
    const resBD = JSON.parse(Object.values(Object.values(response)[0])[0])[0].Return.Status;
    if (resBD === 0) {
        res.status(200).send('Message Entered Succesfully');
    } else {
        res.status(500).send('Database Connection Error');
    }
};

function responseGet(data, req, res, listName) {
    let response;
    if (listName) {
        response = JSON.parse(Object.values(data)[0][listName]);
    } else {
        response = data;
    }
    res.status(200).json(response);
};

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
    try {
        await sqlQuery(`exec spLocal_EY_DxH_Get_Shift_Data '${params.mc}','${params.dt}',${params.sf};`,
            response => structureShiftdata(response));
    } catch (e) {
        res.status(500).send('Database Connection Error');
    }
});

router.get('/machine', async function (req, res) {
    function structureMachines(response) {
        const machines = utils.structureMachines(response);
        res.status(200).json(machines);
    }
    try {
        const query = "select asset_code From Asset Where asset_level = 'Cell' And status = 'Active' Order by asset_code";
        await sqlQuery(query, response => structureMachines(response));
    } catch (e) {
        res.status(500).send('Database Connection Error');
    }
});

router.get('/me', function (req, res) {
    return res.status(200).json({ first_name: 'Admin', last_name: 'Admin', role: 'admin', clock_number: 2477 });
});

router.get('/shifts', async function (req, res) {
    const query = "select [shift_code], [shift_name] From [dbo].[Shift] Where status = 'Active' order by shift_sequence;"
    try {
        await sqlQuery(query,
            response => responseGet(response, req, res));
    } catch (e) {
        res.status(500).send('Database Connection Error');
    }
})

router.get('/intershift_communication', async function (req, res) {
    const asset_code = req.query.mc;
    const production_day = req.query.dt;
    const shift_code = req.query.sf;
    if (asset_code == undefined || production_day == undefined || shift_code == undefined)
        return res.status(400).send("Bad Request - Missing parameters");

    try {
        await sqlQuery(`exec spLocal_EY_DxH_Get_InterShiftData '${asset_code}', '${production_day}', '${shift_code}';`,
            response => responseGet(response, req, res, 'InterShiftData'));
    } catch (e) {
        res.status(500).send('Database Connection Error');
    }
});

router.post('/dxh_new_comment', async function (req, res) {
    const params = req.body;
    if (!(params.comment && params.dhx_data_id))
        return res.status(400).json({ message: "Bad Request - Missing Parameters" });

    const update = params.comment_id ? params.comment_id : 0;
    const Timestamp = params.timestamp || moment().format('YYYY-MM-DD hh:mm:ss');

    if (!params.clocknumber) {
        if (!(params.first_name || params.last_name)) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
    }

    try {
        params.clocknumber ?
            await sqlQuery(`Exec spLocal_EY_DxH_Put_CommentData ${params.dhx_data_id}, '${params.comment}', '${params.clocknumber}', Null, Null, '${Timestamp}', ${update}`,
                response => responsePostPut(response, req, res)) :
            await sqlQuery(`Exec spLocal_EY_DxH_Put_CommentData ${params.dhx_data_id}, '${params.comment}', Null, '${params.first_name}', '${params.last_name}', '${Timestamp}', ${update}`,
                response => responsePostPut(response, req, res));
    } catch (e) {
        res.status(500).send('Database Connection Error');
    }
});

router.get('/timelost_reasons', async function (req, res) {
    if (!req.query.mc) {
        return res.status(400).json({ message: "Bad Request - Missing Parameters" });
    }
    const machine = req.query.mc;

    try {
        await sqlQuery(`Exec spLocal_EY_DxH_Get_DTReason ${machine};`, response => responseGet(response, req, res, 'DTReason'));
    } catch (e) {
        res.status(500).send('Database Connection Error');
    }

});

router.get('/dxh_data_id', async function (req, res) {
    const asset_code = req.query.asset_code ? parseInt(req.query.asset_code) : undefined;
    const timestamp = req.query.timestamp;
    const require_order_create = req.query.require_order_create ? 1 : 0;

    if (asset_code == undefined || timestamp == undefined)
        return res.status(400).send("Missing parameters");

    try {
        await sqlQuery(`exec dbo.spLocal_EY_DxH_Get_DxHDataId '${asset_code}', '${timestamp}', ${require_order_create};`,
            response => responseGet(response, req, res, 'GetDxHDataId'));
    } catch (e) {
        res.status(500).send('Database Connection Error');
    }

});

router.put('/dt_data', async function (req, res) {
    const dxh_data_id = req.body.dxh_data_id ? parseInt(req.body.dxh_data_id) : undefined;
    const dt_reason_id = req.body.dt_reason_id ? parseInt(req.body.dt_reason_id) : undefined;
    const dt_minutes = req.body.dt_minutes ? parseFloat(req.body.dt_minutes) : undefined;
    const clocknumber = req.body.clocknumber;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const Timestamp = moment().format('YYYY-MM-DD hh:mm:ss');
    const update = req.body.dtdata_id ? parseInt(req.body.dtdata_id) : 0;

    if (dxh_data_id === undefined || dt_reason_id === undefined || dt_minutes === undefined)
        return res.status(400).send("Missing parameters");

    if (!clocknumber) {
        if (!(first_name || last_name)) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
    }

    try {
        clocknumber ? await sqlQuery(`exec spLocal_EY_DxH_Put_DTData ${dxh_data_id}, ${dt_reason_id}, ${dt_minutes}, '${clocknumber}', Null, Null, '${Timestamp}', ${update};`,
            response => responsePostPut(response, req, res)) :
            await sqlQuery(`exec spLocal_EY_DxH_Put_DTData ${dxh_data_id}, ${dt_reason_id}, ${dt_minutes}, Null, '${first_name}', '${last_name}', '${Timestamp}', ${update};`,
                response => responsePostPut(response, req, res))
    } catch (e) {
        res.status(500).send('Database Connection Error');
    }
});

router.put('/intershift_communication', async function (req, res) {
    const dhx_data_id = req.body.dhx_data_id ? parseInt(req.body.dhx_data_id) : undefined;
    const comment = req.body.comment;
    const clocknumber = req.body.clocknumber;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const Timestamp = req.body.timestamp || moment().format('YYYY-MM-DD hh:mm:ss');
    const update = req.body.inter_shift_id ? parseInt(req.body.inter_shift_id) : 0;
    if (dhx_data_id == undefined || comment == undefined)
        return res.status(400).send("Missing parameters");
    if (!clocknumber) {
        if (!(first_name || last_name)) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
    }

    try {
        clocknumber ? await sqlQuery(`exec spLocal_EY_DxH_Put_InterShiftData ${dhx_data_id}, '${comment}', '${clocknumber}', Null, Null, '${Timestamp}', ${update};`,
            response => responsePostPut(response, req, res)) :
            await sqlQuery(`exec spLocal_EY_DxH_Put_InterShiftData ${dhx_data_id}, '${comment}', Null, '${first_name}', '${last_name}', '${Timestamp}', ${update};`,
                response => responsePostPut(response, req, res));
    } catch (e) {
        res.status(500).send('Database Connection Error');
    }
});

router.put('/operator_sign_off', async function (req, res) {

    const dhx_data_id = req.body.dhx_data_id ? parseInt(req.body.dhx_data_id) : undefined;
    const clocknumber = req.body.clocknumber;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const Timestamp = req.body.timestamp ? req.body.timestamp : moment().format('YYYY-MM-DD hh:mm:ss');
    if (dhx_data_id == undefined)
        return res.status(500).send("Missing parameters");

    if (!clocknumber) {
        if (!(first_name || last_name)) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
    }

    try {
        clocknumber ? await sqlQuery(`exec spLocal_EY_DxH_Put_OperatorSignOff ${dhx_data_id}, '${clocknumber}', Null, Null, '${Timestamp}';`,
            response => responsePostPut(response, req, res)) :
            await sqlQuery(`exec spLocal_EY_DxH_Put_OperatorSignOff ${dhx_data_id}, Null, '${first_name}', '${last_name}', '${Timestamp}';`,
                response => responsePostPut(response, req, res));
    } catch (e) {
        res.status(500).send('Database Connection Error');
    }
});

router.put('/supervisor_sign_off', async function (req, res) {
    const dhx_data_id = req.body.dhx_data_id ? parseInt(req.body.dhx_data_id) : undefined;
    const clocknumber = req.body.clocknumber;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const Timestamp = moment().format('YYYY-MM-DD hh:mm:ss');
    const override = req.body.override ? req.body.override : 0;
    if (dhx_data_id == undefined)
        return res.status(500).send("Missing parameters");

    if (!clocknumber) {
        if (!(first_name || last_name)) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
    }

    try {
        clocknumber ? await sqlQuery(`exec spLocal_EY_DxH_Put_SupervisorSignOff ${dhx_data_id}, '${clocknumber}', Null, Null, '${Timestamp}', ${override};`,
            response => responsePostPut(response, req, res)) :
            await sqlQuery(`exec spLocal_EY_DxH_Put_SupervisorSignOff ${dhx_data_id}, Null, '${first_name}', '${last_name}', '${Timestamp}', ${override};`,
                responsePostPut(response, req, res));
    } catch (e) {
        res.status(500).send('Database Connection Error');
    }
});

router.put('/production_data', async function (req, res) {
    const dxh_data_id = req.body.dxh_data_id ? parseInt(req.body.dxh_data_id) : undefined;
    const actual = req.body.actual ? parseFloat(req.body.actual) : undefined;
    const clocknumber = req.body.clocknumber;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const Timestamp = moment().format('YYYY-MM-DD hh:mm:ss');
    const override = req.body.override ? parseInt(req.body.override) : 0;
    const asset_code = req.query.asset_code ? parseInt(req.query.asset_code) : undefined;

    if (actual === undefined)
        return res.status(400).json({ message: "Bad Request - Missing actual parameter" });

    if (!clocknumber) {
        if (!(first_name || last_name)) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
    }

    if (dxh_data_id === undefined) {
        if (asset_code === undefined) {
            return res.status(400).json({ message: "Bad Request - Missing asset_code parameter" });
        } else {
            await sqlQuery(`exec dbo.spLocal_EY_DxH_Get_DxHDataId '${asset_code}', '${Timestamp}', 0;`,
                response => {
                    const response = JSON.parse(Object.values(data)[0].GetDxHDataId);
                    dxh_data_id = response.dxhdata_id;
                    console.log(response.dxhdata_id);
                });
        }
    }

    try {
        clocknumber ? await sqlQuery(`exec spLocal_EY_DxH_Put_ProductionData ${dxh_data_id}, ${actual}, '${clocknumber}', Null, Null, '${Timestamp}', ${override};`,
            response => responsePostPut(response, req, res)) :
            await sqlQuery(`exec spLocal_EY_DxH_Put_ProductionData ${dxh_data_id}, ${actual}, Null, '${first_name}', '${last_name}', '${Timestamp}', ${override};`,
                response => responsePostPut(response, req, res));
    } catch (e) {
        res.status(500).send('Database Connection Error');
    }
});

module.exports = router;