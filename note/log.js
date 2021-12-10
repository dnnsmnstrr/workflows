const path = require('path');
const fs = require('fs');
const os = require('os');
const _ = require('lodash');
const logPath = path.resolve(__dirname, 'log.txt');

module.exports = function log(...args) {
    let data = '';
    for (const arg of args) {
        data += JSON.stringify(arg, null, 4) + os.EOL;
    }
    fs.appendFile(logPath, data, _.noop);
};