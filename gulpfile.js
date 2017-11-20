var gulp         = require('gulp'),
    postcss      = require('gulp-postcss'),
    sass         = require('gulp-sass'),
    autoprefixer = require('autoprefixer'),
    browser      = require('browser-sync'),
    sourcemaps   = require('gulp-sourcemaps'),
    iconfont     = require('gulp-iconfont'),
    consolidate  = require('gulp-consolidate'),
    imagemin     = require('gulp-imagemin');

var path = {
    assets : {
        output : './assets/',
        outputSass : './assets/scss/**/*.scss',
        outputJs: './assets/js/**/*.js',
        outputImages: './assets/images/*',
        outputIcons: './assets/icons/*.svg'
    },
    dist : {
        output  : './dist/',
        outputStyles : './dist/css',
        outputJs: './dist/js',
        outputImages: './dist/images',
        outputFonts: './dist/fonts'
    }
}

gulp.task('sass', function () {
  return gulp.src(path.assets.outputSass)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss([ autoprefixer({ browsers: ['last 2 versions', 'ie >= 10'] }) ]))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(path.dist.outputStyles))
        .pipe(browser.stream({match: '**/*.css'}));
});

// Minifies images
gulp.task('imagemin', function () {
    gulp.src(path.assets.outputImages)
        .pipe(imagemin())
        .pipe(gulp.dest(path.dist.outputImages))
});

// Starts a BrowerSync instance
gulp.task('serve', ['sass'], function(){
  browser.init({
        server: {
            baseDir: "./"
        }
    });
});


// Runs all of the above tasks and then waits for files to change
gulp.task('default', ['serve', 'imagemin'], function() {    
  gulp.watch(['./assets/scss/**/*.scss'], ['sass']);  
  gulp.watch('./**/*.html').on('change', browser.reload);
});


// Font generator
gulp.task('build:icons', function() {
    return gulp.src([path.dist.outputIcons]) //path to svg icons
      .pipe(iconfont({
        fontName: 'iconsfont', 
        formats: ['ttf', 'eot', 'woff', 'svg'],
        centerHorizontally: true,
        fixedWidth: true,
        normalize: true
      }))
      .on("glyphs", (glyphs) => {

        gulp.src("./assets/icons/util/*.scss") // Template for scss files
            .pipe(consolidate("lodash", {
                glyphs: glyphs,
                fontName: "iconsfont",
                fontPath: "../fonts/"
            }))
            .pipe(gulp.dest("./assets/scss/icons")); //generated scss files with classes
      })
      .pipe(gulp.dest(path.dist.outputFonts)); //icon font destination
});