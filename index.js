var map = require('./lib/map'),
	request = require('./lib/request'),
	echo = require('./lib/echo'),
	count = require('./lib/count'),
	PageCrawlingStream = require('./lib/page-crawling-stream'),
	ptt = require('./lib/ptt');

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
	echo: echo,
	count: count,
	PageCrawlingStream: PageCrawlingStream,
	ptt: ptt
};
