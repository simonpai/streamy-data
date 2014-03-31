var gulp = require('gulp'),
	mocha = require('gulp-mocha');

gulp.task('default', ['build', 'test']);

gulp.task('build', function() {
	
});

gulp.task('test', function() {
	
	return gulp.src(['test/*.js'])
		.pipe(mocha({ reporter: 'dot' }));
	
});
