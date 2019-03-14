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
                        "nr_queue_timestamp": {
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

        return Promise.all(results);
    },

    getTrainMovementsFromSchedules: (schedules, when) => {
      const date = when.toFormat('dd/LL/yyyy');

        const results = schedules.map(async(schedule) => {
          if(schedule['train_id']){
            let esResults = await ES.search({
              index: 'movement',
              body: {
                "size": 1000,
                "query": {
                  "bool": {
                    "must": [
                      {
                        "match": {
                          "train_id": schedule['train_id']
                        }
                      },
                      {
                        "range": {
                          "nr_queue_timestamp": {
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

            let movements = esResults['hits']['hits'];
            schedule['location_records'] = schedule['location_records'].map(record => {
              const SCHStanox = record['location'][0]['stanox'];

              for (let i = 0; i < movements.length; i++) {
                const element = movements[i]['_source'];
                const MVTStanox = element['stanox'];
                // console.log(MVTStanox);
                
                if(MVTStanox === SCHStanox){
                  const event_type = element['event_type'];
                  record[`MVT${event_type}`] = element;
                }
                if(SCHStanox === element['location_stanox']){
                  record['MVTCancel'] = element;
                }
              }
              return record;

            });
          }
          return schedule;
        });

       return Promise.all(results);      
    },

    getTrainMovements: (schedule) => {
        
    },
}