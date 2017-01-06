/**
 * Created by dmeredith1 on 12/2/2016.
 */

var gulp = require('gulp');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
var notify = require('gulp-notify');
var browserSync = require('browser-sync');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var gulpIf = require('gulp-if');
var nunjucksRender = require('gulp-nunjucks-render');
var data = require("gulp-data");
var del = require('del');
var runSequence = require('run-sequence');
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var scssLint = require('gulp-scss-lint');
var Server = require('karma').Server;
var fs = require('fs');


function customPlumber(errTitle) {
    return plumber({
        errorHandler: notify.onError({
            title: errTitle || "Error running Gulp",
            message: "Error: <%=error.message %>"
        })
    });
}

gulp.task('test',function(done){
    new Server({
        configFile: process.cwd() + '/karma.conf.js',
        singleRun:true
    }, done).start();
})
gulp.task('lint:scss',function(){
    return gulp.src('app/scss/**/*.scss')
        .pipe(scssLint({
            config: '.scss-lint.yml'
        }))
});
gulp.task("lint:js", function () {
    return gulp.src('app/js/**/*.js')
        .pipe(customPlumber("JSHint Error"))
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail', {
            ignoreWarning: true,
            ignoreInfo: true
        }))
        .pipe(jscs({
            fix: true,
            configPath: '.jscsrc'
        }))
        .pipe(gulp.dest('app/js'));
});

gulp.task('sass', function () {
    return gulp.src('app/scss/**/*.scss')
        .pipe(customPlumber('Error Running Sass'))
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: ['app/bower_components', 'node_modules'],
            precision: 2
        }))
        .pipe(autoprefixer({
            browsers: ['ie 8-9', 'last 2 versions']
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('app/css'))
        .pipe(browserSync.reload({
            stream: true
        }))
});
gulp.task('browserSync', function () {
    browserSync({
        server: {
            baseDir: 'app'
        }
    })
});
gulp.task("nunjucks", function () {

    return gulp.src('app/pages/**/*.+(html|nunjucks)')
        .pipe(customPlumber('Error Running Nunjucks'))
        .pipe(data(function () {
            return JSON.parse(fs.readFileSync('./app/data.json'))
        }))
        .pipe(nunjucksRender({
            path: ['app/templates/'],
            watch: false
        }))
        .pipe(gulp.dest('app'))
        .pipe(browserSync.reload({
            stream: true
        }))
});
gulp.task('clean:dev', function () {
    del([
        'app/css',
        'app/*.+(html|nunjucks)'
    ]);
});
gulp.task('watch', function () {
    gulp.watch('app/scss/**/*.scss',['sass','lint:scss']);
    gulp.watch([
        'app/templates/**/*',
        'app/pages/**/*.+(html|nunjucks)',
        'app/data.json'
    ], ['nunjucks']);

    gulp.watch('app/js/**/*.js', ['lint:js'])
    gulp.watch('app/js/**/*.js', browserSync.reload);
    
});

gulp.task('default', function () {
    runSequence('clean:dev',
        ['lint:js', 'lint:scss'],
        ['sass', 'nunjucks'],
        ['browserSync', 'watch'],
        function () {

        });
});