

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
        
        getSpecificTrainSchedule: (uid, year, month, day) => {
            
        },
        
        getSpecificTrainMovements: (uid, year, month, day) => {
            
        }
    }
}

module.exports = scheduleQuerying;