const ES = require('../inc/elasticsearch');

module.exports = {
    getTiploc: (crs) => {
        crs = crs.toUpperCase();
        return new Promise((resolve, reject) => {
            // There are some special cases, notably major stations, we will handle those before searching
            switch(crs) {
                case 'VIC': // London Victoria
                    resolve(['VICTRIA', 'VICTRIC', 'VICTRIE']);
                case 'CLJ': // Clapham Junction
                    resolve(['CLPHMJ1', 'CLPHMJ2', 'CLPHMJC', 'CLPHMJM', 'CLPHMJN', 'CLPHMJW']);
                case 'LBG': // London Bridge
                    resolve(['LNDNBDC', 'LNDNBDE', 'LNDNBDG']);
                case 'WAT':
                    resolve(['WATR', 'WATRINT', 'WATRLMN', 'WATRLOO', 'WATRLOW']);
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
                if (body.hits.total > 0){
                    let result = body.hits.hits;
                    let tiplocs = result.map(tiploc => {
                        return tiploc._source.code;
                    });

                    resolve(tiplocs);
                } else {
                    reject({'message': `Station ${crs} not found`, 'status': 404});
                }
            }).catch((err) => {
                reject({'message': 'Elasticsearch Error', 'status': 500, 'details': err.toString()});
            });
        });
    }
}