const request = require('request');
const baseURL = 'https://api.github.com';
const R = require('ramda');

module.exports = {
    getRepo(repo) {
        const domain = 'repos';
        const url = `${baseURL}/${domain}/${repo}`;
        const headers = {
            'User-Agent': 'minxing-devtools-core'
        }
        return new Promise((resolve, reject) => {
            console.log('git request url->', url);
            request({
                url,
                headers
            }, (err, res) => {
                console.log('res->>', JSON.parse(res.body));
                err
                    ? reject(err)
                    : resolve(JSON.parse(res.body));
            });
        })
    },
    downloadRepo: R.curry((prefix, repo) => {
        
    })
}