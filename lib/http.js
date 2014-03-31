var map = require('./map'),
	request = require('request');

module.exports = function (options) {
	
	return map(function (url, callback) {
		
		// TODO: retry policy
		
		request(url, function (error, response, body) {
			callback(error, {
				url: url,
				response: response,
				body: body
			});
		});
		
	}, options);
	
};