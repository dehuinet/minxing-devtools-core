const git = require('./git');
const userHome = require('user-home');


module.exports = {
    getTempPath() {
        return `${userHome}/vue-seed-templates`;
    },
    checkUpdate() {
        
    }
}