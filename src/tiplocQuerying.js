const ES = require('../inc/elasticsearch');

module.exports = {
    getTiploc: (crs) => {
        crs = crs.toUpperCase();
        return new Promise((resolve, reject) => {
            // There are some special cases, notably major stations, we will handle those before searching
            switch(crs) {
                case 'VIC':
                    resolve('VICTRIC');
                break;
            }
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
                if (body.hits.total >= 1){
                    let result = body.hits.hits;
                    tiploc = result[0]._source.code;
                    resolve(tiploc);
                } else {
                    reject({'message': `Station ${crs} not found`, 'status': 404});
                }
            }).catch((err) => {
                reject({'message': 'Elasticsearch Error', 'status': 500, 'details': err.toString()});
            });
        });
    }
}