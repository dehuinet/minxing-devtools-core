'use strict';

const Build = require('./build');
const Package = require('./package');

const Utils = require('../utils/utils');
const Wifi = require('./wifi');
const Project = require('./project_template');
const Page = require('./page_template');

module.exports = {
    Utils,
    Wifi,
    Template: {
        Project,
        Page
    },
    clearTemp: Package.clearTemp,
    build: Build.build
};



