var express = require('express');
var router = express.Router();
var cors = require('cors');

var corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200 
  }

router.get('/'), function(req, res) {
    res.send({response: 'Welcome to the Parker Hannifin DBH API'});
}
router.get('/data', cors(corsOptions), function (req, res) {
    const mc = parseInt(req.query.mc);
    if (mc == 12532) {
        const data = [{
            Expander: true,
            shift: '11:00 pm - 12:00 am',
            part_number: '1111111',
            ideal: '100',
            target_pcs: '75',
            actual_pcs: '77',
            cumulative_target_pcs: '46',
            cumulative_pcs: '77',
            timelost: '10',
            timelost_reason_code: '124',
            cumulative_target_pcs: '32',
            actions_comments: 'Something Happened Here',
            oper_id: 'SW',
            superv_id: 'DS',
        }, {
            shift: '12:00 am - 01:00 am',
            part_number: '1111112',
            ideal: '100',
            target_pcs: '73',
            actual_pcs: '71',
            cumulative_target_pcs: '47',
            cumulative_pcs: '74',
            timelost: '08',
            timelost_reason_code: '124',
            cumulative_target_pcs: '22',
            actions_comments: 'Woops Something Broke',
            oper_id: 'RF',
            superv_id: 'DF',
        }, {
            shift: '11:00 pm - 12:00 am',
            part_number: '1111113',
            ideal: '100',
            target_pcs: '74',
            actual_pcs: '72',
            cumulative_target_pcs: '48',
            cumulative_pcs: '75',
            timelost: '',
            timelost_reason_code: '124',
            actions_comments: '',
            oper_id: 'JS',
            superv_id: 'AV',
        }, {
            shift: '01:00 am - 02:00 am',
            part_number: '1111113',
            ideal: '100',
            target_pcs: '72',
            actual_pcs: '70',
            cumulative_target_pcs: '49',
            cumulative_pcs: '73',
            timelost: '',
            timelost_reason_code: '124',
            cumulative_target_pcs: '11',
            actions_comments: 'It seems we have a situation over here',
            oper_id: 'GA',
            superv_id: 'AV',
        }, {
            shift: '02:00 am - 03:00 am',
            part_number: '1111114',
            ideal: '100',
            target_pcs: '79',
            actual_pcs: '70',
            cumulative_target_pcs: '50',
            cumulative_pcs: '72',
            timelost: '02',
            timelost_reason_code: '124',
            actions_comments: '',
            oper_id: 'BM',
            superv_id: 'AV',
        }];
        res.json(data);
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