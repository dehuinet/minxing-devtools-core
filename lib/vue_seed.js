const git = require('./git');
const userHome = require('user-home');
const R = require('ramda');
const fes = require('fs-extra');


const isLocalFileOrigin = R.test(/^file@/);
const isGithubOrigin = R.test(/^github@/);
const getGithubRepoName = R.replace(/github@/, '');
const isNpmOrigin = R.isNil;
const addPrefix = R.add(`${userHome}/vue-seed-templates/`);
const getTemplatePath = R.compose(addPrefix, getGithubRepoName);
const isTemplateExists = R.compose(fse.existsSync, getTemplatePath);
const dataToTimestamp = d => (new Date(d)).getTime();
const getTemplateCtimestamp = R.compose(dataToTimestamp, R.prop('ctime'), fse.statSync, getTemplatePath)
const gtCtimestamp = R.curry((origin, d) => R.gt(dataToTimestamp(d), getTemplateCtimestamp(origin)));


const getRemotePtime = origin
    => (resolve, reject) => git.getRepo(getGithubRepoName(origin))
            .then(({ pushed_at }) => {
                R.when(gtCtimestamp(R.__, pushed_at), resolve)(origin);
            })
            .catch(reject);

module.exports = {
    checkUpdate(origin) {
        return new Promise(
            R.ifElse(
                isGithubOrigin,
                R.ifElse(
                    isTemplateExists,
                    getRemotePtime,
                    x => resolve => resolve(x)
                ),
                __ => (resolve, reject) => reject
            )(origin)
        );
    },
    update(repo) {

    }
}