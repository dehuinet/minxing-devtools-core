const root = require('user-home');
const path = require('path');

const TEMP_NAMESPACE = 'minxing-devtools';
const TEAMPLATE_TEMP = path.join(root, TEMP_NAMESPACE, 'templates');
const LOCALSTORAGE_TEMP = path.join(root, TEMP_NAMESPACE, 'localstorage');
const QRCODE_TEMP = path.join(root, TEMP_NAMESPACE, 'qrcode');

module.exports = {
    TEAMPLATE_TEMP,
    LOCALSTORAGE_TEMP,
    QRCODE_TEMP
};
