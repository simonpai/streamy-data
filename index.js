var array = require('stream-array'),
	PagedReadableStream = require('./lib/stream/paged-readable-stream'),
	WebpageCrawlingStream = require('./lib/stream/webpage-crawling-stream'),
	map = require('./lib/map'),
	echo = require('./lib/echo'),
	enumerate = require('./lib/enumerate'),
	http = require('./lib/http'),
	ptt = require('./lib/ptt');

module.exports = {
	map: map,
	echo: echo,
	array: array,
	enumerate: enumerate,
	http: http,
	ptt: ptt,
	stream: {
		PagedReadableStream: PagedReadableStream,
		WebpageCrawlingStream: WebpageCrawlingStream
	}
};
