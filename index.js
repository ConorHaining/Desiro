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
app.get(
  ['/station/:stationCode/departures/:year/:month/:day/:time',
   '/station/:stationCode/departures/']
  , (req, res) => {

});

app.get(
  ['/station/:stationCode/arrivals/:year/:month/:day/:time',
   '/station/:stationCode/arrivals/']
  , (req, res) => {

});

app.get(
  '/station/list'
  , (req, res) => {

});

/**
 * Train
 */
app.get('/train/:UID/:year/:month/:day', (req, res) => {
  
});

module.exports.handler = serverless(app);