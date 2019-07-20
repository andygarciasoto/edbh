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
            shift: '9:00 pm - 10:00 am',
            part_number: '2hj11111893k234',
            ideal: '100',
            target_pcs: '75',
            actual_pcs: '66',
            cumulative_target_pcs: '75',
            cumulative_pcs: '77',
            timelost: '10',
            timelost_reason_code: '124',
            actions_comments: 'I found a defect, have to speak to a supervisor before proceeding',
            oper_id: 'SW',
            superv_id: 'DS',
            color: 'pattern-red',
        }, {
            Expander: true,
            shift: '10:00 pm - 11:00 am',
            part_number: '2hj11111893k234',
            ideal: '100',
            target_pcs: '75',
            actual_pcs: '72',
            cumulative_target_pcs: '75',
            cumulative_pcs: '77',
            timelost: '10',
            timelost_reason_code: '124',
            actions_comments: 'I found a defect, have to speak to a supervisor before proceeding',
            oper_id: 'SW',
            superv_id: 'DS',
            color: 'pattern-red',
        }, {
            Expander: true,
            shift: '11:00 pm - 12:00 am',
            part_number: '2hj4idh5893k234',
            ideal: '100',
            target_pcs: '75',
            actual_pcs: '55',
            cumulative_target_pcs: '75',
            cumulative_pcs: '77',
            timelost: '10',
            timelost_reason_code: '124',
            actions_comments: 'Something Happened Here',
            oper_id: 'SW',
            superv_id: 'DS',
            color: 'pattern-red',
        }, {
            shift: '12:00 am - 01:00 pm',
            part_number: '49242j438f2413k',
            ideal: '100',
            target_pcs: '72',
            actual_pcs: '71',
            cumulative_target_pcs: '148',
            cumulative_pcs: '148',
            timelost: '08',
            timelost_reason_code: '124',
            actions_comments: 'Woops Something Broke',
            oper_id: 'RF',
            superv_id: 'DF',
            color: 'pattern-red',
        }, {
            shift: '11:00 pm - 12:00 am',
            part_number: '0493847jkd38frj2',
            ideal: '100',
            target_pcs: '74',
            actual_pcs: '45',
            cumulative_target_pcs: '222',
            cumulative_pcs: '220',
            timelost: '',
            timelost_reason_code: '124',
            actions_comments: '',
            oper_id: 'JS',
            superv_id: 'AV',
            color: 'pattern-red',
        }, {
            shift: '01:00 am - 02:00 pm',
            part_number: '294jdl4855349dd',
            ideal: '100',
            target_pcs: '72',
            actual_pcs: '72',
            cumulative_target_pcs: '294',
            cumulative_pcs: '290',
            timelost: '',
            timelost_reason_code: '124',
            actions_comments: 'It seems we have a situation over here',
            oper_id: 'GA',
            superv_id: 'AV',
            color: 'pattern-red',
        }, {
            shift: '02:00 am - 03:00 pm',
            part_number: 'al3924850284234',
            ideal: '100',
            target_pcs: '70',
            actual_pcs: '70',
            cumulative_target_pcs: '364',
            cumulative_pcs: '360',
            timelost: '02',
            timelost_reason_code: '124',
            actions_comments: '',
            oper_id: 'BM',
            superv_id: 'AV',
            color: 'pattern-red',
        }, {
            shift: '02:00 am - 03:00 pm',
            part_number: 'al39233333334234',
            ideal: '100',
            target_pcs: '70',
            actual_pcs: '70',
            cumulative_target_pcs: '364',
            cumulative_pcs: '360',
            timelost: '02',
            timelost_reason_code: '124',
            actions_comments: '',
            oper_id: 'BM',
            superv_id: 'AV',
            color: 'pattern-green',
        }, {
            shift: '02:00 am - 03:00 pm',
            part_number: 'al39555555584234',
            ideal: '100',
            target_pcs: '70',
            actual_pcs: '70',
            cumulative_target_pcs: '364',
            cumulative_pcs: '360',
            timelost: '02',
            timelost_reason_code: '124',
            actions_comments: 'There is a raccoon stuck in the fan',
            oper_id: 'BM',
            superv_id: 'AV',
            color: 'pattern-red',
        }, {
            shift: '03:00 am - 04:00 pm',
            part_number: 'al3924850111211',
            ideal: '100',
            target_pcs: '75',
            actual_pcs: '78',
            cumulative_target_pcs: '439',
            cumulative_pcs: '430',
            timelost: '02',
            timelost_reason_code: '124',
            actions_comments: '',
            oper_id: 'BM',
            superv_id: 'AV',
            color: 'pattern-red',

        }, {
            shift: '04:00 am - 05:00 pm',
            part_number: 'al3924850111211',
            ideal: '101',
            target_pcs: '75',
            actual_pcs: '87',
            cumulative_target_pcs: '439',
            cumulative_pcs: '430',
            timelost: '02',
            timelost_reason_code: '124',
            actions_comments: '',
            oper_id: 'BM',
            superv_id: 'AV',
            color: 'pattern-red',
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