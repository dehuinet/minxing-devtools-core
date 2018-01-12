const R = require('ramda');
const {TEAMPLATE_TEMP} = require('./config');



const isLocalFileOrigin = R.test(/^file@/);

const isGithubOrigin = R.test(/^github@/);

const isNpmOrigin = R.isNil;

const getGithubRepoName = R.replace(/github@/, '');
const getFilePath = R.replace(/file@/, '');

const formatDirName = R.replace(/\//, '-');
const concatPrefix = R.concat(`${TEAMPLATE_TEMP}/`);



module.exports = {
    concatPrefix,
    isLocalFileOrigin,
    isGithubOrigin,
    getGithubRepoName,
    getFilePath,
    formatDirName,
    isNpmOrigin
}