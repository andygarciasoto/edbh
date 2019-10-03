import _ from 'lodash';
import moment from 'moment-timezone';
import { runInNewContext } from 'vm';
var localStorage = require('localStorage');
const fs = require('fs');

import config from '../../config.json';

var express = require('express');
var request = require('request');
var router = express.Router();
var sqlQuery = require('../objects/sqlConnection');
var utils = require('../objects/utils');
var nJwt = require('njwt');
var _timezone = "America/New_York";
var format = 'YYYY-MM-DD HH:mm:ss';

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

function responseGet(data, req, res, listName) {
    try {
        let response;
        if (listName) {
            response = JSON.parse(Object.values(data)[0][listName]);
        } else {
            response = data;
        }
        res.status(200).json(response);
    } catch (e) { res.status(500).send({ message: 'Error', api_error: e, database_response: data }); }
};

function proccessToken(token) {
    return new Promise((resolve, reject) => {
        nJwt.verify(token, config['signingKey'], function (err, decoded) {
            if (err) return reject(err);
            resolve(decoded);
        })
    });
}

router.get('/data', async function (req, res) {
    const params = req.query;
    if (params.dt == undefined || params.mc == undefined || params.sf == undefined) return res.status(400).send("Missing parameters");
    params.dt = moment(params.dt, 'YYYYMMDD').format('YYYYMMDD');
    function structureShiftdata(query) {
        try {
            const response = JSON.parse(Object.values(query)[0].Shift_Data);
            const structuredObject = utils.restructureSQLObject(response, 'shift');
            const structuredByContent = utils.restructureSQLObjectByContent(structuredObject);
            const nameMapping = utils.nameMapping;
            const mappedObject = utils.replaceFieldNames(structuredByContent, nameMapping);
            const objectWithLatestComment = utils.createLatestComment(mappedObject);
            const objectWithTimelossSummary = utils.createTimelossSummary(objectWithLatestComment);
            const objectWithUnallocatedTime = utils.createUnallocatedTime(objectWithTimelossSummary);
            res.status(200).json(objectWithUnallocatedTime);
        } catch (e) { res.status(500).send({ message: 'Error', api_error: e, database_response: query }); }
    }

    sqlQuery(`exec spLocal_EY_DxH_Get_Shift_Data '${params.mc}','${params.dt}',${params.sf};`,
        (err, response) => {
            if (err) {
                console.log(err);
                res.status(500).send({ message: 'Error', database_error: err });
                return;
            }
            structureShiftdata(response);
        })
});


router.get('/machine', async function (req, res) {
    function structureMachines(response) {
        const machines = utils.structureMachines(response);
        res.status(200).json(machines);
    }
    // const query = "select asset_code From Asset Where asset_level = 'Cell' And status = 'Active' Order by asset_code";
    const query = "exec spLocal_EY_DxH_Get_Asset 'Cell','All'";
    sqlQuery(query, (err, response) => {
        if (err) {
            console.log(err)
            res.status(500).send({ message: 'Error', database_error: err });
            return;
        }
        structureMachines(response);
    });
});

router.get('/me', async function (req, res) {
    let token = req.header('Authorization');
    if (token && token.startsWith('Bearer ')) {
        token = token.slice(7, token.length).trimLeft();
    }
    if (token) {
        let payload = {};
        try {
            payload = await proccessToken(token);
        } catch (e) {
            res.status(401);
            return res.json({
                success: false,
                message: e
            });
        }
        if (payload.body.sub) {
            let user;
            if (payload.body.oid) {
                user = localStorage.getItem("username");
                localStorage.removeItem("username");
            } else {
                user = payload.body.sub.substring(6);
            }
            sqlQuery(`exec dbo.sp_usernamelogin '${user}'`,
                (err, data) => {
                    if (err) {
                        console.log(err);
                        res.status(500).send({ message: 'Error', database_error: err });
                        return;
                    }
                    let response = JSON.parse(Object.values(data)[0].GetDataByUsername);
                    if (response === null) {
                        res.sendStatus(401);
                        return;
                    }
                    return res.status(200).json(response);
                });
        } else {
            res.status(401);
            return res.json({
                success: false,
                message: 'Auth token is invalid'
            });
        }
    } else {
        res.status(401);
        return res.json({
            success: false,
            message: 'Auth token is not supplied'
        });
    }
});

