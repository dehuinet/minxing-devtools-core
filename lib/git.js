const request = require('request');
const R = require('ramda');
const { Future } = require('ramda-fantasy');
const download = require('download-git-repo');
const { concatPrefix, formatDirName } = require('../utils/template');

const baseURL = 'https://api.github.com';

function gitHttp(url) {
    return new Future((rej, result) => {
        request({
            url,
            headers: {
                'User-Agent': 'minxing-devtools-core'
            }
        }, (err, res) => {
            err
                ? rej(err)
                : result(res);
        });
    })
}
var parseJSON = function(str) {
    return new Future(function(rej, res) {
      try {
        res(JSON.parse(str));
      } catch (err) {
        rej({ error: 'json parse error' });
      }
    });
};
  
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
                console.log('res->>', JSON.parse(res.body));
                err
                    ? reject(err)
                    : resolve(JSON.parse(res.body));
            });
        })
    },
    getRepoFuture(repo) {
        // String -> Furture string object
        return R.compose(
            R.chain(parseJSON),
            R.pluck('body'),
            gitHttp,
            R.concat(`${baseURL}/repos`)
        )
    },
    downloadRepo(repo) {
        const dest = R.compose(concatPrefix, formatDirName)(repo);
        return new Promise((resolve, reject) => {
            download(repo, dest, {clone: false}, err => {
                err
                    ? reject(err)
                    : resolve();
            })
        })
    }
}