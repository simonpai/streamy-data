var map = require('./map');

module.exports = function (options) {
	
	var mapper = options && options.map,
		where = options && options.where,
		hasMap = typeof mapper === 'function',
		hasWhere = typeof where === 'function';
	
	return map(function (data, callback) {
		
		if (!hasWhere || where(data))
			console.log(hasMap? mapper(data) : data);
		
		callback(null, data);
		
	});
	
};
