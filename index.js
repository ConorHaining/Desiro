const serverless = require('serverless-http')
const express = require('express')
const app = express()
const elasticsearch = require('elasticsearch')
const { DateTime } = require("luxon");
const scheduleFormatting = require('./scheduleFormatting.js');

let client = new elasticsearch.Client({
  host: process.env.esHost || 'http://localhost:9200',
});

/*
 * Station
 */

app.get('/station/:stationCode/departures', (req, res) => {

  let now = DateTime.local().setLocale('en-GB');
  let later = now.plus({hours: 2});
  let tiploc;

  client.search({
    index: 'tiploc',
    body: {
      "query": {
        "match": {
          "crs": req.params.stationCode.toUpperCase()
        }
      }
    }
  }).then((body) => {
    
    if (body.hits.total === 1) {
      let result = body.hits.hits;
      tiploc = result[0]._source.code;

      return client.search({
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
                      lte: now.toFormat('dd/MM/yyyy'),
                      format: "d/M/y"
                    }
                  }
                },
                {
                  range: {
                    "end_start": {
                      gte: now.toFormat('dd/MM/yyyy'),
                      format: "d/M/y"
                    }
                  }
                }
              ]
            }
          }
        }
      });

    } else {

      return null;

    }


  }).then((body) => {

    if (body !== null) {
      let results = body.hits.hits;
      let board = scheduleFormatting.formatBoard(results, {board: "departure", tiploc: tiploc});
      res.send(board);
    } else {
      res.status(404).send({'message': `Station ${req.params.stationCode} not found`});
    }

  }).catch((err) => {
    console.log(err);
    res.send(500).send({'message': '¯\_(ツ)_/¯ Unknown error'});
  });
  

});

app.get('/station/:stationCode/arrivals', (req, res) => {

  let now = DateTime.local().setLocale('en-GB');
  let later = now.plus({hours: 2});
  let tiploc;

  client.search({
    index: 'tiploc',
    body: {
      "query": {
        "match": {
          "crs": req.params.stationCode.toUpperCase()
        }
      }
    }
  }).then((body) => {
    
    if (body.hits.total === 1) {
      let result = body.hits.hits;
      tiploc = result[0]._source.code;

      return client.search({
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
                      lte: now.toFormat('dd/MM/yyyy'),
                      format: "d/M/y"
                    }
                  }
                },
                {
                  range: {
                    "end_start": {
                      gte: now.toFormat('dd/MM/yyyy'),
                      format: "d/M/y"
                    }
                  }
                }
              ]
            }
          }
        }
      });

    } else {

      return null;

    }


  }).then((body) => {

    if (body !== null) {
      let results = body.hits.hits;
      let board = scheduleFormatting.formatBoard(results, {board: "arrival", tiploc: tiploc});
      res.send(board);
    } else {
      res.status(404).send({'message': `Station ${req.params.stationCode} not found`});
    }

  }).catch((err) => {
    console.log(err);
    res.send(500).send({'message': '¯\_(ツ)_/¯ Unknown error'});
  });

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
  let correctSchedule;

  client.search({
    index: 'schedule',
    body: {
      "query": {
        "bool": {
          "must": [
            {
              "match": {
                "uid": req.params.UID
              }
            },
            {
              "range": {
                "start_date": {
                  "lte": today,
                  "format": "d/M/y"
                }
              }
            },
            {
              "range": {
                "end_start": {
                  "gte": today,
                  "format": "d/M/y"
                }
              }
            }
          ]
        }
      }
    }
  }).then((body) => {
    results = body.hits.hits;

    correctSchedule = scheduleFormatting.applicableSchedule(results);
    
    return correctSchedule;
  }).then((correctSchedule) => {
    
    return client.search({
      index: 'movement',
      body: {
        "query": {
          "bool": {
            "must": [
              {
                "match": {
                  "train_uid": correctSchedule['uid']
                }
              },
              {
                "range": {
                  "departure_timestamp": {
                    gte: today,
                    lte: tomorrow,
                    format: "d/M/y"
                  }
                }
              }
            ]
          }
        }
      }
    });

  }).then((body) => {
    results = body.hits.hits

    if (results.length > 0) {
      let trainID = results[0]['_source']['train_id'];
  
        return client.search({
          index: 'movement',
          body: {
            "query": {
              "bool": {
                "must": [
                  {
                    "match": {
                      "train_id": trainID
                    }
                  },
                  {
                    "range": {
                      "received_at": {
                        gte: today,
                        lte: tomorrow,
                        format: "d/M/y"
                      }
                    }
                  }
                ]
              }
            }
          }
        });

    } else {
      return null;
    }

  }).then((body) => {
    
    if (body !== null) {
      results = body.hits.hits;

      results.forEach((movementRecord) => {
        let movementStanox = movementRecord['_source']['stanox']

        for (let i = 0; i < correctSchedule['location_records'].length; i++) {
          const scheduleRecord = correctSchedule['location_records'][i];

          let scheduleStanox = scheduleRecord['location']['stanox'];

          if(scheduleStanox == movementStanox){

            let actualTimestamp = DateTime.fromMillis(movementRecord['_source']['actual_timestamp']);

            if (movementRecord['_source']['event_type'] === 'ARRIVAL'){
              correctSchedule['location_records'][i]['actual_arrival'] = actualTimestamp.toFormat('HH:mm:ss')

            } else if (movementRecord['_source']['event_type'] === 'DEPARTURE') {
              correctSchedule['location_records'][i]['actual_departure'] = actualTimestamp.toFormat('HH:mm:ss')

            }
          }
          
        }

        
      });

    }

    res.send(correctSchedule);


  });

});

module.exports.handler = serverless(app);