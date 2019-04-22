// From https://github.com/airbnb/enzyme/blob/master/docs/guides/jsdom.md

const {JSDOM} = require("jsdom");
const jsdom = new JSDOM("<!doctype html><html><body></body></html>", {url: "http://localhost:9999"});
const {window} = jsdom;

function copyProps(src, target) {
	const props = Object.getOwnPropertyNames(src)
			.filter(prop => typeof target[prop] === "undefined")
			.reduce((result, prop) => ({
				...result,
				[prop]: Object.getOwnPropertyDescriptor(src, prop),
			}), {});
	Object.defineProperties(target, props);
}

global.window = window;
global.document = window.document;
global.navigator = {
	userAgent: "node.js",
};
global.requestAnimationFrame = function (callback) {
	return setTimeout(callback, 0);
};
global.cancelAnimationFrame = function (id) {
	clearTimeout(id);
};
copyProps(window, global);
