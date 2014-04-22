var array = require('stream-array'),
	PagedReadableStream = require('./lib/stream/paged-readable-stream'),
	WebpageCrawlingStream = require('./lib/stream/webpage-crawling-stream'),
	map = require('./lib/map'),
	enumerate = require('./lib/enumerate'),
	http = require('./lib/http'),
	ptt = require('./lib/ptt'),
	couch = require('./lib/couch');

module.exports = {
	map: map,
	array: array,
	enumerate: enumerate,
	http: http,
	ptt: ptt,
	couch: couch,
	stream: {
		PagedReadableStream: PagedReadableStream,
		WebpageCrawlingStream: WebpageCrawlingStream
	}
};