router.get('/shifts', async function (req, res) {
    const query = "select [shift_code], [shift_name] From [dbo].[Shift] Where status = 'Active' order by shift_sequence;";
    try {
        await sqlQuery(query,
            (err, response) => {
                if (err) {
                    console.log(err);
                    res.status(500).send({ message: 'Error', database_error: err });
                    return;
                }
                res.status(200).json(response);
            });
    } catch (e) {
        res.status(500).send({ message: 'Error', api_error: e });
    }
})

router.get('/intershift_communication', async function (req, res) {
    const asset_code = req.query.mc;
    const production_day = req.query.dt;
    const shift_code = req.query.sf;
    if (asset_code == undefined || production_day == undefined || shift_code == undefined)
        return res.status(400).send("Bad Request - Missing parameters");

    sqlQuery(`exec spLocal_EY_DxH_Get_InterShiftData '${asset_code}', '${production_day}', '${shift_code}';`,
        (err, response) => {
            if (err) {
                console.log(err);
                res.status(500).send({ message: 'Error', database_error: err });
                return;
            }
            responseGet(response, req, res, 'InterShiftData');
        });
});

router.post('/dxh_new_comment', async function (req, res) {
    const params = req.body;
    if (!params.comment) {
        return res.status(400).json({ message: "Bad Request - Missing Parameters" });
    }
    const asset_code = params.asset_code ? parseInt(params.asset_code) : undefined;
    const update = params.comment_id ? params.comment_id : 0;
    const timestamp = moment().tz(_timezone).format(format);
    const row_timestamp = params.row_timestamp;

    if (!params.clocknumber) {
        if (!(params.first_name || params.last_name)) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
    }

    if (!params.dxh_data_id) {
        if (asset_code === undefined) {
            return res.status(400).json({ message: "Bad Request - Missing asset_code parameter" });
        } else {
            sqlQuery(`exec dbo.spLocal_EY_DxH_Get_DxHDataId '${asset_code}', '${row_timestamp}', 0;`,
                (err, data) => {
                    if (err) {
                        console.log(err);
                        res.status(500).send({ message: 'Error', database_error: err });
                        return;
                    }
                    let response = JSON.parse(Object.values(data)[0].GetDxHDataId);
                    let dxh_data_id = response[0].dxhdata_id;
                    if (params.clocknumber) {
                        sqlQuery(`Exec spLocal_EY_DxH_Put_CommentData ${dxh_data_id}, '${params.comment}', '${params.clocknumber}', Null, Null, '${timestamp}', ${update}`,
                            (err, response) => {
                                if (err) {
                                    console.log(err);
                                    res.status(500).send({ message: 'Error', database_error: err });
                                    return;
                                }
                                responsePostPut(response, req, res);
                            });
                    } else {
                        sqlQuery(`Exec spLocal_EY_DxH_Put_CommentData ${dxh_data_id}, '${params.comment}', Null, '${params.first_name}', '${params.last_name}', '${timestamp}', ${update}`,
                            (err, response) => {
                                if (err) {
                                    console.log(err);
                                    res.status(500).send({ message: 'Error', database_error: err });
                                    return;
                                }
                                responsePostPut(response, req, res);
                            });
                    }
                });
        }
    } else {
        if (params.clocknumber) {
            sqlQuery(`Exec spLocal_EY_DxH_Put_CommentData ${params.dxh_data_id}, '${params.comment}', '${params.clocknumber}', Null, Null, '${timestamp}', ${update}`,
                (err, response) => {
                    if (err) {
                        console.log(err);
                        res.status(500).send({ message: 'Error', database_error: err });
                        return;
                    }
                    responsePostPut(response, req, res);
                });
        } else {
            sqlQuery(`Exec spLocal_EY_DxH_Put_CommentData ${params.dxh_data_id}, '${params.comment}', Null, '${params.first_name}', '${params.last_name}', '${timestamp}', ${update}`,
                (err, response) => {
                    if (err) {
                        console.log(err);
                        res.status(500).send({ message: 'Error', database_error: err });
                        return;
                    }
                    responsePostPut(response, req, res);
                });
        }
    }
});

