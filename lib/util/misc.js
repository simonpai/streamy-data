var wait = function (count, callback) {
	return function () {
		if (!--count)
			callback();
	};
};

module.exports = {
	wait: wait
};
