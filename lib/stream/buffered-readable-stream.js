var stream = require('stream'),
	util = require('util'),
	Dequeue = require('dequeue');

Dequeue.prototype.isEmpty = function () {
	return this.length == 0;
}

var BufferedReadableStream = function (options) {
	options = options || {};
	options.objectMode = true;
	
	stream.Readable.call(this, options);
	
	this._buffer = new Dequeue();
	
	if (options.more)
		this._more = options.more;
};

util.inherits(BufferedReadableStream, stream.Readable);

// trivial default implementation
BufferedReadableStream.prototype._more = function (push, callback) {
	callback(end);
};

BufferedReadableStream.prototype._pushBuffered = function () {
	var buffer = this._buffer;
	
	while (!buffer.isEmpty()) {
		if (this.push(buffer.shift()) === false)
			break;
	}
};

BufferedReadableStream.prototype._read = function (size) {
	var buffer = this._buffer;
	
	if (!buffer.isEmpty()) {
		this._pushBuffered();
		
	} else if (this._done) {
		this.push(null);
		
	} else {
		this._more(buffer.push.bind(buffer), function (done) {
			if (done)
				this._done = true;
			this._pushBuffered();
		}.bind(this));
	}
};

module.exports = BufferedReadableStream;
