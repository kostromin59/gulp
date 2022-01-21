'use strict';

const {
  src, dest, series, watch
} = require('gulp');

const browserSync = require('browser-sync').create();
const del = require('del');
// HTML
const htmlmin = require('gulp-htmlmin');
const fileInclide = require('gulp-file-include');
const typograf = require('gulp-typograf');
const webpHtml = require('gulp-webp-html');
// STYLES
const sass = require('gulp-sass')(require('sass'));
const plumber = require('gulp-plumber');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const notify = require('gulp-notify');
const webpCss = require('gulp-webp-css');
// IMAGES
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');
// JS
const webpackStream = require('webpack-stream');
// SVG
const svgmin = require('gulp-svgmin');
const cheerio = require('gulp-cheerio');
const replace = require('gulp-replace');
const svgSpriteGulp = require('gulp-svg-sprite');
// FONTS
const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');
// ZIP
const zip = require('gulp-zip');

const source = './src';
const output = './app';
let isProd = false;

const path = {
  src: {
    html: source + '/*.html',
    styles: source + '/scss/**/*.scss',
    css: source + '/css/**/*.css',
    img: source + '/img/**/*.{svg,jpg,png,gif,ico,webp}',
    js: source + '/js/**/*.js',
    svg: source + '/img/svg/**/*.svg',
    fonts: source + '/fonts/**/*.{woff2,woff,ttf,otf}'
  },
  output: {
    html: output,
    styles: output + '/css/',
    img: output + '/img/',
    js: output + '/js/',
    svg: output + '/img/',
    fonts: output + '/fonts/'
  },
  watch: {
    html: source + '/**/*.html',
    styles: source + '/scss/**/*.scss',
    css: source + '/css/**/*.css',
    img: source + '/img/**/*.{svg,jpg,png,gif,ico,webp}',
    js: source + '/js/**/*.js',
    svg: source + '/img/svg/**/*.svg',
    fonts: source + '/fonts/**/*.{woff2,woff,ttf,otf}'
  }
};

const clean = () => {
  return del([output]);
};

exports.clean = clean;

const html = () => {
  return src(path.src.html)
    .pipe(fileInclide({
      prefix: '@',
      basepath: '@file'
    }))
    .pipe(webpHtml())
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(typograf({ locale: ['ru', 'en-US'] }))
    .pipe(dest(path.output.html))
    .pipe(browserSync.stream());
};
exports.html = html;
watch(path.watch.html, html);

const styles = () => {
  return src([path.src.styles, path.src.css], { sourcemaps: !isProd })
    .pipe(plumber(
      notify.onError({
        title: 'SCSS',
        message: 'Error: <%= error.message %>'
      })
    ))
    .pipe(sass({
      outputStyle: 'compressed'
    }).on('error', sass.logError))
    .pipe(webpCss())
    .pipe(autoprefixer({
      cascade: false,
      grid: true
    }))
    .pipe(cleanCSS({
      level: 2
    }))
    .pipe(dest(path.output.styles, { sourcemaps: '.' }))
    .pipe(browserSync.stream());
};
exports.styles = styles;
watch([path.src.styles, path.src.css], styles);

const images = () => {
  return src(path.src.img)
    .pipe(webp({
      quality: 70
    }))
    .pipe(dest(path.output.img))
    .pipe(src(path.src.img))
    .pipe(imagemin({
      progressive: true,
      interlaced: true,
      optimizationLevel: 3
    }))
    .pipe(dest(path.output.img))
    .pipe(browserSync.stream());
};
exports.images = images;
watch(path.src.img, images);

const scripts = () => {
  return src(path.src.js)
    .pipe(plumber(
      notify.onError({
        title: 'JS',
        message: 'Error: <%= error.message %>'
      })
    ))
    .pipe(webpackStream({
      mode: isProd ? 'production' : 'development',
      output: {
        filename: 'script.js'
      },
      module: {
        rules: [{
          test: /\.m?js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', {
                  targets: 'defaults'
                }]
              ]
            }
          }
        }]
      },
      devtool: !isProd ? 'source-map' : false
    }))
    .on('error', (err) => {
      console.error('WEBPACK ERROR', err);
      this.emit('end');
    })
    .pipe(dest(path.output.js))
    .pipe(browserSync.stream());
};
exports.scripts = scripts;
watch(path.watch.js, scripts);

const svgSprite = () => {
  return src(path.src.svg)
    .pipe(
      svgmin({
        js2svg: {
          pretty: true
        }
      })
    )
    .pipe(
      cheerio({
        run: ($) => {
          $('[fill]').removeAttr('fill');
          $('[stroke]').removeAttr('stroke');
          $('[style]').removeAttr('style');
        },
        parserOptions: {
          xmlMode: true
        }
      })
    )
    .pipe(replace('&gt;', '>'))
    .pipe(svgSpriteGulp({
      mode: {
        stack: {
          sprite: '../sprite.svg'
        }
      }
    }))
    .pipe(dest(path.output.svg))
    .pipe(browserSync.stream());
};
exports.svgSprite = svgSprite;
watch(path.watch.svg, svgSprite);

const fonts = () => {
  return src(path.src.fonts)
    .pipe(ttf2woff())
    .pipe(dest(path.output.fonts))
    .pipe(src(path.src.fonts))
    .pipe(ttf2woff2())
    .pipe(dest(path.output.fonts))
    .pipe(browserSync.stream());
};
exports.fonts = fonts;
watch(path.watch.fonts, fonts);

const zipFiles = () => {
  del.sync(['*.zip']);
  return src(`${output}/**/*.*`, {})
    .pipe(plumber(
      notify.onError({
        title: 'ZIP',
        message: 'Error: <%= error.message %>'
      })
    ))
    .pipe(zip(`${output}.zip`))
    .pipe(dest(__dirname));
};
exports.zip = zipFiles;

const watchFiles = () => {
  browserSync.init({
    server: {
      baseDir: output
    }
  });
};

const toProd = (done) => {
  isProd = true;
  done();
};
exports.watchFiles = watchFiles;

exports.default = series(clean, html, styles, images, scripts, svgSprite, fonts, watchFiles);
exports.build = series(toProd, clean, html, styles, images, scripts, svgSprite, fonts);
