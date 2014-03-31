var mapStream = require('./map');

module.exports = function (map, where, options) {
	
	var map = options && options.map,
		where = options && options.where,
		hasMap = typeof map === 'function',
		hasWhere = typeof where === 'function';
	
	return mapStream(function (data, callback) {
		
		if (!hasWhere || where(data))
			console.log(hasMap? map(data) : data);
		
		callback(null, data);
		
	});
	
};
