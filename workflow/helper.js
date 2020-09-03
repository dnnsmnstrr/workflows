const fs = require('fs');

async function readData(path) {
	const rawData = await fs.readFileSync(path);
	const data = await JSON.parse(rawData);
	return data;
}

async function getIcons(path = './assets/icons.json') {
	const icons = await readData(path);
	return icons;
}

const getTitle = (icon = '') => {
  let title = icon
  title = title.replace('Icon', '')
  title = title.replace('com.apple.', '')
  title = title.replace('Sidebar', '')
  return title
}

function capitalize(str) {
	return str[0].toUpperCase() + str.slice(1);
}

module.exports = {
	capitalize,
	getIcons,
  getTitle
};
