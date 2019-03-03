const ES = require('../inc/elasticsearch');
const direction = require('../data/direction');

module.exports = {
    
    getSchedulesForTiploc: (tiploc, queryDirection, when) => {
        
        return new Promise((resolve, reject) => {

            let field;
            if (queryDirection === direction.ARRIVALS) {
                field = "public_arrival";
            } else if (queryDirection === direction.DEPARTURES) {
                field = "public_departure";
            } else {
                reject({'message': 'Unknown Direction', 'status': 500});
            }

            startTime = when.toFormat('HH:mm');
            endTime = when.plus({ hours: 2 }).toFormat('HH:mm');
            date = when.toFormat('dd/LL/yyyy');

            let queryString = `{
                "size": 40,
                "sort": [
                  {
                    "location_records.${field}": {
                      "order": "asc",
                      "nested": {
                        "path": "location_records",
                        "filter": {
                          "term": {
                            "location_records.tiploc": "${tiploc}"
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
                        "nested": {
                          "path": "location_records",
                          "query": {
                            "bool": {
                              "must": [
                                {
                                  "range": {
                                    "location_records.${field}": {
                                      "format": "HH:mm",
                                      "gte": "${startTime}",
                                      "lte": "${endTime}"
                                    }
                                  }
                                },
                                {
                                  "term": {
                                    "location_records.tiploc": "${tiploc}"
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
                            "lte": "${date}",
                            "format": "d/M/y"
                          }
                        }
                      },
                      {
                        "range": {
                          "end_start": {
                            "gte": "${date}",
                            "format": "d/M/y"
                          }
                        }
                      }
                    ]
                  }
                }
              }`;
            
            let query;
            try {
                query = JSON.parse(queryString);
            } catch (error) {
                reject({'message': 'Parsing error', 'status': 500, 'details': error.message});
            }
            
            ES.search({
                index: 'schedule',
                body: query
            }).then((body) => {
                let results = body.hits.hits;
                resolve(results);
            }).catch((err) => {
                reject({'message': 'Elasticsearch Error', 'status': 500, 'details': err.toString()});
            });
        });
    },

    getAssociationSchedules: (schedules) => {

    }
}