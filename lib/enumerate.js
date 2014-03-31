var stream = require('stream');

module.exports = function (options) {
	
	options = options || {};
	options.objectMode = true;
	
	var start = options.start || 0,
		step = options.step || 1,
		end = options.end,
		stepF,
		endF;
	
	if (typeof start === 'function') {
		start = start();
	}
	
	if (typeof step === 'function') {
		stepF = step;
	} else if (typeof step === 'number') {
		stepF = function (n) { return n + step; };
	} else {
		throw "options.step must be either a function or a number.";
	}
	
	if (typeof end === 'function') {
		endF = end;
	} else if (typeof end === 'number') {
		if (typeof step === 'number' && step != 0) {
			endF = step > 0 ? 
				function (n) { return n >= end; } :
				function (n) { return n <= end; };
		} else {
			endF = function (n) { return n == end; };
		}
		
	} else {
		throw "options.end must be either a function or a number.";
	}
	
	var rs = new stream.Readable(options);
	rs._next = start;
	rs._step = stepF;
	rs._end = endF;
	
	rs._read = function () {
		if (rs._end(rs._next)) {
			rs.push(null);
			return;
		}
		rs.push(rs._next);
		rs._next = rs._step(rs._next);
	};
	
	return rs;
	
};
