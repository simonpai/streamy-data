var stream = require('stream');

module.exports = function (map, options) {
	
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