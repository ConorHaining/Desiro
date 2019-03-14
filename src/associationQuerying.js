const ES = require('../inc/elasticsearch');
module.exports = {
    
    getAssociationsFromSchedules: (schedules, when) => {
        const date = when.toFormat('dd/LL/yyyy');

        schedules = schedules.map(async (schedule) => {
            const uid = schedule['uid'];
            const associations = await ES.search({
                index: 'association',
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
                              "end_date": {
                                "gte": date,
                                "format": "d/M/y"
                              }
                            }
                          },
                          {
                            "bool": {
                              "should": [
                                {
                                  "match": {
                                    "main_train": uid
                                  }
                                },
                                {
                                  "match": {
                                    "assoc_train": uid
                                  }
                                }
                              ]
                            }
                          }
                        ],
                        "must_not": [
                          {
                            "match": {
                              "category": "NP"
                            }
                          }
                        ]
                      }
                    }
                  }
            });
            
            if(associations.hits.total > 0) {
                schedule['associations'] = [];
                associations.hits.hits.forEach(association => {
                    schedule['associations'].push(association['_source']);
                });
            }

            return schedule;
        });

        return Promise.all(schedules);
    },

    getAssociation: (uid) => {
        
    }
}