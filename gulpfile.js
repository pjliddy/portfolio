var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var header = require('gulp-header');
var cleanCSS = require('gulp-clean-css');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var pkg = require('./package.json');

// gulp packages for deploying to AWS
var fs         = require("fs");
var gzip       = require('gulp-gzip');
var minifyCss  = require('gulp-minify-css');
var awspublish = require('gulp-awspublish');
var minifyHTML = require('gulp-minify-html');

// parse AWS credentials
aws = JSON.parse(fs.readFileSync('./aws.json'));
// create instance of awspublish
var publisher = awspublish.create(aws);


// defining single task with name "deploy"
gulp.task('deploy', function() {
  // only copy desired files to dist folder
  gulp.src('./css/**').pipe(gulp.dest('./dist/css'));
  gulp.src('./img/**').pipe(gulp.dest('./dist/img'));
  gulp.src('./pdf/**').pipe(gulp.dest('./dist/pdf'));
  gulp.src('./js/**').pipe(gulp.dest('./dist/js'));
  gulp.src('./vendor/**').pipe(gulp.dest('./dist/vendor'));
  gulp.src('./*.html').pipe(gulp.dest('./dist'));

  //minify css
  // gulp.src('./dist/css/*.css')
  //   .pipe(minifyCss({compatibility: 'ie8'}))
  //   .pipe(gulp.dest('./dist'));

  //gzipping css
  // gulp.src('./dist/css/*.css')
  //   .pipe(awspublish.gzip({ ext: '.gz' }))
  //   .pipe(gulp.dest('./dist'));

  //minifying html
  // gulp.src('./dist/*.html')
  //   .pipe(minifyHTML({ conditionals: true, spare:true}))
  //   .pipe(gulp.dest('./dist'));

  // var headers = { 'Cache-Control': 'max-age=315360000, no-transform, public' };

  // push all the contents of ./dist folder to s3
  // gulp.src('./dist/**')
  //   .pipe(publisher.publish(headers))
  //   .pipe(publisher.sync())
  //   .pipe(awspublish.reporter());
});

// Set the banner content
var banner = ['/*!\n',
    ' * Start Bootstrap - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
    ' * Copyright 2013-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
    ' * Licensed under <%= pkg.license.type %> (<%= pkg.license.url %>)\n',
    ' */\n',
    ''
].join('');

// Compile LESS files from /less into /css
// gulp.task('less', function() {
//     return gulp.src('less/theme.less')
//         .pipe(less())
//         .pipe(header(banner, { pkg: pkg }))
//         .pipe(gulp.dest('css'))
//         .pipe(browserSync.reload({
//             stream: true
//         }))
// });

// Minify compiled CSS
gulp.task('minify-css', ['sass'], function() {
    return gulp.src('css/theme.css')
        .pipe(cleanCSS({ compatibility: 'ie8' }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('css'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

// Minify JS
gulp.task('minify-js', function() {
    return gulp.src('js/theme.js')
        .pipe(uglify())
        .pipe(header(banner, { pkg: pkg }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('js'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

// Copy vendor libraries from /node_modules into /vendor
gulp.task('copy', function() {
    gulp.src(['node_modules/bootstrap/dist/**/*', '!**/npm.js', '!**/bootstrap-theme.*', '!**/*.map'])
        .pipe(gulp.dest('vendor/bootstrap'))

    gulp.src(['node_modules/jquery/dist/jquery.js', 'node_modules/jquery/dist/jquery.min.js'])
        .pipe(gulp.dest('vendor/jquery'))

    gulp.src([
            'node_modules/font-awesome/**',
            '!node_modules/font-awesome/**/*.map',
            '!node_modules/font-awesome/.npmignore',
            '!node_modules/font-awesome/*.txt',
            '!node_modules/font-awesome/*.md',
            '!node_modules/font-awesome/*.json'
        ])
        .pipe(gulp.dest('vendor/font-awesome'))
})

// Run everything
gulp.task('default', ['sass', 'minify-css', 'minify-js', 'copy']);

// Configure the browserSync task
gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: ''
        },
    })
})

// Dev task with browserSync
gulp.task('dev', ['browserSync', 'sass', 'minify-css', 'minify-js'], function() {
    gulp.watch('scss/*.scss', ['sass']);
    gulp.watch('css/*.css', ['minify-css']);
    gulp.watch('js/*.js', ['minify-js']);
    // Reloads the browser whenever HTML or JS files change
    gulp.watch('*.html', browserSync.reload);
    gulp.watch('js/**/*.js', browserSync.reload);
});

// Compiles SCSS files from /scss into /css
gulp.task('sass', function() {
    return gulp.src('scss/theme.scss')
        .pipe(sass())
        .pipe(header(banner, { pkg: pkg }))
        .pipe(concat('theme.css')) // this is what was missing
        .pipe(gulp.dest('./css/'))
        .pipe(browserSync.reload({
            stream: true
        }))
});
