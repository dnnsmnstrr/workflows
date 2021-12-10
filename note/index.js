const _ = require('lodash');
const s = require('underscore.string');
const globby = require('globby');
const alfy = require('alfy');
const path = require('path');
const Fuse = require('fuse.js');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const moment = require('moment');
const srcFolder = process.env.NOTES_PATH;
const query = s.trim(_.last(process.argv));
const log = require('./log');
const grep = require('./grep');

if (!srcFolder) {
    throw new Error(`NOTES_PATH environment variable not set.`);
}

const options = {
    shouldSort: true,
    includeScore: true,
    threshold: 0.2,
    tokenize: true,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: [
        'file'
    ]
};

async function tagSubtitle(row) {
    const stats = await fs.statAsync(path.resolve(srcFolder, row.arg));
    const mTime = moment(stats.mtime);
    row.subtitle = `Last modified: ${mTime.format('LLLL')}`;
    row.icon = {
        path: alfy.icon.get('GenericDocumentIcon')
    };
    row.mtime = stats.mtimeMs;
}

async function run() {

    const grepResults = await grep(query);

    const files = (
        await globby('**/*.md', {
            cwd: srcFolder
        })
    )
        .map((file) => {
            return {
                file
            };
        });

    let result;

    if (query) {

        const fuse = new Fuse(files, options);
        result = fuse.search(query)
            .map((row) => {
                return row.item.file;
            })
            .map((file) => {
                return {
                    title: path.basename(file, '.md'),
                    subtitle: '',
                    arg: file,
                };
            });

        grepResults.forEach((file) => {
            const match = _.find(result, (row) => {
                return row.arg === file
            });
            if (match) {
                return;
            }
            result.push({
                title: path.basename(file, '.md'),
                subtitle: '',
                arg: file,
            });
        });

        for (const row of result) {
            await tagSubtitle(row);
        }

        result = _.orderBy(result, ['mtime'], ['desc'])
            .map((row) => {
                delete row.mtime;
                return row;
            });

        if (!result.length) {
            result.push({
                title: query,
                subtitle: 'Create new note',
                arg: `${query}.md`
            });
        }

    } else {

        result = files.map(({ file }) => {
            return {
                title: path.basename(file, '.md'),
                subtitle: '',
                arg: file,
            }
        });

        for (const row of result) {
            await tagSubtitle(row);
        }

        result = _.orderBy(result, ['mtime'], ['desc'])
            .map((row) => {
                delete row.mtime;
                return row;
            });

        if (!result.length) {
            result.push({
                title: query,
                subtitle: 'Create new note',
                arg: `${query}.md`
            });
        }

    }

    alfy.output(result);

}

run();