router.get('/timelost_reasons', async function (req, res) {
    if (!req.query.mc) {
        return res.status(400).json({ message: "Bad Request - Missing Parameters" });
    }
    const machine = req.query.mc;

    sqlQuery(`Exec spLocal_EY_DxH_Get_DTReason ${machine};`, (err, response) => {
        if (err) {
            console.log(err);
            res.status(500).send({ message: 'Error', database_error: err });
            return;
        }
        responseGet(response, req, res, 'DTReason');
    });
});

router.get('/dxh_data_id', async function (req, res) {
    const asset_code = req.query.asset_code ? parseInt(req.query.asset_code) : undefined;
    const timestamp = req.body.timestamp || moment().format('YYYY-MM-DD HH:MM:SS');
    const require_order_create = req.query.require_order_create ? 1 : 0;

    if (asset_code == undefined || timestamp == undefined) {
        return res.status(400).send("Missing parameters");
    }
    sqlQuery(`exec dbo.spLocal_EY_DxH_Get_DxHDataId '${asset_code}', '${timestamp}', ${require_order_create};`,
        (err, response) => {
            if (err) {
                console.log(err)
                res.status(500).send({ message: 'Error', database_error: err });
                return;
            }
            responseGet(response, req, res, 'GetDxHDataId');
        });
});

router.put('/dt_data', async function (req, res) {
    let dxh_data_id = req.body.dxh_data_id ? parseInt(req.body.dxh_data_id) : undefined;
    const dt_reason_id = req.body.dt_reason_id ? parseInt(req.body.dt_reason_id) : undefined;
    const dt_minutes = req.body.dt_minutes ? parseFloat(req.body.dt_minutes) : undefined;
    const clocknumber = req.body.clocknumber;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const timestamp = moment().tz(_timezone).format(format);
    const update = req.body.dtdata_id ? parseInt(req.body.dtdata_id) : 0;
    const asset_code = req.body.asset_code ? parseInt(req.body.asset_code) : undefined;
    const row_timestamp = req.body.row_timestamp;

    if (dt_reason_id === undefined || dt_minutes === undefined) {
        return res.status(400).send("Missing parameters");
    }
    if (!clocknumber) {
        if (!(first_name || last_name)) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
    }

    if (dxh_data_id === undefined) {
        if (asset_code === undefined) {
            return res.status(400).json({ message: "Bad Request - Missing asset_code parameter" });
        } else {
            sqlQuery(`exec dbo.spLocal_EY_DxH_Get_DxHDataId '${asset_code}', '${row_timestamp}', 0;`,
                (err, data) => {
                    let response = JSON.parse(Object.values(data)[0].GetDxHDataId);
                    dxh_data_id = response[0].dxhdata_id;
                    if (clocknumber) {
                        sqlQuery(`exec spLocal_EY_DxH_Put_DTData ${dxh_data_id}, ${dt_reason_id}, ${dt_minutes}, '${clocknumber}', Null, Null, '${timestamp}', ${update};`,
                            (err, response) => {
                                if (err) {
                                    console.log(err);
                                    res.status(500).send({ message: 'Error', database_error: err });
                                    return;
                                }
                                responsePostPut(response, req, res);
                            });
                    } else {
                        sqlQuery(`exec spLocal_EY_DxH_Put_DTData ${dxh_data_id}, ${dt_reason_id}, ${dt_minutes}, Null, '${first_name}', '${last_name}', '${timestamp}', ${update};`,
                            (err, response) => {
                                if (err) {
                                    console.log(err);
                                    res.status(500).send({ message: 'Error', database_error: err });
                                    return;
                                } responsePostPut(response, req, res);
                            });
                    }
                });
        }
    } else {
        if (clocknumber) {
            sqlQuery(`exec spLocal_EY_DxH_Put_DTData ${dxh_data_id}, ${dt_reason_id}, ${dt_minutes}, '${clocknumber}', Null, Null, '${timestamp}', ${update};`,
                (err, response) => {
                    if (err) {
                        console.log(err);
                        res.status(500).send({ message: 'Error', database_error: err });
                        return;
                    } responsePostPut(response, req, res);
                });
        } else {
            sqlQuery(`exec spLocal_EY_DxH_Put_DTData ${dxh_data_id}, ${dt_reason_id}, ${dt_minutes}, Null, '${first_name}', '${last_name}', '${timestamp}', ${update};`,
                (err, response) => {
                    if (err) {
                        console.log(err);
                        res.status(500).send({ message: 'Error', database_error: err });
                        return;
                    }
                    responsePostPut(response, req, res);
                });
        }
    }
});

