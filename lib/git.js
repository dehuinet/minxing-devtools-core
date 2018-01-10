const request = require('request');
const baseURL = 'https://api.github.com';

module.exports = {
    getRepo(repo) {
        const domain = 'repos';
        const url = `${baseURL}/${domain}/${repo}`;
        const headers = {
            'User-Agent': 'minxing-devtools-core'
        }
        return new Promise((resolve, reject) => {
            request({
                url,
                headers
            }, (err, res) => {
                err
                    ? reject(err)
                    : resolve(res.body);
            });
        })
    },
}