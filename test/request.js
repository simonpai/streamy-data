var assert = require('assert'),
	sdata = require('../index.js'),
	gulp = require('gulp');

describe('request', function() {
	
	describe('basic', function() {
		it('Basic request example, not a test yet.', function() {
			
			gulp.task('request', function() {
				
				return sdata.array(['http://www.google.com', 'http://www.yahoo.com'])
					.pipe(sdata.request())
					.pipe(sdata.echo());
				
			});
			
			gulp.run('request');
			
		});
	});
	
});
