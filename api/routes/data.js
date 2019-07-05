var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/data/:id', function (req, res) {
    const id = parseInt(req.params.id);
    if (id == 1232) {
        const data = [{
            Expander: true,
            shift: '11:00 pm - 12:00 am',
            part_number: '1111111',
            ideal: '100',
            target_pcs: '75',
            actual_pcs: '77',
            cumulative_pcs: '77',
            downtime: '10',
            downtime_reason_code: '124',
            actions_comments: 'Something Happened Here',
            oper_id: 'SW',
            superv_id: 'DS',
        }, {
            shift: '12:00 am - 01:00 am',
            part_number: '1111112',
            ideal: '100',
            target_pcs: '73',
            actual_pcs: '71',
            cumulative_pcs: '74',
            downtime: '08',
            downtime_reason_code: '124',
            actions_comments: 'Woops Something Broke',
            oper_id: 'RF',
            superv_id: 'DF',
        }, {
            shift: '11:00 pm - 12:00 am',
            part_number: '1111113',
            ideal: '100',
            target_pcs: '74',
            actual_pcs: '72',
            cumulative_pcs: '75',
            downtime: '09',
            downtime_reason_code: '124',
            actions_comments: 'Something Is Going On',
            oper_id: 'JS',
            superv_id: 'AV',
        }, {
            shift: '01:00 am - 02:00 am',
            part_number: '1111113',
            ideal: '100',
            target_pcs: '72',
            actual_pcs: '70',
            cumulative_pcs: '73',
            downtime: '04',
            downtime_reason_code: '124',
            actions_comments: 'It Seems We Are Under A Situation',
            oper_id: 'GA',
            superv_id: 'AV',
        }, {
            shift: '03:00 am - 04:00 am',
            part_number: '1111114',
            ideal: '100',
            target_pcs: '79',
            actual_pcs: '70',
            cumulative_pcs: '72',
            downtime: '02',
            downtime_reason_code: '124',
            actions_comments: 'Everything Is Alright',
            oper_id: 'BM',
            superv_id: 'AV',
        }];
        res.json(data);
    } else {
        res.send('Machine number is not valid');
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
                "value": "Shift 1"
            },
            {
                "value": "Shift 2"
            },
            {
                "value": "Shift 3"
            },
            {
                "value": "All Shifts"
            }
        ]
    }];
    res.json(shifts);
});
module.exports = router;

// data
// machines
// http://localhost:3001/?machine=23123&date=12/12/12&sf=1
// comments receives: order number - returns: comments from that order
// observations: receives machine number + shift + date - returns: comments
// ideal: receives: order number and ideal number - updates: ideal number


/*
router.get('/data', function(req, res, next) {
  // res.json({users: [{name: 'Timmy'}]});
  const params = req.params;
  const data = [];
  // have two repeated shift hours
}); */