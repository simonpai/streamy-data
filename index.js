var array = require('stream-array'),
	BufferedReadableStream = require('./lib/stream/buffered-readable-stream'),
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
		BufferedReadableStream: BufferedReadableStream,
		WebpageCrawlingStream: WebpageCrawlingStream
	}
};
