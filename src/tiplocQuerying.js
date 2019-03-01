const ES = require('../inc/elasticsearch');

module.exports = {
    getTiploc: (crs) => {
        crs = crs.toUpperCase();
        return new Promise((resolve, reject) => {
            ES.search({
                'index': 'tiploc',
                'body': {
                    "query": {
                      "match": {
                        "crs": crs
                      }
                    }
                  }
            }).then((body) => {
                if (body.hits.total === 1){
                    let result = body.hits.hits;
                    tiploc = result[0]._source.code;
                    resolve(tiploc);
                } else {
                    reject({'message': `Station ${crs} not found`, 'status': 404});
                }
            });
        });
    }
}