router.put('/intershift_communication', async function (req, res) {
    let dxh_data_id = req.body.dxh_data_id ? parseInt(req.body.dxh_data_id) : undefined;
    const comment = req.body.comment;
    const clocknumber = req.body.clocknumber;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const timestamp = moment().tz(_timezone).format(format);
    const update = req.body.inter_shift_id ? parseInt(req.body.inter_shift_id) : 0;
    const asset_code = req.body.asset_code ? parseInt(req.body.asset_code) : undefined;
    const row_timestamp = req.body.row_timestamp;

    if (comment == undefined)
        return res.status(400).send("Missing parameters");
    if (!clocknumber) {
        if (!(first_name || last_name)) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
    }
    if (dxh_data_id == undefined) {
        if (asset_code === undefined) {
            return res.status(400).json({ message: "Bad Request - Missing asset_code parameter" });
        } else {
            sqlQuery(`exec dbo.spLocal_EY_DxH_Get_DxHDataId '${asset_code}', '${row_timestamp}', 0;`,
                (err, data) => {
                    if (err) {
                        console.log(err);
                        res.status(500).send({ message: 'Error', database_error: err });
                        return;
                    }
                    let response = JSON.parse(Object.values(data)[0].GetDxHDataId);
                    dxh_data_id = response[0].dxhdata_id;
                    if (clocknumber) {
                        sqlQuery(`exec spLocal_EY_DxH_Put_InterShiftData ${dxh_data_id}, '${comment}', '${clocknumber}', Null, Null, '${timestamp}', ${update};`,
                            (err, response) => {
                                if (err) {
                                    console.log(err);
                                    res.status(500).send({ message: 'Error', database_error: err });
                                    return;
                                }
                                responsePostPut(response, req, res);
                            });
                    } else {
                        sqlQuery(`exec spLocal_EY_DxH_Put_InterShiftData ${dxh_data_id}, '${comment}', Null, '${first_name}', '${last_name}', '${timestamp}', ${update};`,
                            (err, response) => {
                                if (err) {
                                    console.log(err);
                                    res.status(500).send({ message: 'Error', database_error: err });
                                    return;
                                }
                                responsePostPut(response, req, res);
                            });
                    }
                });
        }
    } else {
        if (clocknumber) {
            sqlQuery(`exec spLocal_EY_DxH_Put_InterShiftData ${dxh_data_id}, '${comment}', '${clocknumber}', Null, Null, '${timestamp}', ${update};`,
                (err, response) => {
                    if (err) {
                        console.log(err);
                        res.status(500).send({ message: 'Error', database_error: err });
                        return;
                    }
                    responsePostPut(response, req, res);
                });
        } else {
            sqlQuery(`exec spLocal_EY_DxH_Put_InterShiftData ${dxh_data_id}, '${comment}', Null, '${first_name}', '${last_name}', '${timestamp}', ${update};`,
                (err, response) => {
                    if (err) {
                        console.log(err);
                        res.status(500).send({ message: 'Error', database_error: err });
                        return;
                    }
                    responsePostPut(response, req, res);
                });
        }
    }
});

