var request0 = require('request');

var _defaultWhen = function (error, response, body) {
	return error || (response.statusCode != 200);
};

var _defaultDelayFunc = function (retried, limit) {
	return 500 * (retried % 3 == 2 ? Math.pow(2, (retried - 2) / 3) : 1);
};

var request = function (url, callback, options) {
	options = options || {};
	var limit = options.limit != null ? options.limit : 5,
		when = options.when || _defaultWhen,
		delay = options.delay != null ? options.delay : _defaultDelayFunc;
	
	_request(url, callback, {
		limit: limit,
		when: when,
		delay: delay
	}, 0);
};

var _request = function (url, callback, options, retried) {
	
	var limit = options.limit,
		when = options.when,
		delay = options.delay;
	
	request0(url, function (error, response, body) {
		if (!when(error, response, body)) { // pass
			callback(error, response, body);
			
		} else if (limit > retried) {
			setTimeout(function () {
				_request(url, callback, options, retried + 1);
			}, typeof delay === 'function' ? delay(retried, limit) : delay);
			
		} else {
			callback('Cannot retrieve valid result from ' + url, response, body);
			
		}
	}.bind(this));
	
};

request.jar = request0.jar;
request.cookie = request0.cookie;

module.exports = request;
