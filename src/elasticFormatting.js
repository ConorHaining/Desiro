module.exports = {
    removeElasticMetadata: (response) => {
        return new Promise((resolve, reject) => {
            let cleaned = [];

            response.forEach(element => {
                cleaned.push(element['_source']);
            });

            resolve(cleaned);
        });
    }
}