router.put('/operator_sign_off', async function (req, res) {

    let dxh_data_id = req.body.dxh_data_id ? parseInt(req.body.dxh_data_id) : undefined;
    const clocknumber = req.body.clocknumber;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const timestamp = moment().tz(_timezone).format(format);
    const override = req.body.override ? req.body.override : 0;
    const row_timestamp = req.body.row_timestamp;
    const asset_code = req.body.asset_code;

    if (!clocknumber) {
        if (!(first_name || last_name)) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
    }

    if (dxh_data_id == undefined) {
        if (asset_code === undefined) {
            return res.status(400).json({ message: "Bad Request - Missing asset_code parameter" });
        } else {
            sqlQuery(`exec dbo.spLocal_EY_DxH_Get_DxHDataId '${asset_code}', '${row_timestamp}', 0;`,
                (err, data) => {
                    if (err) {
                        console.log(err);
                        res.status(500).send({ message: 'Error', database_error: err });
                        return;
                    }
                    let response = JSON.parse(Object.values(data)[0].GetDxHDataId);
                    dxh_data_id = response[0].dxhdata_id;
                    if (clocknumber) {
                        sqlQuery(`exec spLocal_EY_DxH_Put_OperatorSignOff ${dxh_data_id}, '${clocknumber}', Null, Null, '${timestamp}';`,
                            (err, response) => {
                                if (err) {
                                    console.log(err);
                                    res.status(500).send({ message: 'Error', database_error: err });
                                    return;
                                }
                                responsePostPut(response, req, res);
                            });
                    } else {
                        sqlQuery(`exec spLocal_EY_DxH_Put_OperatorSignOff ${dxh_data_id}, Null, '${first_name}', '${last_name}', '${timestamp}';`,
                            (err, response) => {
                                if (err) {
                                    console.log(err);
                                    res.status(500).send({ message: 'Error', database_error: err });
                                    return;
                                }
                                responsePostPut(response, req, res);
                            });
                    }
                });
        }
    } else {
        if (clocknumber) {
            sqlQuery(`exec spLocal_EY_DxH_Put_OperatorSignOff ${dxh_data_id}, '${clocknumber}', Null, Null, '${timestamp}';`,
                (err, response) => {
                    if (err) {
                        console.log(err);
                        res.status(500).send({ message: 'Error', database_error: err });
                        return;
                    }
                    responsePostPut(response, req, res);
                });
        } else {
            sqlQuery(`exec spLocal_EY_DxH_Put_OperatorSignOff ${dxh_data_id}, Null, '${first_name}', '${last_name}', '${timestamp}';`,
                (err, response) => {
                    if (err) {
                        console.log(err);
                        res.status(500).send({ message: 'Error', database_error: err });
                        return;
                    }
                    responsePostPut(response, req, res);
                });
        }
    }
});

router.put('/supervisor_sign_off', async function (req, res) {
    let dxh_data_id = req.body.dxh_data_id ? parseInt(req.body.dxh_data_id) : undefined;
    const clocknumber = req.body.clocknumber;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const timestamp = moment().tz(_timezone).format(format);
    const override = req.body.override ? req.body.override : 0;
    const row_timestamp = req.body.row_timestamp;
    const asset_code = req.body.asset_code;

    if (!clocknumber) {
        if (!(first_name || last_name)) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
    }

    sqlQuery(`exec dbo.sp_clocknumberlogin '${clocknumber}'`,
        (err, data) => {
            if (err) {
                console.log(err);
                res.status(500).send({ message: 'Error', database_error: err });
                return;
            }
            let response = JSON.parse(Object.values(data)[0].GetDataByClockNumber);
            let role = response[0].Role;
            if (role === 'Supervisor') {
                if (dxh_data_id === undefined) {
                    if (asset_code === undefined) {
                        return res.status(400).json({ message: "Bad Request - Missing asset_code parameter" });
                    } else {
                        sqlQuery(`exec dbo.spLocal_EY_DxH_Get_DxHDataId '${asset_code}', '${row_timestamp}', 0;`,
                            (err, data) => {
                                if (err) {
                                    console.log(err);
                                    res.status(500).send({ message: 'Error', database_error: err });
                                    return;
                                }
                                let response = JSON.parse(Object.values(data)[0].GetDxHDataId);
                                dxh_data_id = response[0].dxhdata_id;
                                if (clocknumber) {
                                    sqlQuery(`exec spLocal_EY_DxH_Put_SupervisorSignOff ${dxh_data_id}, '${clocknumber}', Null, Null, '${timestamp}';`,
                                        (err, response) => {
                                            if (err) {
                                                console.log(err);
                                                res.status(500).send({ message: 'Error', database_error: err });
                                                return;
                                            }
                                            responsePostPut(response, req, res);
                                        });
                                } else {
                                    sqlQuery(`exec spLocal_EY_DxH_Put_SupervisorSignOff ${dxh_data_id}, Null, '${first_name}', '${last_name}', '${timestamp}';`,
                                        (err, response) => {
                                            if (err) {
                                                console.log(err);
                                                res.status(500).send({ message: 'Error', database_error: err });
                                                return;
                                            }
                                            responsePostPut(response, req, res);
                                        });
                                }
                            });
                    }
                } else {
                    if (clocknumber) {
                        sqlQuery(`exec spLocal_EY_DxH_Put_SupervisorSignOff ${dxh_data_id}, '${clocknumber}', Null, Null, '${timestamp}';`,
                            (err, response) => {
                                if (err) {
                                    console.log(err);
                                    res.status(500).send({ message: 'Error', database_error: err });
                                    return;
                                }
                                responsePostPut(response, req, res);
                            });
                    } else {
                        sqlQuery(`exec spLocal_EY_DxH_Put_SupervisorSignOff ${dxh_data_id}, Null, '${first_name}', '${last_name}', '${timestamp}';`,
                            (err, response) => {
                                if (err) {
                                    console.log(err);
                                    res.status(500).send({ message: 'Error', database_error: err });
                                    return;
                                }
                                responsePostPut(response, req, res);
                            });
                    }
                }
            } else {
                return res.status(400).json({ message: "Bad Request - Unauthorized Role to SignOff" });
            }

        });
});

