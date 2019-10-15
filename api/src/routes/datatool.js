var express = require('express');
import jwt from 'jsonwebtoken';
var router = express.Router();
var nJwt = require('njwt');
var sqlQuery = require('../objects/sqlConnection');
import config from '../../config.json';
import cors from 'cors';
var request = require('request');
var localStorage = require('localStorage');

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

router.put('/import_asset', async function (req, res) {
    const params = req.body;
    if (!params.file){
        return res.status(400).json({ message: "Bad Request - Missing Excel file to import" });
    }
    const file = params.file;
    return res.status(200).send('Excel File ' + file + ' Entered Succesfully');
});

module.exports = router;