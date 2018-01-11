const request = require('request');
const R = require('ramda');
const download = require('download-git-repo');
const { concatPrefix } = require('../utils/template');

const baseURL = 'https://api.github.com';
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
    downloadRepo(repo) {
        const dest = concatPrefix(repo);
        return new Promise((resolve, reject) => {
            download(repo, dest, {clone: false}, err => {
                err
                    ? reject(err)
                    : resolve();
            })
        })
    }
}