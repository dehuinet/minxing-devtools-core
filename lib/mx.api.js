'use strict';

const Build = require('./build');
const Package = require('./package');

const Utils = require('../utils');
const Wifi = require('./wifi');
const Project = require('./project_template');
const Page = require('./page_template');
const VueSeed = require('./vue_seed');

module.exports = {
    Utils,
    Wifi,
    Template: {
        Project,
        Page
    },
    clearTemp: Package.clearTemp,
    build: Build.build,
    VueSeed
};



