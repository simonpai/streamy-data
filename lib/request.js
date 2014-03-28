var map = require('./map'),
	request = require('request');

module.exports = function (options) {
	
	return map(function (data, callback) {
		
		// TODO: retry policy
		
		request(data, function (error, response, body) {
			callback(error, {
				request: data,
				response: response,
				body: body
			});
		});
		
	}, options);
	
};