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
    } catch (e) { res.status(500).send({ message: 'Error', api_error: e.message, database_response: response }); }
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
    } catch (e) { res.status(500).send({ message: 'Error', api_error: e.message, database_response: data }); }
};

function proccessToken(token) {
    return new Promise((resolve, reject) => {
        nJwt.verify(token, config['signingKey'], function (err, decoded) {
            if (err) return reject(err);
            resolve(decoded);
        })
    });
}

function getAssetInfoPromise(asset_code) {
    return new Promise((resolve, reject) => {
        sqlQuery(`exec dbo.spLocal_EY_DxH_Get_Asset_By_Code '${asset_code}';`,
            (err, response) => {
                if (err) { return reject(err); }
                resolve(utils.structureMachines(response));
            })
    });
}

router.get('/data', async function (req, res) {
    const params = req.query;
    if (params.dt == undefined || params.mc == undefined || params.hr == undefined || params.sf == undefined || params.st == undefined) {
        return res.status(400).send("Missing parameters");
    }

    const hour = moment(new Date(params.dt)).hours();
    var date = params.dt;
    params.dt = moment(params.dt, 'YYYYMMDD').format('YYYYMMDD');
    function structureShiftdata(query) {
        try {
            const objectWithUnallocatedTime = utils.createUnallocatedTime2(query, params.hr, date);
            res.status(200).json(objectWithUnallocatedTime);
        } catch (e) { res.status(500).send({ message: 'Error', api_error: e.message, database_response: query }); }
    }

    getAssetInfoPromise(params.mc).then(responseProm => {
        sqlQuery(`exec spLocal_EY_DxH_Get_Shift_Data_new_2 ${responseProm[0].Asset.asset_id},'${params.dt}',${params.sf}, ${params.st};`,
            (err, response) => {
                if (err) {
                    console.log(err);
                    res.status(500).send({ message: 'Error', database_error: err });
                    return;
                }
                structureShiftdata(response);
            })
    }).catch((e) => { res.status(500).send({ message: 'Error', api_error: e.message }); });
});


