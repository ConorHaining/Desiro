const serverless = require('serverless-http')
const express = require('express')
const app = express()
const { DateTime } = require("luxon");

const elasticsearch = require('elasticsearch')
const client = new elasticsearch.Client({
    host: process.env.esHost || 'http://localhost:9200',
});

const scheduleFormatting = require('./scheduleFormatting.js');
const scheduleQuerying = require('./scheduleQuerying.js')(client);
/*
 * Station
 */

app.get('/station/:stationCode/departures', (req, res) => {

  let now = DateTime.local().setLocale('en-GB');
  let later = now.plus({hours: 2});

  scheduleQuerying.getTiplocByCRS(req.params.stationCode)
    .catch((err) => {res.status(404).send(err);})

    .then(tiploc => scheduleQuerying.getValidSchedulesFromLocation(tiploc, 'public_departure', now, later))
    .catch((err) => {res.status(500).send(err);})

    .then(schedules => scheduleFormatting.formatBoard(schedules, {board: "departure", tiploc: tiploc}))
    .then((board) => {res.send(board)});
  

});

app.get('/station/:stationCode/arrivals', (req, res) => {

  let now = DateTime.local().setLocale('en-GB');
  let later = now.plus({hours: 2});

  scheduleQuerying.getTiplocByCRS(req.params.stationCode)
    .catch((err) => {res.status(404).send(err);})

    .then(tiploc => scheduleQuerying.getValidSchedulesFromLocation(tiploc, 'public_arrival', now, later))
    .catch((err) => {res.status(500).send(err);})

    .then(schedules => scheduleFormatting.formatBoard(schedules, {board: 'arrival', tiploc: tiploc}))
    .then((board) => {res.send(board)});

});

/**
 * Train
 */

app.get('/train/:UID/:year/:month/:day', (req, res) => {
  
  let date = req.params.day + '/' + 
                req.params.month + '/' +
                req.params.year;

  date = DateTime.fromFormat(date, 'dd/MM/yyyy');
  const today = date.toFormat('dd/MM/yyyy');
  const tomorrow = date.plus({days: 1}).toFormat('dd/MM/yyyy');
  let validSchedule = null;

  scheduleQuerying.getSpecificTrainSchedule(req.params.UID, today)
    .then(schedules => scheduleFormatting.applicableSchedule(schedules))
    .then(schedule => {
      validSchedule = schedule;
      scheduleQuerying.getTrainID(schedule, today, tomorrow)
    })
    .then(trainID => scheduleQuerying.getSpecificTrainMovements(trainID, today, tomorrow))
    .then(movements => scheduleFormatting.combineMovements(validSchedule, movements))
    .then(schedule => scheduleFormatting.thinLocationRecords(schedule))
    .then(schedule => res.send(schedule))
    .catch(err => res.status(err.status).send(err));

});

module.exports.handler = serverless(app);