router.put('/production_data', async function (req, res) {
    let dxh_data_id = req.body.dxh_data_id ? parseInt(req.body.dxh_data_id) : undefined;
    const actual = req.body.actual ? req.body.actual != "signoff" ? parseFloat(req.body.actual) : 0 : undefined;
    const clocknumber = req.body.clocknumber;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const timestamp = moment().tz(_timezone).format(format);
    const override = req.body.override ? parseInt(req.body.override) : 0;
    const asset_code = req.body.asset_code ? parseInt(req.body.asset_code) : undefined;
    const row_timestamp = req.body.row_timestamp;

    if (actual === undefined) {
        return res.status(400).json({ message: "Bad Request - Missing actual parameter" });
    }
    if (!clocknumber) {
        if (!(first_name || last_name)) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
    }

    if (dxh_data_id === undefined || dxh_data_id === null) {
        if (asset_code === undefined) {
            return res.status(400).json({ message: "Bad Request - Missing asset_code parameter" });
        } else {
            sqlQuery(`exec dbo.spLocal_EY_DxH_Get_DxHDataId '${asset_code}', '${row_timestamp}', 0;`,
                (err, data) => {
                    if (err) {
                        console.log(err);
                        res.status(500).send({ message: 'Error 5052', database_error: err });
                        return;
                    }
                    let response = JSON.parse(Object.values(data)[0].GetDxHDataId);
                    dxh_data_id = response[0].dxhdata_id;
                    if (clocknumber) {
                        sqlQuery(`exec spLocal_EY_DxH_Put_ProductionData ${dxh_data_id}, ${actual}, '${clocknumber}', Null, Null, '${timestamp}', ${override};`,
                            (err, response) => {
                                if (err) {
                                    console.log(err);
                                    res.status(500).send({ message: 'Error 5050', database_error: err });
                                    return;
                                }
                                responsePostPut(response, req, res);
                            });
                    } else {
                        sqlQuery(`exec spLocal_EY_DxH_Put_ProductionData ${dxh_data_id}, ${actual}, Null, '${first_name}', '${last_name}', '${timestamp}', ${override};`,
                            (err, response) => {
                                if (err) {
                                    console.log(err);
                                    res.status(500).send({ message: 'Error', database_error: err });
                                    return;
                                }
                                responsePostPut(response, req, res);
                            });
                    }
                });
        }
    } else {
        if (clocknumber) {
            sqlQuery(`exec spLocal_EY_DxH_Put_ProductionData ${dxh_data_id}, ${actual}, '${clocknumber}', Null, Null, '${timestamp}', ${override};`,
                (err, response) => {
                    if (err) {
                        console.log(err);
                        res.status(500).send({ message: 'Error 5051', database_error: err });
                        return;
                    }
                    responsePostPut(response, req, res);
                });
        } else {
            sqlQuery(`exec spLocal_EY_DxH_Put_ProductionData ${dxh_data_id}, ${actual}, Null, '${first_name}', '${last_name}', '${timestamp}', ${override};`,
                (err, response) => {
                    if (err) {
                        console.log(err);
                        res.status(500).send({ message: 'Error', database_error: err });
                        return;
                    }
                    responsePostPut(response, req, res);
                });
        }
    }
});

