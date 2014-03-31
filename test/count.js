var assert = require('assert'),
	sdata = require('../index.js'),
	gulp = require('gulp');

describe('count', function() {
	
	describe('basic', function() {
		it('Basic count example, not a test yet.', function() {
			
			gulp.task('count', function() {
				
				return sdata.count({end: 10})
					.pipe(sdata.echo());
				
			});
			
			gulp.run('count');
			
		});
	});
	
});
