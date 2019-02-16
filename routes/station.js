var express = require('express');
var router = express.Router();

router.get(
    ['/:stationCode/departures/:year/:month/:day/:time',
     '/:stationCode/departures/']
    , (req, res) => {
  
  });
  
router.get(
    ['/:stationCode/arrivals/:year/:month/:day/:time',
    '/:stationCode/arrivals/']
    , (req, res) => {

});

router.get(
    '/list'
    , (req, res) => {

});

module.exports = router;