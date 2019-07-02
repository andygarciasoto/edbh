var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/data', function(req, res, next) {
  // res.json({users: [{name: 'Timmy'}]});
  const data = [];
  // have two repeated shift hours
});

module.exports = router;

// data
// machines
// http://localhost:3001/?machine=23123&date=12/12/12&sf=1
// comments receives: order number - returns: comments from that order
// observations: receives machine number + shift + date - returns: comments
// ideal: receives: order number and ideal number - updates: ideal number

router.get('/data', function(req, res, next) {
  // res.json({users: [{name: 'Timmy'}]});
  const params = req.params;
  const data = [];
  // have two repeated shift hours
});