router.get('/order_data', async function (req, res) {
    const asset_code = req.query.asset_code;
    const order_number = req.query.order_number;
    const is_current_order = req.query.is_current_order || 0;
    if (asset_code == undefined || order_number == undefined) {
        return res.status(400).send("Bad Request - Missing parameters");
    }
    sqlQuery(`exec spLocal_EY_DxH_Get_OrderData '${asset_code}', '${order_number}', ${is_current_order};`,
        (err, response) => {
            if (err) {
                console.log(err);
                res.status(500).send({ message: 'Error', database_error: err });
                return;
            }
            responseGet(response, req, res, 'OrderData');
        });
});

router.get('/common_parameters', async function (req, res) {
    const parameter_code = req.query.parameter_code;
    if (parameter_code == undefined) {
        return res.status(400).send("Bad Request - Missing parameters");
    }
    sqlQuery(`exec spLocal_EY_DxH_Get_CommonParameters '${parameter_code}';`,
        (err, response) => {
            if (err) {
                console.log(err);
                res.status(500).send({ message: 'Error', database_error: err });
                return;
            }
            responseGet(response, req, res, 'CommonParameters');
        });
});

router.get("/order_assembly", async function (req, res) {
    const params = req.query;
    if (params.order_number == undefined || params.asset_code == undefined || params.timestamp == undefined) {
        return res.status(400).json({ message: "Bad Request - Missing Parameters" });
    }

    sqlQuery(`exec dbo.spLocal_EY_DxH_Get_OrderData'${params.asset_code}','${params.order_number}', 0`,
        (err, data) => {
            if (err) {
                console.log(err);
                res.status(500).send({ message: 'Error', database_error: err });
                return;
            }
            let response = JSON.parse(Object.values(data)[0].OrderData);
            let orderId = response[0].OrderData.order_id;
            if (orderId === null) {
                var assembly = {
                    order_number: params.order_number,
                    asset_code: params.asset_code,
                    timestamp: params.timestamp,
                    message_source: "assembly"
                };
                request({
                    url: "http://tfd036w04.us.parker.corp/jTrax/DxHTrigger/api/assemblyorder",
                    method: "POST",
                    json: true,
                    body: assembly,
                    timeout: 10000
                }, function (error, resp, body) {
                    if (resp.statusCode >= 400) {
                        res.status(500).send({ message: 'Error', jtrax_error: error, body: body });
                        return;
                    }
                    if (error) {
                        res.status(500).send({ message: 'Error', jtrax_error: error });
                        return;
                    }
                    var flag = false;
                    for (var i = 0; i < 10; i++) {
                        sqlQuery(`exec dbo.spLocal_EY_DxH_Get_OrderData'${params.asset_code}','${params.order_number}', 0`,
                            (err, dt) => {
                                if (err) {
                                    console.log(err);
                                    res.status(500).send({ message: 'Error', database_error: err });
                                    return;
                                }
                                let response = JSON.parse(Object.values(dt)[0].OrderData);
                                if (response[0].OrderData.order_id === null || response[0].OrderData.order_id === undefined) {
                                    setTimeout(delay, 500);
                                } else {
                                    if (flag === false) {
                                        res.status(200).json(response);
                                        flag = true;
                                    }
                                }
                            });
                    }
                });
            } else {
                res.status(200).json(response);
                return;
            }
        });
});

router.get('/uom', async function (req, res) {
    sqlQuery(`exec dbo.spLocal_EY_DxH_Get_UOM;`,
        (err, response) => {
            if (err) {
                console.log(err);
                res.status(500).send({ message: 'Error', database_error: err });
                return;
            }
            responseGet(response, req, res, 'UOM');
        });
});

