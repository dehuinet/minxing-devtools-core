const git = require('./git');
const userHome = require('user-home');
const path = require('path');
const R = require('ramda');
const fse = require('fs-extra');
const fs = require('fs');
const rm = require('rimraf');

const tU = require('../utils/template');
const { TEAMPLATE_TEMP } = require('../utils/config');

const { concatPrefix, formatDirName, getGithubRepoName, isGithubOrigin, isLocalFileOrigin, getFilePath } = require('../utils/template');

const VUE_DEFAULT_TEMPLATE_PATH = path.join(__dirname, '../vue_template');

const debug = str => R.tap(x => console.log(`Debug: ${str}->`, x))
const myResolve = x => (res, rej) => res(x);
const myReject = __ => (res, rej) => rej();

const getTemplatePath = R.compose(debug('temp path'), concatPrefix, formatDirName, getGithubRepoName);


// impure
const isTemplateExists = R.compose(fse.existsSync, getTemplatePath);


const dataToTimestamp = d => (new Date(d)).getTime();

// impure
const getTemplateCtime = R.compose(R.prop('ctime'), fse.statSync, getTemplatePath)

const timestampGt = R.curry((x, y) => R.gt(dataToTimestamp(x), dataToTimestamp(y)));

const promiseWrap = R.curry((method, x) => new Promise(method(x)));


const removeOldTemplate = R.compose(rm.sync ,getTemplatePath);


const checkLocalByRepoPushTime = origin => (resolve, reject) => git.getRepo(getGithubRepoName(origin))
            .then(({ pushed_at }) => {
                R.when(
                    R.compose(timestampGt(pushed_at), getTemplateCtime),
                    resolve
                )(origin);
            })
            .catch(reject);


const checkUpdate = promiseWrap(
    R.ifElse(
        isGithubOrigin,
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
    isGithubOrigin,
    R.compose(git.downloadRepo, getGithubRepoName, R.tap(removeOldTemplate)),
    __ => Promise.reject()
)

function add({
    origin,
    name,
    output
}) {
    let from = VUE_DEFAULT_TEMPLATE_PATH;
    if (isGithubOrigin(origin)) {
        from = getTemplatePath(origin);
    } else if (isLocalFileOrigin(origin)) {
        from = getFilePath(origin);
    }
    if (!fse.existsSync(from)) {
        return `没有找到来自${origin}的模版文件！`
    } else {
        return copy({
            from,
            name,
            output
        })
    }
}

function copy({
    from,
    output,
    name
}) {
    const root = path.resolve(output, name)
    if (!fse.existsSync(root)) {
        fse.mkdirSync(root);
    }
    fse.copySync(from, root);
}

module.exports = {
    checkUpdate,
    download,
    add
}