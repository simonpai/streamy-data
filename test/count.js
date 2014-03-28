var assert = require('assert'),
	chop = require('../index.js'),
	gulp = require('gulp');

describe('count', function() {
	
	describe('basic', function() {
		it('Basic count example, not a test yet.', function() {
			
			gulp.task('count', function() {
				
				return chop.count({end: 10})
					.pipe(chop.echo());
				
			});
			
			gulp.run('request');
			
		});
	});
	
});
