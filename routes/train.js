var express = require('express');
var router = express.Router();

const tiplocQuerying = require('../src/tiplocQuerying.js');
const scheduleQuerying = require('../src/scheduleQuerying.js');
const scheduleFormatting = require('../src/scheduleFormatting.js');
const associationQuerying = require('../src/associationQuerying.js');
const associationFormatting = require('../src/associationFormatting.js');
const movementQuerying = require('../src/movementQuerying.js');
const movementFormatting = require('../src/movementFormatting.js');

router.get(
  '/:UID/:year/:month/:day'
  , (req, res) => {
    
    scheduleQuerying.getScheduleByUID(uid, when)
      .then(schedules => scheduleFormatting.filterValidRunningDaysFromSchedules(schedules))
      .then(schedules => scheduleFormatting.filterValidSTPIndicatorsFromSchedules(schedules))
      .then(schedule => associationQuerying.getAssociationsFromUID(schedule))
      .then(schedule => associationFormatting.filterValidRunningDaysFromSchedules(schedule))
      .then(schedule => associationFormatting.filterValidSTPIndicatorsFromSchedules(schedule))
      .then(schedule => scheduleQuerying.getAssociationSchedules(schedule))

      .then(schedule => movementQuerying.getTrainMovementId(schedule))
      .then(schedule => movementQuerying.getTrainMovements(schedule))
      .then(schedule => movementFormatting.performHeuristics(schedule))
      .then(schedule => movementFormatting.createBasicMovementData(schedule))
      .then(schedule => scheduleFormatting.createBasicScheduleData(schedule))
      .then(schedule => res.send(schedule))
      .catch(err => res.status(err.status).send(err));

  });
  
module.exports = router;