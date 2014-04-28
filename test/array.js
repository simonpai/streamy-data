var assert = require('assert'),
	streamy = require('../index.js');

describe('array', function () {
	
	this.timeout(3000);
	
	it('array A', function (done) {
		
		var len = 50,
			input = [],
			output = [];
		
		for (var i = 0; i < len; i++)
			input.push(i);
		
		streamy.array(input)
			.on('data', output.push.bind(output))
			.on('end', function () {
				assert.equal(output.length, len, "Output length should be " + len);
				for (var i = 0; i < len; i++)
					assert.equal(output[i], i, 
						"Unmatched content: actual: " + output[i] + " / expected: " + i);
				done();
			});
		
	});
	
});
