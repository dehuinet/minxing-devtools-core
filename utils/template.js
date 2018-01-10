const R = require('ramda');



const isLocalFileOrigin = R.test(/^file@/);

const isGithubOrigin = R.test(/^github@/);

const isNpmOrigin = R.isNil;

const getGithubRepoName = R.replace(/github@/, '');

const formatDirName = R.replace(/\//, '-');




module.exports = {
    isLocalFileOrigin,
    isGithubOrigin,
    getGithubRepoName,
    formatDirName,
    isNpmOrigin
}