const serverless = require('serverless-http')
const express = require('express')
const app = express()
const { DateTime } = require("luxon");

const elasticsearch = require('elasticsearch')
const client = new elasticsearch.Client({
    host: process.env.esHost || 'http://localhost:9200',
});

/**
 * Route Register
 */
const stationRoutes = require('./routes/station.js');
const trainRoutes = require('./routes/train.js')

app.use('/station', stationRoutes);
app.use('/train', trainRoutes);

module.exports.handler = serverless(app);