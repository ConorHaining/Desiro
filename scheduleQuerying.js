const { DateTime } = require("luxon");

var scheduleQuerying = (client) => {
    return {
        getTiplocByCRS: (crs) => {
            
            return new Promise((resolve, reject) => {
                
                crs = crs.toUpperCase();

                client.search({
                    index: 'tiploc',
                    body: {
                    'query': {
                        'match': {
                            'crs': crs
                            }
                        }
                    }
                }).then((body) => {
                    if (body.hits.total === 1){
                        let result = body.hits.hits;
                        tiploc = result[0]._source.code;

                        resolve(tiploc);
                    } else {
                        reject({'message': `Station ${crs} not found`});
                    }
                });

            });

        },
        
        getValidSchedulesFromLocation: (tiploc, field, now, later) => {
            
            return new Promise((resolve, reject) => {

                if (!['public_departure', 'public_arrival'].includes(field)){
                    reject({message: 'Invalid query field'});
                }
                
                let query = {
                    size: 40,
                    sort: [
                      {
                        "location_records.$field": {
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
                                        "location_records.$field": {
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

                  /**
                   * Dynamically change the fields which control the public arrival/departure
                   * Since the queries are the same in either case with the exception of arrival/departure
                   */
                  query['sort'][0][`location_records.${field}`] = query['sort'][0]['location_records.$field'];
                  delete query['sort'][0]['location_records.$field'];

                  query['query']['bool']['must'][0]['nested']['query']['bool']['must'][0]['range'][`location_records.${field}`] = query['query']['bool']['must'][0]['nested']['query']['bool']['must'][0]['range']['location_records.$field'];
                  delete query['query']['bool']['must'][0]['nested']['query']['bool']['must'][0]['range']['location_records.$field'];

                  client.search({
                      index: 'schedule',
                      body: query
                  }).then((body) => {
                    let results = body.hits.hits;
                    resolve(results);
                  });
                  
            });

        },
        
        getSpecificTrainSchedule: (uid, today) => {
        
          return new Promise((resolve, reject) => {

            client.search({
              index: 'schedule',
              body: {
                "query": {
                  "bool": {
                    "must": [
                      {
                        "match": {
                          "uid": uid
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

              if(body.hits.total > 0){
                resolve(body.hits.hits);
              } else  {
                reject({'message': `The train ${uid} cannot be found`, 'status': 404});
              }

            }).catch((err) => {

              if (err.message === '[parse_exception] failed to parse date field [Invalid DateTime] with format [d/M/y]'){
                reject({'message': 'Invalid date', 'status': 404});
              } else {
                reject({'message': 'Unknown Error', status: 500});
              }

            });

          });
          
        },

        getTrainID: (schedule, today, tomorrow) => {

          return new Promise((resolve, reject) => {
            
            client.search({
              index: 'movement',
              body: {
                "query": {
                  "bool": {
                    "must": [
                      {
                        "match": {
                          "train_uid": schedule['uid']
                        }
                      },
                      {
                        "range": {
                          "creation_timestamp": {
                            gte: today,
                            lt: tomorrow,
                            format: "d/M/y"
                          }
                        }
                      }
                    ]
                  }
                }
              }
            }).then((body) => {
              if (body.hits.total === 1) {
                let trainID = body.hits.hits[0]['_source']['train_id'];
                resolve(trainID);
              } else {
                resolve(null);                
              }


            });

          });

        },
        
        getSpecificTrainMovements: (trainID, today, tomorrow) => {

          return new Promise((resolve, reject) => {
            
            client.search({
              index: 'movement',
              body: {
                "query": {
                  "match": {
                    "train_id": String(trainID)
                  }
                }
              }
            }).then((body) => {
              if (body.hits.total > 0) {
                let movements = body.hits.hits;
                resolve(movements);
              } else {
                resolve(null);                
              }
            }).catch((err) => {
              reject({message: err.message, status: 500});
            });

          });

        },

        getStationsList: () => {

          return new Promise((resolve, reject) => {
            
            client.search({
              index: 'tiploc',
              body: {
                "size": 3000,
                "query": {
                  "bool": {
                    "must": [
                      {
                        "exists": {
                          "field": "crs"
                        }
                      },
                      {
                        "exists": {
                          "field": "description"
                        }
                      }
                    ]
                  }
                }
              }
            }).then((body) => {
              resolve(body.hits.hits);
            })

          });

        }
    }
}

module.exports = scheduleQuerying;