router.get('/machine', async function (req, res) {
    const params = req.query;
    if (!params.site) {
        return res.status(400).json({ message: "Bad Request - Missing Parameters" });
    }
    function structureMachines(response) {
        const machines = utils.structureMachines(response);
        res.status(200).json(machines);
    }
    sqlQuery(`exec spLocal_EY_DxH_Get_Asset 'Cell','All',${params.site};`,
        (err, response) => {
            if (err) {
                console.log(err)
                res.status(500).send({ message: 'Error', database_error: err.message });
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
                message: e.message
            });
        }
        if (payload.body.sub) {
            let id = payload.body.user_id;
            let badge = payload.body.user_badge;
            let machine = payload.body.user_machine;
            sqlQuery(`exec dbo.sp_clocknumberlogin '${badge}', '${machine}'`,
                (err, data) => {
                    if (err) {
                        console.log(err);
                        res.status(500).send({ message: 'Error', database_error: err });
                        return;
                    }
                    let response = JSON.parse(Object.values(data)[0].GetDataByClockNumber);
                    if (response === null || response[0].id != id) {
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
    const site = req.query.site;
    if (!site) {
        return res.status(400).send("Bad Request - Missing parameters");
    }
    sqlQuery(`exec sp_getshifts ${site}`,
        (err, response) => {
            if (err) {
                console.log(err);
                res.status(500).send({ message: 'Error', database_error: err });
                return;
            }
            responseGet(response, req, res, 'GetShiftsBySite');
        });
})

router.get('/intershift_communication', async function (req, res) {
    const asset_code = req.query.mc;
    const production_day = moment(new Date(req.query.dt)).format('YYYY-MM-DD');
    const shift_id = req.query.sf;
    if (asset_code === undefined || production_day === undefined || shift_id === undefined) {
        return res.status(400).send("Bad Request - Missing parameters");
    }

    getAssetInfoPromise(asset_code).then(responseProm => {
        sqlQuery(`exec spLocal_EY_DxH_Get_InterShiftData ${responseProm[0].Asset.asset_id}, '${production_day}', ${shift_id};`,
            (err, response) => {
                if (err) {
                    console.log(err);
                    res.status(500).send({ message: 'Error', database_error: err });
                    return;
                }
                responseGet(response, req, res, 'InterShiftData');
            });
    }).catch((e) => { res.status(500).send({ message: 'Error', api_error: e.message }); });


});

router.post('/dxh_new_comment', async function (req, res) {
    const params = req.body;
    if (!params.comment) {
        return res.status(400).json({ message: "Bad Request - Missing Parameters" });
    }
    const asset_code = params.asset_code ? params.asset_code : undefined;
    const update = params.comment_id ? params.comment_id : 0;
    const timestamp = moment(new Date(params.timestamp)).format(format);
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
            getAssetInfoPromise(asset_code).then(responseProm => {
                sqlQuery(`exec dbo.spLocal_EY_DxH_Get_DxHDataId ${responseProm[0].Asset.asset_id}, '${row_timestamp}', 0;`,
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
    if (req.query.mc !== 'No Data') {
        getAssetInfoPromise(req.query.mc).then(responseProm => {
            sqlQuery(`Exec spLocal_EY_DxH_Get_DTReason ${responseProm[0].Asset.asset_id};`, (err, response) => {
                if (err) {
                    console.log(err);
                    res.status(500).send({ message: 'Error', database_error: err });
                    return;
                }
                responseGet(response, req, res, 'DTReason');
            }
            )
        });
    };
});

router.get('/dxh_data_id', async function (req, res) {
    const asset_code = req.query.asset_code ? req.query.asset_code : undefined;
    const timestamp = req.body.timestamp || moment().format('YYYY-MM-DD HH:MM:SS');
    const require_order_create = req.query.require_order_create ? 1 : 0;

    if (asset_code == undefined || timestamp == undefined) {
        return res.status(400).send("Missing parameters");
    }

    getAssetInfoPromise(asset_code).then(responseProm => {
        sqlQuery(`exec dbo.spLocal_EY_DxH_Get_DxHDataId ${responseProm[0].Asset.asset_id}, '${timestamp}', ${require_order_create};`,
            (err, response) => {
                if (err) {
                    console.log(err)
                    res.status(500).send({ message: 'Error', database_error: err });
                    return;
                }
                responseGet(response, req, res, 'GetDxHDataId');
            });
    });
});

router.put('/dt_data', async function (req, res) {
    let dxh_data_id = req.body.dxh_data_id ? parseInt(req.body.dxh_data_id) : undefined;
    const dt_reason_id = req.body.dt_reason_id ? parseInt(req.body.dt_reason_id) : undefined;
    const dt_minutes = req.body.dt_minutes ? parseFloat(req.body.dt_minutes) : undefined;
    const clocknumber = req.body.clocknumber;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const timestamp = moment(new Date(req.body.timestamp)).format(format);
    const update = req.body.dtdata_id ? parseInt(req.body.dtdata_id) : 0;
    const asset_code = req.body.asset_code ? req.body.asset_code : undefined;
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
            getAssetInfoPromise(asset_code).then(responseProm => {
                sqlQuery(`exec dbo.spLocal_EY_DxH_Get_DxHDataId ${responseProm[0].Asset.asset_id}, '${row_timestamp}', 0;`,
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
    const timestamp = moment(new Date(req.body.timestamp)).format(format);
    const update = req.body.inter_shift_id ? parseInt(req.body.inter_shift_id) : 0;
    const asset_code = req.body.asset_code ? req.body.asset_code : undefined;
    const row_timestamp = req.body.row_timestamp;

    if (comment === undefined) {
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
            getAssetInfoPromise(asset_code).then(responseProm => {
                sqlQuery(`exec dbo.spLocal_EY_DxH_Get_DxHDataId ${responseProm[0].Asset.asset_id}, '${row_timestamp}', 0;`,
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
    const timestamp = moment(new Date(req.body.timestamp)).format(format);
    const override = req.body.override ? req.body.override : 0;
    const row_timestamp = req.body.row_timestamp;
    const asset_code = req.body.asset_code;

    if (!clocknumber) {
        if (!(first_name || last_name)) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
    }

    if (dxh_data_id == undefined) {
        if (asset_code === undefined || asset_code === 'No Data') {
            return res.status(400).json({ message: "Bad Request - Missing asset_code parameter" });
        } else {
            getAssetInfoPromise(asset_code).then(responseProm => {
                sqlQuery(`exec dbo.spLocal_EY_DxH_Get_DxHDataId ${responseProm[0].Asset.asset_id}, '${row_timestamp}', 0;`,
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
    const timestamp = moment(new Date(req.body.timestamp)).format(format);
    const override = req.body.override ? req.body.override : 0;
    const row_timestamp = req.body.row_timestamp;
    const asset_code = req.body.asset_code;

    if (!clocknumber) {
        if (!(first_name || !last_name)) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
    }

    if (asset_code === undefined || asset_code === 'No Data') {
        return res.status(400).json({ message: "Bad Request - Missing asset_code parameter" });
    }

    sqlQuery(`exec dbo.sp_clocknumber_asset_login '${clocknumber}', '${asset_code}'`,
        (err, data) => {
            if (err) {
                console.log(err);
                res.status(500).send({ message: 'Error', database_error: err });
                return;
            }
            let response = JSON.parse(Object.values(data)[0].GetDataByClockNumberAsset);
            if (response === undefined || response === null) {
                var error = 'Incorrect Clocknumber'
                console.log(error);
                res.status(500).send({ message: 'Error', database_error: error });
                return;
            }
            const role = response[0].role;
            if (role === 'Supervisor') {
                if (dxh_data_id === undefined) {
                    getAssetInfoPromise(asset_code).then(responseProm => {
                        sqlQuery(`exec dbo.spLocal_EY_DxH_Get_DxHDataId ${responseProm[0].Asset.asset_id}, '${row_timestamp}', 0;`,
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
                    });
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
    const setup_scrap = req.body.setup_scrap ? req.body.setup_scrap != "signoff" ? parseFloat(req.body.setup_scrap) : 0 : undefined;
    const other_scrap = req.body.other_scrap ? req.body.other_scrap != "signoff" ? parseFloat(req.body.other_scrap) : 0 : undefined;
    const adjusted_actual = req.body.adjusted_actual ? req.body.adjusted_actual != "signoff" ? parseFloat(req.body.adjusted_actual) : 0 : undefined;
    const clocknumber = req.body.clocknumber;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const timestamp = moment(new Date(req.body.timestamp)).format(format);
    const override = req.body.override ? parseInt(req.body.override) : 0;
    const asset_code = req.body.asset_code ? req.body.asset_code : undefined;
    const row_timestamp = req.body.row_timestamp;

    if (actual === undefined || setup_scrap === undefined || other_scrap === undefined || adjusted_actual === undefined) {
        return res.status(400).json({ message: "Bad Request - Missing Parameters - Actual, Setup Scrap, Other Scrap or Adjusted Actual Undefined" });
    }
    if (!clocknumber) {
        if (!(first_name || last_name)) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters - No User Data" });
        }
    }

    if (dxh_data_id === undefined || dxh_data_id === null) {
        if (asset_code === undefined) {
            return res.status(400).json({ message: "Bad Request - Missing asset_code parameter" });
        } else {
            getAssetInfoPromise(asset_code).then(responseProm => {
                sqlQuery(`exec dbo.spLocal_EY_DxH_Get_DxHDataId ${responseProm[0].Asset.asset_id}, '${row_timestamp}', 0;`,
                    (err, data) => {
                        if (err) {
                            console.log(err);
                            res.status(500).send({ message: 'Error', database_error: err });
                            return;
                        }
                        let response = JSON.parse(Object.values(data)[0].GetDxHDataId);
                        dxh_data_id = response[0].dxhdata_id;
                        if (clocknumber) {
                            sqlQuery(`exec spLocal_EY_DxH_Put_ProductionData ${dxh_data_id}, ${actual}, ${setup_scrap}, ${other_scrap}, ${adjusted_actual}, '${clocknumber}', Null, Null, '${timestamp}', ${override};`,
                                (err, response) => {
                                    if (err) {
                                        console.log(err);
                                        res.status(500).send({ message: 'Error', database_error: err });
                                        return;
                                    }
                                    responsePostPut(response, req, res);
                                });
                        } else {
                            sqlQuery(`exec spLocal_EY_DxH_Put_ProductionData ${dxh_data_id}, ${actual}, ${setup_scrap}, ${other_scrap}, ${adjusted_actual}, Null, '${first_name}', '${last_name}', '${timestamp}', ${override};`,
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
            });
        }
    } else {
        if (clocknumber) {
            sqlQuery(`exec spLocal_EY_DxH_Put_ProductionData ${dxh_data_id}, ${actual}, ${setup_scrap}, ${other_scrap}, ${adjusted_actual}, '${clocknumber}', Null, Null, '${timestamp}', ${override};`,
                (err, response) => {
                    if (err) {
                        console.log(err);
                        res.status(500).send({ message: 'Error', database_error: err });
                        return;
                    }
                    responsePostPut(response, req, res);
                });
        } else {
            sqlQuery(`exec spLocal_EY_DxH_Put_ProductionData ${dxh_data_id}, ${actual}, ${setup_scrap}, ${other_scrap}, ${adjusted_actual}, Null, '${first_name}', '${last_name}', '${timestamp}', ${override};`,
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

    getAssetInfoPromise(asset_code).then(responseProm => {
        sqlQuery(`exec spLocal_EY_DxH_Get_OrderData ${responseProm[0].Asset.asset_id}, '${order_number}', ${is_current_order};`,
            (err, response) => {
                if (err) {
                    console.log(err);
                    res.status(500).send({ message: 'Error', database_error: err });
                    return;
                }
                responseGet(response, req, res, 'OrderData');
            });
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
    if (params.order_number === undefined || params.asset_code === undefined || params.timestamp === undefined) {
        return res.status(400).json({ message: "Bad Request - Missing Parameters" });
    }
    getAssetInfoPromise(asset_code).then(responseProm => {
        sqlQuery(`exec dbo.spLocal_EY_DxH_Get_OrderData${responseProm[0].Asset.asset_id},'${params.order_number}', 0`,
            (err, data) => {
                if (err) {
                    console.log(err);
                    res.status(500).send({ message: 'Error', database_error: err });
                    return;
                }
                let response = JSON.parse(Object.values(data)[0].OrderData);
                const orderId = response[0].OrderData.order_id;
                if (orderId === null || orderId === undefined) {
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
                        if (error || body) {
                            res.status(500).send({ message: 'Error', jtrax_error: error });
                            return;
                        }
                        if (resp.statusCode >= 400) {
                            res.status(500).send({ message: 'Error', jtrax_error: error, body: body });
                            return;
                        }
                        res.status(200).json(response);
                        return;
                    });
                } else {
                    res.status(200).json(response);
                    return;
                }
            });
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

    getAssetInfoPromise(asset_code).then(async responseProm => {
        const query = "select [product_id], [product_code], [product_name], [product_description], [product_family], [value_stream], " +
            "[grouping1], [grouping2], [grouping3], [grouping4], [grouping5], [status], [entered_by], [entered_on], [last_modified_by], " +
            "[last_modified_on] From [dbo].[Product] Where product_code = '" + part_number + "';";

        const queryInsertNewProduct = `exec dbo.sp_importproducts '${part_number}', '${part_number}', '${part_number}', '', '', '', '', 
        '', '', '', 'Active', 'SQL manual entry', '${moment.utc().format('YYYY-MM-DD HH:MM')}';`;

        const queryCreateOrder = clocknumber ? `exec dbo.spLocal_EY_DxH_Create_OrderData ${responseProm[0].Asset.asset_id}, '${part_number}', ${order_quantity}, '${uom_code}', 
        ${routed_cycle_time}, ${setup_time}, ${target}, '${production_status}', '${clocknumber}', Null, Null;` :
            `exec dbo.spLocal_EY_DxH_Create_OrderData ${responseProm[0].Asset.asset_id}, '${part_number}', ${order_quantity}, '${uom_code}', ${routed_cycle_time}, ${setup_time}, 
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
            res.status(500).send({ message: 'Error', api_error: e.message });
        }
    });

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

router.get('/uom_asset', async function (req, res) {
    let params = req.query;
    if (!params.mc) {
        return res.status(400).json({ message: "Bad Request - Missing Parameters" });
    }
    sqlQuery(`select top 1 a.asset_id, o.uom_code, u.decimals from asset a 
    join orderdata o on a.asset_code = '${params.mc}' and a.asset_id = o.asset_id join uom u on o.uom_code = u.uom_code;`,
        (err, response) => {
            if (err) {
                console.log(err);
                res.status(500).send({ message: 'Error', database_error: err });
                return;
            }
            res.status(200).json(response);
        });
});

router.get('/user_sites', async function (req, res) {
    let params = req.query;
    if (!params.clock_number) {
        return res.status(400).json({ message: "Bad Request - Missing Parameters" });
    }
    sqlQuery(`exec dbo.sp_get_users_by_badge '${params.clock_number}';`,
        (err, response) => {
            if (err) {
                console.log(err);
                res.status(500).send({ message: 'Error', database_error: err });
                return;
            }
            responseGet(response, req, res, 'GetUsersByBadge');
        });
});


router.get('/user_info_login_by_site', async function (req, res) {
    let params = req.query;
    if (!params.user_id) {
        return res.status(400).json({ message: "Bad Request - Missing Parameters" });
    }
    sqlQuery(`exec dbo.sp_user_id_login ${params.user_id};`,
        (err, response) => {
            if (err) {
                console.log(err);
                res.status(500).send({ message: 'Error', database_error: err });
                return;
            }
            responseGet(response, req, res, 'GetDataById');
        });
});

router.get('/timelost_dxh_data', async function (req, res) {
    if (!req.query.dxh_data_id) {
        return res.status(400).json({ message: "Bad Request - Missing Parameters" });
    }
    if (req.query.dxh_data_id) {
        sqlQuery(`Exec spLocal_EY_DxH_Get_DTData_By_DxHData_Id ${req.query.dxh_data_id};`, (err, response) => {
            if (err) {
                console.log(err);
                res.status(500).send({ message: 'Error', database_error: err });
                return;
            }
            res.status(200).json(response);
        }
        )
    };
});

router.get('/comments_dxh_data', async function (req, res) {
    if (!req.query.dxh_data_id) {
        return res.status(400).json({ message: "Bad Request - Missing Parameters" });
    }
    if (req.query.dxh_data_id) {
        sqlQuery(`Exec spLocal_EY_DxH_Get_CommentData_By_DxHData_Id ${req.query.dxh_data_id};`, (err, response) => {
            if (err) {
                console.log(err);
                res.status(500).send({ message: 'Error', database_error: err });
                return;
            }
            res.status(200).json(response);
        }
        )
    };
});

module.exports = router;
