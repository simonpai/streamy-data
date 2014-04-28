var array = require('stream-array'),
	request = require('./lib/util/request'),
	htmlparser = require('./lib/util/htmlparser'),
	misc = require('./lib/util/misc'),
	streams = require('./lib/stream/streams'),
	PagedReadableStream = require('./lib/stream/paged-readable-stream'),
	WebpageCrawlingStream = require('./lib/stream/webpage-crawling-stream'),
	map = require('./lib/map'),
	enumerate = require('./lib/enumerate'),
	http = require('./lib/http'),
	ptt = require('./lib/ptt'),
	couch = require('./lib/couch'),
	file = require('./lib/vinyl');

module.exports = {
	map: map,
	array: array,
	enumerate: enumerate,
	http: http,
	ptt: ptt,
	couch: couch,
	file: file,
	stream: {
		endsOf: streams.endsOf,
		PagedReadableStream: PagedReadableStream,
		WebpageCrawlingStream: WebpageCrawlingStream
	},
	util: {
		request: request,
		htmlparser: htmlparser,
		wait: misc.wait
	}
};
