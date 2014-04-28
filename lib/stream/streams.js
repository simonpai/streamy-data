var endsOf = function (streams, callback) {
	var len = streams && streams.length;
	if (!len) {
		callback();
		return;
	}
	
	streams.forEach(function (s) {
		s
		.on('data', function () {})
		.on('end', function () {
			if (!--len)
				callback();
		});
	});
};

module.exports = {
	endsOf: endsOf
};
