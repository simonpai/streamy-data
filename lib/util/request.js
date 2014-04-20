var request0 = require('request');

var _defaultRetryWhen = function (error, response, body) {
	return error || (response.statusCode != 200);
};

var request = function (url, callback, options) {
	
	options = options || {};
	var retry = options.retry != null ? options.retry : 3,
		retryWhen = options.retryWhen || _defaultRetryWhen;
	
	request0(url, function (error, response, body) {
		if (!retryWhen(error, response, body)) { // pass
			callback(error, response, body);
			
		} else if (retry > 0) {
			request(url, callback, {
				retry: retry - 1,
				retryWhen: retryWhen
			});
			
		} else {
			callback('Cannot retrieve valid result from ' + url, response, body);
			
		}
	}.bind(this));
	
};

request.jar = request0.jar;
request.cookie = request0.cookie;

module.exports = request;
