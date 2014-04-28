var assert = require('assert'),
	streamy = require('../index.js'),
	fs = require('fs');

describe('vinyl', function () {
	
	this.timeout(5000);
	
	var testPath = './test/temp';
	
	var clear = function (done) {
		fs.readdir(testPath, function(err, files) {
			var end = streamy.util.wait(files.length, function () {
				fs.rmdir(testPath, done);
			});
			files.forEach(function (fname) {
				fs.unlink(testPath + '/' + fname, end);
			});
		});
	};
	
	it('vinylify, dest', function (done) {
		
		var a = { x: 'a', y: 1 },
			b = { x: 'b', y: 2 },
			c = { x: 'c', y: 3 };
		
		streamy.array([a, b, c])
			.pipe(streamy.file.vinylify('x'))
			.pipe(streamy.file.dest(testPath))
			.on('data', function () {})
			.on('end', function () {
				assert.deepEqual(fs.readdirSync(testPath), ['a', 'b', 'c']);
				[a, b, c].forEach(function (v) {
					assert.deepEqual(JSON.parse(fs.readFileSync(testPath + '/' + v.x)), v);
				});
				clear(done);
			});
		
	});
	
});
