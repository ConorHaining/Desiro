const serverless = require('serverless-http')
const express = require('express')
const app = express()
const elasticsearch = require('elasticsearch')
const { DateTime } = require("luxon");
const scheduleFormatting = require('./scheduleFormatting.js');

let client = new elasticsearch.Client({
  host: 'localhost:9200',
});


app.get('/', function (req, res) {

  res.send('Hello World!')

})

/*
 * Station
 */

app.get('/station/:stationCode/departures', (req, res) => {

  let now = DateTime.local().setLocale('en-GB');
  console.log(now.toFormat('HH:mm:ss'));
  let later = now.plus({hours: 2});

  client.search({
    index: "tiploc",
    body: {
      "query": {
        "match": {
          "crs": req.params.stationCode
        }
      }
    }
  }).then((body) => {
    let result = body.hits.hits;

    console.log(result);
    let tiploc = result[0]._source.code;

    return tiploc;
  }).then((tiploc) => {
    
    client.search({
      index: "schedule",
      body: {
        size: 40,
        sort: [
          {
            "location_records.public_departure": {
              order: "asc",
              nested: {
                path: "location_records",
                filter: {
                  term: {
                    "location_records.tiploc": tiploc
                  }
                }
              }
            }
          }
        ],
        query: {
          bool:
          {
            must: [
              {
                nested: {
                  path: "location_records",
                  query: {
                    bool: {
                      must: [
                        {
                          range: {
                            "location_records.public_departure": {
                              format: "HH:mm:ss",
                              gte: now.toFormat('HH:mm:ss'),
                              lte: later.toFormat('HH:mm:ss')
                            }
                          }
                        },
                        {
                          term: {
                            "location_records.tiploc": tiploc
                          }
                        }
                      ]
                    }
                  }
                }
              },
              {
                range: {
                  "start_date": {
                    lte: now.toFormat('D'),
                    format: "d/M/y"
                  }
                }
              },
              {
                range: {
                  "end_start": {
                    gte: now.toFormat('D'),
                    format: "d/M/y"
                  }
                }
              }
            ]
          }
        }
      }
    }).then((body) => {
      let results = body.hits.hits;
      let board = scheduleFormatting.formatBoard(results, {board: "departure", tiploc: tiploc});
      res.send(board);
    })
    

  });

});

app.get('/station/:stationCode/arrivals', (req, res) => {

  let now = DateTime.local().setLocale('en-GB');
  console.log(now.toFormat('HH:mm:ss'));
  let later = now.plus({hours: 2});

  client.search({
    index: "tiploc",
    body: {
      "query": {
        "match": {
          "crs": req.params.stationCode
        }
      }
    }
  }).then((body) => {
    let result = body.hits.hits;
    let tiploc = result[0]._source.code;

    return tiploc;
  }).then((tiploc) => {
    
    client.search({
      index: "schedule",
      body: {
        size: 40,
        sort: [
          {
            "location_records.public_arrival": {
              order: "asc",
              nested: {
                path: "location_records",
                filter: {
                  term: {
                    "location_records.tiploc": tiploc
                  }
                }
              }
            }
          }
        ],
        query: {
          bool:
          {
            must: [
              {
                nested: {
                  path: "location_records",
                  query: {
                    bool: {
                      must: [
                        {
                          range: {
                            "location_records.public_arrival": {
                              format: "HH:mm:ss",
                              gte: now.toFormat('HH:mm:ss'),
                              lte: later.toFormat('HH:mm:ss')
                            }
                          }
                        },
                        {
                          term: {
                            "location_records.tiploc": tiploc
                          }
                        }
                      ]
                    }
                  }
                }
              },
              {
                range: {
                  "start_date": {
                    lte: "now"
                  }
                }
              },
              {
                range: {
                  "end_start": {
                    gte: "now"
                  }
                }
              }
            ]
          }
        }
      }
    }).then((body) => {
      let results = body.hits.hits;
      let board = scheduleFormatting.formatBoard(results, {board: "arrival", tiploc: tiploc});
      res.send(board);
    })
    

  });

});

/**
 * Train
 */

app.get('/train/:UID/:year/:month/:day', (req, res) => {
  
  res.send(req.params);

});

module.exports.handler = serverless(app);