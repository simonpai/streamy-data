var assert = require('assert'),
	chop = require('../index.js'),
	array = require('stream-array'),
	gulp = require('gulp');

describe('request', function() {
	
	describe('basic', function() {
		it('Basic request example, not a test yet.', function() {
			
			gulp.task('request', function() {
				
				return array(['http://www.google.com', 'http://www.yahoo.com'])
					.pipe(chop.request())
					.pipe(chop.echo());
				
			});
			
			gulp.run('request');
			
		});
	});
	
});
