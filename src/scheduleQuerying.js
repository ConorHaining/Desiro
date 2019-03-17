const ES = require('../inc/elasticsearch');
const direction = require('../data/direction');
const scheduleFormatting = require('../src/scheduleFormatting.js');

module.exports = {
    
    getSchedulesFromUIDs: (UIDs, when) => {
        return new Promise((resolve, reject) => {

            startTime = when.toFormat('HH:mm');
            endTime = when.plus({ hours: 2 }).toFormat('HH:mm');
            date = when.toFormat('dd/LL/yyyy');

            let query = {
              "size": 40,
              "sort": [
                {
                  "location_records.public_arrival": {
                    "order": "asc",
                    "nested": {
                      "path": "location_records",
                      "filter": {
                        "term": {
                          "location_records.tiploc": tiploc
                        }
                      }
                    }
                  }
                },
                {
                  "location_records.public_departure": {
                    "order": "asc",
                    "nested": {
                      "path": "location_records",
                      "filter": {
                        "term": {
                          "location_records.tiploc": tiploc
                        }
                      }
                    }
                  }
                }
              ],
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
              }
            }

            query['query']['bool']['must'][0]['bool']['should'] = UIDs.map(uid => {
              return {
                "match": {
                  "uid": uid
                }
              }
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
    },

    getUIDsForTiploc: (tiploc, when) => {

      return new Promise((resolve, reject) => {
        startTime = when.toFormat('HH:mm');
        endTime = when.plus({ hours: 2 }).toFormat('HH:mm');
        date = when.toFormat('dd/LL/yyyy');

        ES.search({
          index: 'schedule',
          body: {
            "_source": {
              "includes": "uid"
            }, 
            "size": 80,
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
                              "term": {
                                "location_records.tiploc": tiploc
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
          }
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
          const associations = schedule['associations'];
          
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
                          "lte": "12/03/2019",
                          "format": "d/M/y"
                        }
                      }
                    },
                    {
                      "range": {
                        "end_start": {
                          "gte": "12/03/2019",
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
          results = results.filter(result => scheduleFormatting.filterValidRunningDays(result));
          validSchedule = scheduleFormatting.filterValidSTPIndicators(results);
          if(!validSchedule['signalling_id'].startsWith('5')){
            schedule['associations'] = validSchedule;
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