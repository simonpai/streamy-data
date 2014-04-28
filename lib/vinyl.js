var map = require('./map'),
	File = require('vinyl'),
	fs = require('vinyl-fs');

var vinylify = function (path, options) {
	options = options || {};
	var stringify = options.stringify != null ? stringify : true,
		pathIsFunc = typeof path === 'function';
	
	return map.sync(function (data) {
		return new File({
			path: pathIsFunc ? path(data) : data[path],
			contents: new Buffer(stringify ? JSON.stringify(data) : data)
		});
	});
};

var unvinylify = function (options) {
	options = options || {};
	var parse = options.parse != null ? parse : true;
	
	return map(function (file, callback) {
		if (file.isNull()) {
			callback(); // ignore this entry
			
		} else if (file.isBuffer()) {
			var res = file.contents.toString();
			callback(null, parse ? JSON.parse(res) : res);
			
		} else { // content is stream
			var res = '';
			file.contents
			.on('data', function (chunk) {
				res += chunk;
			})
			.on('end', function () {
				callback(null, parse ? JSON.parse(res) : res);
			});
		}
	});
};

module.exports = {
	src: fs.src,
	dest: fs.dest,
	vinylify: vinylify,
	unvinylify: unvinylify
};