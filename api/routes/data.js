var express = require('express');
var router = express.Router();
var cors = require('cors');
var sqlQuery = require('../objects/sqlConnection');
var oldDummy = require('./oldDummy.json');
var dummy = require('./dummyPredictions.json')
var newDummy = require('./newDummy.json');
var utils = require('../objects/utils');

var corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200 
  }

router.get('/'), function(req, res) {
    res.send({response: 'Welcome to the Parker Hannifin DBH API'});
}
router.get('/data', cors(corsOptions), function (req, res) {
    sqlQuery('SELECT * FROM Shift;');
    const structuredObject = utils.restructureSQLObject(dummy, 'format2');
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
});

router.get('/machines', function (req, res) {
    const machines = [{
        "machines": [
            {
                "value": 12395
            },
            {
                "value": 23421
            },
            {
                "value": 23425
            },
            {
                "value": 63433
            }
        ]
    }];
    res.json(machines);
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

router.get('/intershift_communication', cors(corsOptions), function (req, res) {
    const mc = parseInt(req.query.mc);
    const sf = parseInt(req.query.sf);

    if (mc == 12532 & sf == 1) {
        const data = [{
            user: 'Ryan',
            comment: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud.',
            role: 'Supervisor',
            timestamp: '19/07/2019 - 14:23'
        },
        {
            user: 'John',
            comment: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud.',
            role: 'Operator',
            timestamp: '20/07/2019 - 14:29'
        },
        {
            user: 'Susan',
            comment: 'Lorem ipsum dolor sit amet.',
            role: 'Operator',
            timestamp: '16/07/2019 - 11:56'
        }
    ];
        res.json(data);
    }else if (mc == 12532 & sf == 2){
        const data = [{
            user: 'Mark',
            comment: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud.',
            role: 'Supervisor',
            timestamp: '19/07/2019 - 10:29'
        },
        {
            user: 'Matt',
            comment: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud.',
            role: 'Operator',
            timestamp: '20/07/2019 - 22:00'
        },
        {
            user: 'Shawn',
            comment: 'Lorem ipsum dolor sit amet.',
            role: 'Operator',
            timestamp: '16/07/2019 - 17:06'
        }
    ];
    res.json(data);
}else if (mc == 12532 & sf == 3){
    const data = [{
        user: 'James',
        comment: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud.',
        role: 'Supervisor',
        timestamp: '19/07/2019 - 15:26'
    },
    {
        user: 'Ana',
        comment: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud.',
        role: 'Operator',
        timestamp: '20/07/2019 - 04:21'
    }
];
res.json(data);
}else if (mc == 12395 & sf == 1){
    const data = [{
        user: 'Lorena',
        comment: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud.',
        role: 'Supervisor',
        timestamp: '19/07/2019 - 07:04'
    },
    {
        user: 'Andrew',
        comment: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud.',
        role: 'Operator',
        timestamp: '20/07/2019 - 21:56'
    },
    {
        user: 'Josh',
        comment: 'Lorem ipsum dolor sit amet.',
        role: 'Operator',
        timestamp: '16/07/2019 - 10:20'
    }
];
res.json(data);
} else{
    res.send('Invalid parameters');
}

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