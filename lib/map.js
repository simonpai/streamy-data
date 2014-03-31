var stream = require('stream');

var m = function (map, options) {
	
	options = options || {};
	options.objectMode = true;
	
	var s = new stream.Transform(options);
	
	s._transform = function (data, encoding, callback) {
		map(data, callback);
	};
	
	if (options.flush)
		s._flush = options.flush;
	
	return s;
	
};

m.sync = function (mapSync, options) {
	
	return m(function (data, callback) {
		
		callback(null, mapSync(data));
		
	}, options);
	
};

module.exports = m;
