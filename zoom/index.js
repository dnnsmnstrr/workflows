'use strict';
const homedir = require('os').homedir();
const fs = require('fs');
const alfy = require('alfy');

const rawData = fs.readFileSync(homedir + '/.zoom-cli.json');
const zoomConfig = JSON.parse(rawData);
const contacts = zoomConfig.aliases;

function capitalize(str) {
	return str[0].toUpperCase() + str.slice(1);
}

const options = Object.keys(contacts).map(contact => {
	const title = capitalize(contact);
	return {title, subtitle: 'Join meeting with: ' + title, arg: contacts[contact]};
});

const items = alfy.inputMatches(options, 'title');
alfy.output(items);
