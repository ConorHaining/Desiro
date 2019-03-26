const es = require('elasticsearch');
const client = new es.Client({
    host: process.env.esHost || 'http://localhost:9200',
});

module.exports = client;