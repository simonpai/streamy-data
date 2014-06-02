var wait = function (count, callback) {
	var result = {};
	return function (name, data) {
		if (name != null)
			result[name] = data;
		if (!--count)
			callback(result);
	};
};

module.exports = {
	wait: wait
};
