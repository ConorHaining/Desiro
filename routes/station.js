const express = require('express');
const router = express.Router();
const es = require('../inc/elasticsearch.js');
const { DateTime } = require("luxon");

const tiplocQuerying = require('../src/tiplocQuerying.js');
const scheduleQuerying = require('../src/scheduleQuerying.js');
const scheduleFormatting = require('../src/scheduleFormatting.js');
const associationQuerying = require('../src/associationQuerying.js');
const associationFormatting = require('../src/associationFormatting.js');
const movementQuerying = require('../src/movementQuerying.js');
const movementFormatting = require('../src/movementFormatting.js');
const elasticFormatting = require('../src/elasticFormatting.js');
const direction = require('../data/direction.js');

router.get(
    ['/:stationCode/:direction/:year/:month/:day/:time',
     '/:stationCode/:direction/']
    , (req, res) => {
        const crs = req.params.stationCode.toUpperCase();
        let time;
        if (req.params.time) {
            time = DateTime.fromObject({
                year: parseInt(req.params.year),
                month: parseInt(req.params.month),
                day: parseInt(req.params.day),
                hour: parseInt(req.params.time.substring(0,2)),
                minute: parseInt(req.params.time.substring(2,4)),
            })
        } else {
            time = DateTime.local();
        }

        let directionMode;
        if(req.params.direction === 'departures') {
            directionMode = direction.DEPARTURES;
        } else if(req.params.direction === 'arrivals') {
            directionMode = direction.ARRIVALS;
        } else {
            res.status(400).send({'message': 'Invalid Direction', 'status': 400, 'details': `Direction given: ${req.params.direction}`});
        }

        if(time.isValid) {
            const tiploc = tiplocQuerying.getTiploc(crs);
                tiploc.then(tiploc => scheduleQuerying.getUIDsForTiploc(tiploc, time))
                .then(uids => scheduleQuerying.getSchedulesFromUIDs(uids, time))
                .then(schedules => scheduleFormatting.filterValidRunningDaysFromSchedules(schedules, time))
                .then(schedules => scheduleFormatting.filterValidSTPIndicatorsFromSchedules(schedules))
                .then(schedules => scheduleFormatting.filterValidTiplocFromSchedules(schedules, directionMode, Promise.resolve(tiploc)))
                .then(schedules => movementQuerying.getTrainMovementIdFromSchedules(schedules, time))
                .then(schedules => movementQuerying.getTrainMovementsFromSchedules(schedules, time))
                .then(schedules => movementFormatting.performHeuristicsFromSchedules(schedules))
                .then(schedules => movementFormatting.calculatePredictedTimeFromSchedules(schedules))
                .then(schedules => associationQuerying.getAssociationsFromSchedules(schedules, time))
                .then(schedules => associationFormatting.filterValidRunningDaysFromSchedules(schedules))
                .then(schedules => associationFormatting.filterValidSTPIndicatorsFromSchedules(schedules))
                .then(schedules => scheduleQuerying.getAssociationSchedules(schedules, time))
                .then(schedules => scheduleFormatting.createStationBoard(schedules, directionMode, crs))
                .then(board => res.send(board))
                .catch(err => res.status(500).send(err));
        } else {
            res.status(400).send({'message': 'Invalid DateTime', 'status': 400, 'details': time.invalidExplanation});
        }


 
  });
  
router.get(
    '/list'
    , (req, res) => {
        res.send('Hello World');
});

module.exports = router;