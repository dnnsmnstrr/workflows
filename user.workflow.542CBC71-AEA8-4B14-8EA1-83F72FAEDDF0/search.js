#!/usr/bin/osascript -l JavaScript
ObjC.import('stdlib');

let sysEvents = new Application('System Events');

// load options from workflow environmnent variables
function getOptions() {
	var opts = {
		appname: getenv('app_name', 'Safari'),
		useFindPasteboard: isTrue(getenv('use_find_pasteboard', '0')),
		pressReturn: isTrue(getenv('press_return', '1')),
		waitVisible: isTrue(getenv('wait_visible', '1')),
		waitWindows: isTrue(getenv('wait_windows', '0')),
		timeout: parseFloat(getenv('timeout', '10')) * 1000,
		pause: parseFloat(getenv('delay', '0.3')),
	};
	// dump('opts', opts);
	for (var name in opts) {
		console.log(`[options] ${name}=${opts[name]}`);
	}
	return opts;
}

// Safe version of $.getenv() that returns a fallback value for unset variables.
function getenv(name, fallback) {
	try {
		var v = $.getenv(name);
	} catch (e) {
		console.log(`[env] ${name} is unset`);
		return fallback;
	}
	return ObjC.unwrap(v);
}

// return true if `s` contains a truthy value
function isTrue(s) {
	let truthy = ['1', 'yes', 'on', 'true', 't'];
	return truthy.indexOf(s.toLowerCase()) > -1;
}

// return Find pasteboard
function findPasteboard() {
	let names = [$.NSPasteboardNameFind, $.NSFindPboard];
	for (var i = 0; i < names.length; i++) {
		var pboard = $.NSPasteboard.pasteboardWithName(names[i]);
		if (typeof (ObjC.unwrap(pboard)) !== 'undefined') {
			return pboard;
		}
	}
	return null;
}

/*
// Log contents of pasteboard to console
function dumpPasteboard(pboard) {
	let types = ObjC.deepUnwrap($.NSPasteboard.generalPasteboard.pasteboardItems.js[0].types);
	types.forEach(function(type) {
		let v = ObjC.unwrap(pboard.stringForType($(type)));
		if (typeof(v) !== 'undefined') {
			console.log(`${type}=${v}`);
		}
	});
}
*/

// Set contents of Search Pasteboard
function setSearchPasteboard(query) {
	ObjC.import('AppKit');
	let pboard = findPasteboard();
	if (pboard) {
		pboard.clearContents;
		return pboard.setStringForType($(query), $('public.utf8-plain-text'));
	}
	return false;
}


// activate app and wait for its windows to show
function activate(app, options) {
	var opts = options || {};
	opts.timeout = (opts.timeout || 10) * 1000;
	opts.waitVisible = opts.waitVisible !== false ? true : false;
	opts.waitWindows = opts.waitWindows !== true ? false : true;

	let bundleId = app.id(),
		appName = app.name();
	// dump('app', app.properties());
	console.log(`[activate] appName=${app.name()}, bundleId=${bundleId}`);
	// console.log(`[activate] activating ${appName} ...`);
	app.activate();

	var proc = sysEvents.processes.whose({ bundleIdentifier: bundleId })[0],
		props;
	try {
		props = proc.properties()
	} catch (e) {  // process not found
		throw (`${appName} process not found`);
	}

	if (opts.waitVisible) {
		// wait for visible
		var start = new Date().getTime();
		while (!proc.visible()) {
			delay(0.1);
			if ((new Date().getTime() - start) > opts.timeout) {
				throw (`timeout waiting for ${appName}`);
			}
		}
		console.log(`[activate] ${appName} is visible`);
	}

	if (opts.waitWindows) {
		var start = new Date().getTime();
		while (app.windows.length == 0) {
			delay(0.1);
			if ((new Date().getTime() - start) > opts.timeout) {
				throw (`timeout waiting for ${appName} windows`);
			}
		}
		console.log(`[activate] ${appName} has windows`);
	}
}


function run(argv) {
	console.log('.');
	var start = new Date().getTime(),
		query = argv[0],
		opts;

	console.log(`[options] query=${query}`);
	opts = getOptions();
	// console.log(`searching for “${query}” in ${opts.appname} ...`);

	let app = new Application(opts.appname);
	
	if (opts.useFindPasteboard && !setSearchPasteboard(query))
		return `Couldn't set search pasteboard`;

	try {
		activate(app, opts);
	} catch (e) {
		return e;
	}

	// simulate CMD+F
	sysEvents.keystroke('f', { using: 'command down' });

	if (opts.useFindPasteboard) {
		if (opts.pressReturn) {
			delay(opts.pause);  // give form time to appear
			sysEvents.keyCode(36);  // return
		}
	} else {
		delay(opts.pause);  // give form time to appear
		sysEvents.keystroke(query);
		if (opts.pressReturn) sysEvents.keyCode(36);  // return
	}
	console.log(`done in ${(new Date().getTime() - start) / 1000.0}s`);
}