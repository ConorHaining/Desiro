const ES = require('../inc/elasticsearch.js');

module.exports = {
    getTrainMovementIdFromSchedules: (schedules, when) => {
        const date = when.toFormat('dd/LL/yyyy');

          const results = schedules.map(async(schedule) => {
            const uid = schedule['uid'];

            let esResults = await ES.search({
              index: 'movement',
              body:{
                "query": {
                  "bool": {
                    "must": [
                      {
                        "match": {
                          "train_uid": uid
                        }
                      },
                      {
                        "range": {
                          "received_at": {
                            "format": "dd/MM/yyyy",
                            "gte": date,
                            "lte": date
                          }
                        }
                      }
                    ]
                  }
                }
              }
            });

            if(esResults['hits']['total'] === 1) {
              schedule['train_id'] = esResults['hits']['hits'][0]['_source']['train_id'];
            }

            return schedule;
          });
  
          return Promise.all(results)
  
    },

    getTrainMovementsFromSchedules: (schedules, when) => {
    },

    getTrainMovements: (schedule) => {
        
    },
}