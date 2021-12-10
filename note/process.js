const alfy = require('alfy');
const Promise = require('bluebird');
const _ = require('lodash');
const path = require('path');
const fs = Promise.promisifyAll(require('fs-extra'));
const srcFolder = process.env.NOTES_PATH;
const filename = _.last(process.argv);
const abs = path.resolve(srcFolder, filename);
const log = require('./log');

async function run() {

    const parentDir = path.dirname(abs);

    await fs.ensureDirAsync(parentDir);
    await fs.ensureFileAsync(abs);

    process.stdout.write(abs);

}

run();