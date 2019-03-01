const express = require('express');
const router = express.Router();
const es = require('../inc/elasticsearch.js');

const tiplocQuerying = require('../src/tiplocQuerying.js');
const scheduleQuerying = require('../src/scheduleQuerying.js');
const scheduleFormatting = require('../src/scheduleFormatting.js');
const associationQuerying = require('../src/associationQuerying.js');
const associationFormatting = require('../src/associationFormatting.js');
const direction = require('../data/direction.js');

router.get(
    ['/:stationCode/departures/:year/:month/:day/:time',
     '/:stationCode/departures/']
    , (req, res) => {

        const crs = req.params.stationCode;

        tiplocQuerying.getTiploc(crs)
            .then(tiploc => scheduleQuerying.getSchedulesForTiploc(tiploc, when))
            .then(schedules => scheduleFormatting.filterValidRunningDaysFromSchedules(schedules))
            .then(schedules => scheduleFormatting.filterValidSTPIndicatorsFromSchedules(schedules))
            .then(schedules => associationQuerying.getAssociationsFromSchedules(schedules))
            .then(schedules => associationFormatting.filterValidRunningDaysFromSchedules(schedules))
            .then(schedules => associationFormatting.filterValidSTPIndicatorsFromSchedules(schedules))
            .then(schedules => scheduleQuerying.getAssociationSchedules(schedules))
            .then(schedules => scheduleFormatting.createStationBoard(schedules, direction.DEPARTURES))
            .then(board => res.send(board))
            .catch(err => res.status(err.status).send(err));

 
  });
  
router.get(
    ['/:stationCode/arrivals/:year/:month/:day/:time',
    '/:stationCode/arrivals/']
    , (req, res) => {

});

router.get(
    '/list'
    , (req, res) => {
        res.send('Hello World');
});

module.exports = router;