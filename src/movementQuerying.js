const ES = require('../inc/elasticsearch.js');

module.exports = {
    getTrainMovementIdFromSchedules: (schedules, when) => {
        const date = when.toFormat('dd/LL/yyyy');
        return new Promise((resolve, reject) => {
          
          schedules.map(schedule => {
            const uid = schedule['uid'];
            ES.search({
              index: 'movement',
              body: {
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
              }).then(results => {
                if(results.hits.total === 1){
                    schedule['train_id'] = results.hits.hits[0]['_source']['train_id'];
                }
                
                return schedule;
              });
          });

          resolve(schedules);

        });

    },

    getTrainMovementsFromSchedules: (schedules) => {

    },

    getTrainMovements: (schedule) => {
        
    },
}