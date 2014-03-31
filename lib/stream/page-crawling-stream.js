var BufferedReadableStream = require('./buffered-readable-stream'),
	request = require('request'),
	util = require('util');

var PageCrawlingStream = function (options) {
	options = options || {};
	
	BufferedReadableStream.call(this, options);
	
	this._nextUrl = options.start;
	if (options.step)
		this._step = options.step;
	if (options.parse)
		this._parse = options.parse;
};

util.inherits(PageCrawlingStream, BufferedReadableStream);

PageCrawlingStream.prototype._parse = function (current, result, push) {};

PageCrawlingStream.prototype._step = function (current, result) {
	return null;
};

PageCrawlingStream.prototype._more = function (push, callback) {
	
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
		
	}.bind(this));
};

module.exports = PageCrawlingStream;
