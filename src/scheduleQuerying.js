const ES = require('../inc/elasticsearch');
const direction = require('../data/direction');
const scheduleFormatting = require('../src/scheduleFormatting.js');

module.exports = {
    
    getSchedulesFromUIDs: (UIDs, directionMode, when, tiplocs) => {
      
        return new Promise((resolve, reject) => {
          startTime = when.toFormat('HH:mm');
          endTime = when.plus({ hours: 2 }).toFormat('HH:mm');
            date = when.toFormat('dd/LL/yyyy');
            
            Promise.resolve(tiplocs).then(tiplocs => {
  
              let query = {
                "size": 1000,
                "query": {
                  "bool": {
                    "must": [
                      {
                        "bool": {
                          "should": []
                        }
                      },
                      {
                        "range": {
                          "start_date": {
                            "lte": date,
                            "format": "d/M/y"
                          }
                        }
                      },
                      {
                        "range": {
                          "end_start": {
                            "gte": date,
                            "format": "d/M/y"
                          }
                        }
                      }
                    ]
                  }
                },
                "sort": [
                  
                ]
              }
              console.log(tiplocs)

              query['query']['bool']['must'][0]['bool']['should'] = UIDs.map(uid => {
                return {
                  "match": {
                    "uid": uid
                  }
                }
              });

              query['sort'] = tiplocs.map(tiploc => {
                let subDoc = {
                  "location_records.$field": {
                    "order": "asc",
                    "nested": {
                      "path": "location_records",
                      "filter": {
                        "term": {
                          "location_records.tiploc": tiploc
                        }
                      }
                    },
                    "missing": "_last"
                  }
                };

                let field;
                if(directionMode === direction.DEPARTURES) {
                  field = 'public_departure';
                } else if (directionMode === direction.ARRIVALS){
                  field = 'public_arrival';
                }
                subDoc = JSON.stringify(subDoc);
                subDoc = subDoc.replace('$field', field);
                subDoc = JSON.parse(subDoc);

                return subDoc;

              });
              
              ES.search({
                  index: 'schedule',
                  body: query
              }).then((body) => {
                  let results = body.hits.hits.map(result => {
                    return result['_source'];
                  });

                  resolve(results);
              }).catch((err) => {
                  reject({'message': 'Elasticsearch Error', 'status': 500, 'details': err.toString()});
              });
            });

        });
    },

    getUIDsForTiploc: (tiplocs, when) => {

      return new Promise((resolve, reject) => {
        startTime = when.toFormat('HH:mm');
        endTime = when.plus({ hours: 2 }).toFormat('HH:mm');
        date = when.toFormat('dd/LL/yyyy');

        let query = {
          "_source": {
            "includes": "uid"
          }, 
          "size": 1000,
          "query": {
            "bool": {
              "must": [
                {
                  "nested": {
                    "path": "location_records",
                    "query": {
                      "bool": {
                        "must": [
                          {
                            "bool": {
                              "should": [
                                {
                                  "range": {
                                    "location_records.public_arrival": {
                                      "format": "HH:mm",
                                      "gte": startTime,
                                      "lte": endTime
                                    }
                                  }
                                },
                                {
                                  "range": {
                                    "location_records.public_departure": {
                                      "format": "HH:mm",
                                      "gte": startTime,
                                      "lte": endTime
                                    }
                                  }
                                }
                              ]
                            }
                          },
                          {
                            "bool": {
                              "should": [
                                
                              ]
                            }
                          }
                        ]
                      }
                    }
                  }
                },
                {
                  "range": {
                    "start_date": {
                      "lte": date,
                      "format": "d/M/y"
                    }
                  }
                },
                {
                  "range": {
                    "end_start": {
                      "gte": date,
                      "format": "d/M/y"
                    }
                  }
                }
              ]
            }
          }
        };

        query['query']['bool']['must'][0]['nested']['query']['bool']['must'][1]['bool']['should'] = tiplocs.map(tiploc => {
          return {
            "term": {
              "location_records.tiploc": tiploc
            }
          }
        });

        ES.search({
          index: 'schedule',
          body: query
        }).then((body) => {
          const UIDs = new Set();
          body.hits.hits.forEach(hit => {
            UIDs.add(hit['_source']['uid']);
          });
          resolve(Array.from(UIDs));
        }).catch(err => {
          reject({'message': 'UID query', 'status': 500, 'details': err.message});
        });

      });
    },

    getAssociationSchedules: (schedules, when) => {
      date = when.toFormat('dd/LL/yyyy');
      schedules = schedules.map(async(schedule) => {
        const uid = schedule['uid'];
        if('associations' in schedule){
          const associations = schedule['associations'][0];
          
          let searchUID;
          if(associations['main_train'] === uid){
            searchUID = associations['assoc_train'];
          } else if(associations['assoc_train'] === uid){
            searchUID = associations['main_train'];
          }

          let results = await ES.search({
            index: 'schedule',
            body: {
              "query": {
                "bool": {
                  "must": [
                    {
                      "range": {
                        "start_date": {
                          "lte": date,
                          "format": "d/M/y"
                        }
                      }
                    },
                    {
                      "range": {
                        "end_start": {
                          "gte": date,
                          "format": "d/M/y"
                        }
                      }
                    },
                    {
                      "match": {
                        "uid": searchUID
                      }
                    }
                  ]
                }
              }
            }
          });

          results = results.hits.hits;
          results = results.map(result => {return result['_source'];});
          results = results.filter(result => scheduleFormatting.filterValidRunningDays(result, when));
        
          validSchedule = scheduleFormatting.filterValidSTPIndicators(results);
          if(!validSchedule['signalling_id'].startsWith('5')){
            schedule['associations'] = [validSchedule];
          } else {
            delete schedule['associations'];
          }
        }
        return schedule;
      });
      return Promise.all(schedules);
    },

    getScheduleByUID: (uid, when) => {
      date = when.toFormat('dd/LL/yyyy');
      return new Promise((resolve, reject) => {

        ES.search({
          index: 'schedule',
          body: {
            "size": 40,
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
                        "lte": date,
                        "format": "d/M/y"
                      }
                    }
                  },
                  {
                    "range": {
                      "end_start": {
                        "gte": date,
                        "format": "d/M/y"
                      }
                    }
                  }
                ]
              }
            }
          }
        }).then((body) => {
          let schedules = body.hits.hits.map(schedule => {
            return schedule['_source'];
          });
  
          resolve(schedules);
        }).catch(e => {
          reject({message: 'Elasticsearch Error', status: 500, details: e.message});
        });

      });

    }
}