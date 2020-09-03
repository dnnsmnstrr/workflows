const alfy = require('alfy');
const {getIcons, getTitle} = require('./helper');

const data = await getIcons()

const items = alfy
	.inputMatches(data, 'title')
	.map(element => ({
		title: getTitle(element),
		subtitle: 'Paste icon name',
		arg: element,
    icon: {
      path: alfy.icon.get(element)
    },
    mods: {
      alt: {
        valid: true,
        arg: `/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/${element}.icns`,
        subtitle: 'Paste full path'
      },
      cmd: {
        valid: true,
        subtitle: 'Paste alfy icon object',
        arg: `icon: {
  path: alfy.icon.get('${element}')
},`
      }
    }
	}));

alfy.output(items);
