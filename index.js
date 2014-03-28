var map = require('./lib/map'),
	request = require('./lib/request'),
	echo = require('./lib/echo');

/*
var chop = function (gulp) {
	
	var g = Object.create(gulp, {
		
		read: function (stream) {
			return stream;
		}
		
	});
	
};
chop.map = map;
chop.request = request;
chop.echo = echo;
*/

module.exports = {
	map: map,
	request: request,
	echo: echo
};