router.get('/product', async function (req, res) {
    sqlQuery(`exec dbo.spLocal_EY_DxH_Get_Product;`,
        (err, response) => {
            if (err) {
                console.log(err);
                res.status(500).send({ message: 'Error', database_error: err });
                return;
            }
            responseGet(response, req, res, 'Product');
        });
});

router.put('/create_order_data', async function (req, res) {
    const asset_code = req.body.asset_code || undefined;
    const part_number = req.body.part_number || undefined;
    const order_quantity = req.body.order_quantity || undefined;
    const uom_code = req.body.uom_code || undefined;
    const routed_cycle_time = req.body.routed_cycle_time || 'Null';
    const setup_time = req.body.setup_time || 'Null';
    const target = req.body.target || 'Null';
    const production_status = req.body.production_status;
    const clocknumber = req.body.clocknumber || undefined;
    const first_name = req.body.first_name || undefined;
    const last_name = req.body.last_name || undefined;
    const timestamp = req.body.timestamp || moment().format('YYYY-MM-DD HH:MM:SS');

    if (!asset_code || !part_number || !uom_code || !production_status) {
        return res.status(400).json({ message: "Bad Request - Missing Parameters" });
    }

    if (!clocknumber) {
        if (!(first_name || last_name)) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
    }

    const query = "select [product_id], [product_code], [product_name], [product_description], [product_family], [value_stream], " +
        "[grouping1], [grouping2], [grouping3], [grouping4], [grouping5], [status], [entered_by], [entered_on], [last_modified_by], " +
        "[last_modified_on] From [dbo].[Product] Where product_code = '" + part_number + "';";

    const queryInsertNewProduct = `exec dbo.sp_importproducts '${part_number}', '${part_number}', '${part_number}', '', '', '', '', 
        '', '', '', 'Active', 'SQL manual entry', '${moment.utc().format('YYYY-MM-DD HH:MM')}';`;

    const queryCreateOrder = clocknumber ? `exec dbo.spLocal_EY_DxH_Create_OrderData '${asset_code}', '${part_number}', ${order_quantity}, '${uom_code}', 
        ${routed_cycle_time}, ${setup_time}, ${target}, '${production_status}', '${clocknumber}', Null, Null;` :
        `exec dbo.spLocal_EY_DxH_Create_OrderData '${asset_code}', '${part_number}', ${order_quantity}, '${uom_code}', ${routed_cycle_time}, ${setup_time}, 
                    ${target}, '${production_status}', Null, '${first_name}', '${last_name}';`;

    try {
        await sqlQuery(query,
            async (err, response) => {
                if (err) {
                    res.status(500).send({ message: 'Error', database_error: err });
                    return;
                }
                let result = Object.values(response);
                if (result[0] === undefined) {
                    await sqlQuery(queryInsertNewProduct,
                        async (err, response) => {
                            if (err) {
                                console.log(err);
                                res.status(500).send({ message: 'Error', database_error: err });
                                return;
                            }
                            await sqlQuery(queryCreateOrder,
                                (err, response) => {
                                    if (err) {
                                        console.log(err);
                                        res.status(500).send({ message: 'Error', database_error: err });
                                        return;
                                    }
                                    responsePostPut(response, req, res);
                                });
                        });
                } else {
                    await sqlQuery(queryCreateOrder,
                        (err, response) => {
                            if (err) {
                                res.status(500).send({ message: 'Error', database_error: err });
                                return;
                            }
                            responsePostPut(response, req, res);
                        });
                }
            });
    } catch (e) {
        res.status(500).send({ message: 'Error', api_error: e });
    }

});

router.get('/asset_display_system', async function (req, res) {
    let display_system_name = req.query.st;
    if (!display_system_name) {
        // return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        display_system_name = 'CR2080435W1'; 
    }

    sqlQuery(`exec dbo.spLocal_EY_DxH_Get_AssetDisplaySystem '${display_system_name}';`,
        (err, response) => {
            if (err) {
                console.log(err);
                res.status(500).send({ message: 'Error', database_error: err });
                return;
            }
            responseGet(response, req, res, 'AssetDisplaySystem');
        });
});

function delay() {
    var msg = "The order hasn't been added to the database. Trying again..."
    //console.log(msg);
}


module.exports = router;
