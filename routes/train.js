var express = require('express');
var router = express.Router();
const { DateTime } = require("luxon");

const tiplocQuerying = require('../src/tiplocQuerying.js');
const scheduleQuerying = require('../src/scheduleQuerying.js');
const scheduleFormatting = require('../src/scheduleFormatting.js');
const associationQuerying = require('../src/associationQuerying.js');
const associationFormatting = require('../src/associationFormatting.js');
const movementQuerying = require('../src/movementQuerying.js');
const movementFormatting = require('../src/movementFormatting.js');

router.get(
  '/:uid/:year/:month/:day'
  , (req, res) => {

    let when = DateTime.fromObject({
      year: parseInt(req.params.year),
      month: parseInt(req.params.month),
      day: parseInt(req.params.day),
    });
    
    scheduleQuerying.getScheduleByUID(req.params.uid, when)
      .then(schedules => scheduleFormatting.filterValidRunningDaysFromSchedules(schedules))
      .then(schedules => scheduleFormatting.filterValidSTPIndicatorsFromSchedules(schedules))
      .then(schedules => associationQuerying.getAssociationsFromSchedules(schedules, when))
      .then(schedules => associationFormatting.filterValidRunningDaysFromSchedules(schedules))
      .then(schedules => associationFormatting.filterValidSTPIndicatorsFromSchedules(schedules))
      .then(schedule => scheduleQuerying.getAssociationSchedules(schedule, when))

      .then(schedules => movementQuerying.getTrainMovementIdFromSchedules(schedules, when))
      .then(schedules => movementQuerying.getTrainMovementsFromSchedules(schedules, when))
      .then(schedules => movementFormatting.performHeuristicsFromSchedules(schedules))
      .then(schedules => scheduleFormatting.createJourneyBoard(schedules))
      .then(schedule => res.send(schedule))
      .catch(err => {console.log(err); res.status(err.status || 500).send(err);});

  });
  
module.exports = router;