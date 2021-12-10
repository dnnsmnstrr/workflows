const Promise = require('bluebird');
const fs = require('fs');
const path = require('path');
const srcFolder = process.env.NOTES_PATH;
const { spawn } = require('child_process');
const split2 = require('split2');
const log = require('./log');

module.exports = function grep(query) {

    return new Promise((resolve, reject) => {

        const res = [];

        if (!query) {
            return resolve(res);
        }

        const child = spawn('grep', [
            '-lri', query, '.'
        ], {
            cwd: srcFolder
        });

        child
            .stdout
            .pipe(split2())
            .on('data', (data) => {
                res.push(
                    path.basename(data)
                );
            });

        child
            .stderr
            .on('data', (data) => {
                log(data.toString('utf8'));
            });

        child.on('close', (code) => {
            return code === 0 ? resolve(res) : resolve([]);
        });

    });

};