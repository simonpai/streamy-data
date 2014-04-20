var PagedReadableStream = require('./paged-readable-stream'),
	request = require('../util/request'),
	util = require('util');

var WebpageCrawlingStream = function (options) {
	options = options || {};
	
	PagedReadableStream.call(this, options);
	
	this._retryOptions = options.retry;
	
	this._nextUrl = options.start;
	if (options.step)
		this._step = options.step;
	if (options.parse)
		this._parse = options.parse;
};

util.inherits(WebpageCrawlingStream, PagedReadableStream);

WebpageCrawlingStream.prototype._parse = function (current, result, push) {};

WebpageCrawlingStream.prototype._step = function (current, result) {
	return null;
};

WebpageCrawlingStream.prototype._more = function (push, callback) {
	
	var url = this._nextUrl,
		buffer = this._buffer;
	
	request(url, function (error, response, body) {
		
		var ret = {
			error: error,
			response: response,
			body: body
		};
		
		// emit chunks
		this._parse(url, ret, push);
		
		// determine next url
		this._nextUrl = this._step(url, ret);
		
		// done if next URL is null
		callback(this._nextUrl == null);
		
	}.bind(this), this._retryOptions);
};

module.exports = WebpageCrawlingStream;
