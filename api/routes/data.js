var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/data', function(req, res, next) {
  // res.json({users: [{name: 'Timmy'}]});
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
   },{
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
   }];
   res.json(data);
  // have two repeated shift hours
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