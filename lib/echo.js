var map = require('./map');

module.exports = function (options) {
	
	return map(function (data, callback) {
		
		console.log(data);
		callback(null, data);
		
	});
	
};