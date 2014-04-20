var array = require('stream-array'),
	PagedReadableStream = require('./lib/stream/paged-readable-stream'),
	WebpageCrawlingStream = require('./lib/stream/webpage-crawling-stream'),
	map = require('./lib/map'),
	enumerate = require('./lib/enumerate'),
	http = require('./lib/http'),
	ptt = require('./lib/ptt');

module.exports = {
	map: map,
	array: array,
	enumerate: enumerate,
	http: http,
	ptt: ptt,
	stream: {
		PagedReadableStream: PagedReadableStream,
		WebpageCrawlingStream: WebpageCrawlingStream
	}
};
