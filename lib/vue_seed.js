const git = require('./git');
const userHome = require('user-home');

const R = require('ramda');
const fse = require('fs-extra');
const rm = require('rimraf');

const tU = require('../utils/template');
const { TEAMPLATE_TEMP } = require('../utils/config');

const { concatPrefix } = require('../utils/template');

const debug = str => R.tap(x => console.log(`Debug: ${str}->`, x))
const myResolve = x => (res, rej) => res(x);
const myReject = __ => (res, rej) => rej();

const getTemplatePath = R.compose(debug('temp path'), concatPrefix, tU.formatDirName, tU.getGithubRepoName);


// impure
const isTemplateExists = R.compose(fse.existsSync, getTemplatePath);


const dataToTimestamp = d => (new Date(d)).getTime();

// impure
const getTemplateCtime = R.compose(R.prop('ctime'), fse.statSync, getTemplatePath)

const timestampGt = R.curry((x, y) => R.gt(dataToTimestamp(x), dataToTimestamp(y)));

const promiseWrap = R.curry((method, x) => new Promise(method(x)));

const checkLocalByRepoPushTime = origin => (resolve, reject) => git.getRepo(tU.getGithubRepoName(origin))
            .then(({ pushed_at }) => {
                R.when(
                    R.compose(timestampGt(pushed_at), getTemplateCtime),
                    resolve
                )(origin);
            })
            .catch(reject);


const checkUpdate = promiseWrap(
    R.ifElse(
        tU.isGithubOrigin,
        R.ifElse(
            isTemplateExists,
            checkLocalByRepoPushTime,
            myResolve
        ),
        myReject
    )
)


// download:: String -> Promise
const download = R.ifElse(
    tU.isGithubOrigin,
    R.compose(git.downloadRepo, tU.getGithubRepoName),
    __ => Promise.reject()
)


module.exports = {
    checkUpdate,
    download
}

// module.exports = {
//     checkUpdate,
//     update({
//         origin,
//         name,
//         output
//     }) {
//         if (tU.isGithubOrigin(origin)) {
//             rm(getTemplatePath(origin));

//         }
//     }
// }