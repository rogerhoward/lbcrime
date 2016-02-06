'use strict';

/* jshint node: true, esversion: 6 */
const gulp = require('gulp'),
    del = require('del'),
    rev = require('gulp-rev'),
    ts = require('gulp-typescript'),
    bowerFiles = require('main-bower-files'),
    sass = require('gulp-sass'),
    debug = require('gulp-debug'),
    mocha = require('gulp-mocha'),
    jade = require('gulp-jade'),
    utils = require('gulp-util'),
    nodemon = require('gulp-nodemon'),
    runSequence = require('run-sequence'),
    gulpif = require('gulp-if'),
    es = require('event-stream'),
    yaml = require('gulp-yaml'),
    cssnano = require('gulp-cssnano'),
    concat = require('gulp-concat'),
    ngAnnotate = require('gulp-ng-annotate'),
    uglify = require('gulp-uglify'),
    ngFileSort = require('gulp-angular-filesort'),
    plumber = require('gulp-plumber'),
    stripDebug = require('gulp-strip-debug'),
    browserSync = require('browser-sync').create(),
    Karma = require('karma').Server,
    inject = require('gulp-inject');

var env = process.env.ENV || 'development';
var devFolder = '.dev/';
var buildFolder = '.dist/';

var stagingFolder = ".staging/";
var opts = {};
var production;
var outputFolder;


(function(env) {
  switch (env) {
    case "production":
      production = true;
      outputFolder = buildFolder;
      process.env.NODE_ENV = 'production';
      opts.production = utils.colors.white.bgRed('true');
      opts.env = utils.colors.white.bgRed('production');
      utils.beep();
      break;
    case "staging":
      production = true;
      outputFolder = stagingFolder;
      process.env.NODE_ENV = 'production';
      opts.production = utils.colors.white.bgRed('true');
      opts.env = utils.colors.yellow('staging');
      break;
    default:
      production = false;
      outputFolder = devFolder;
      opts.production = utils.colors.green('false');
      opts.env = utils.colors.green('development');
      break;
  }

  opts.outputFolder = utils.colors.blue(outputFolder);

  var text = "Start Gulping in " + opts.env + " Environment, with Production set to " + opts.production + ", outputting files to " + opts.outputFolder;
  utils.log(text);
})(env);

var bowerCss = bowerFiles({filter: '**/*.css'});
var bowerJS = bowerFiles({filter: '**/*.js'});
var bowerAssets = bowerFiles({filter: '**/*.{eot,otf,svg,ttc,ttf,woff,woff2,png}'});

gulp.task('default', function() {
  utils.log('oida');
});

gulp.task('clean', function() {
  return del(['server/**/*.js',
       'client/src/**/*.js',
       devFolder + '**/*',
       stagingFolder + '**/*',
       buildFolder + '**/*']);
});


gulp.task('config', function() {

  return gulp.src(['package.json', 'web.config', 'IISNode.yml', 'deploy.sh', './.deployment'])
             .pipe(gulp.dest(outputFolder));
});

gulp.task('assets', function() {
  var assets =  gulp.src('client/assets/**/*.*')
                    .pipe(gulp.dest(outputFolder + 'client/assets/'));

  return assets;
});

gulp.task('applicationView', function() {
  var appView = gulp.src('server/views/application.jade')
                    .pipe(gulp.dest(outputFolder + 'server/views'));
});

gulp.task('server', function() {
  var server =  gulp.src(['server.ts', 'server/**/*.ts'])
                     .pipe(plumber())
                     .pipe(ts({
                       module: 'commonjs',
                       target: 'es6',
                       removeComments: true,
                       outDir: 'server/'
                     }))
                     .pipe(gulp.dest(outputFolder));

  server.on('error', function(err) {
    console.log(err);
  });
  return server;
});

gulp.task('scripts', function() {
  var scripts = gulp.src(['client/src/**/*.ts'])
                   .pipe(plumber())
                   .pipe(ts({
                     module: 'commonjs',
                     target: 'ES5',
                     removeComments: true,
                     sourceMap: true
                   }))
                   .pipe(ngFileSort())
                   .pipe(gulpif(production, ngAnnotate()))
                   .pipe(gulpif(production, concat('app.js')))
                   .pipe(gulpif(production, uglify()))
                   .pipe(gulpif(production, rev()))
                   .pipe(gulp.dest(outputFolder + 'client/src/'));






  scripts.on('error', function(err) {

  });

  return scripts;
});



gulp.task('styles', ['inject:scss'],  function() {
  var styles = gulp.src(['client/styles/main.scss'])
                   .pipe(plumber())
                   .pipe(sass({
                     includePaths: 'client/bower_components/'
                   }).on('error', sass.logError))
                   .pipe(gulpif(production, concat('app.css')))
                   .pipe(gulpif(production, cssnano()))
                   .pipe(gulpif(production, rev()))
                   .pipe(gulp.dest(outputFolder + 'client/styles/'))
                  //  .pipe(gulpif(!production, livereload()));
                   .pipe(browserSync.stream());


  styles.on('error', function(err) {
    utils.log(err);
  });
  return styles;
});

gulp.task('vendor', function() {
  var scripts = gulp.src(bowerJS, {base: 'client/bower_components'})
                    .pipe(gulpif(production, concat('vendor.js')))
                    .pipe(gulpif(production, ngAnnotate()))
                    .pipe(gulpif(production, uglify()))
                    .pipe(gulpif(production, rev()))
                    .pipe(gulp.dest(outputFolder + 'client/vendor/scripts'));

  var styles = gulp.src(bowerCss, {base: 'client/bower_components'})
                   .pipe(gulpif(production, concat('vendor.css')))
                   .pipe(gulpif(production, cssnano()))
                   .pipe(gulpif(production, rev()))
                   .pipe(gulp.dest(outputFolder + 'client/vendor/styles'));

  var assets = gulp.src(bowerAssets, {base: 'client/bower_components'})
                   .pipe(gulp.dest(outputFolder + 'client/vendor/assets'));

  return es.merge(scripts, styles, assets);
});

gulp.task('views', function() {
  var views = gulp.src(['client/src/**/*.jade'])
                  .pipe(plumber())
                  .pipe(jade({
                    pretty: true
                  }))
                  // .pipe(gulpif(!production, livereload()))
                  .pipe(gulp.dest(outputFolder + 'client/src'));
                  // .pipe(browserSync.reload);


  views.on('error', function(err) {
    console.log('View Error');
  });
  return views;
});

gulp.task('yaml', function() {
  var yamlPipe = gulp.src('locales/**.yml')
                 .pipe(plumber())
                 .pipe(yaml({space: 2}))
                 .pipe(gulp.dest(outputFolder + 'client/assets/locales'));
                //  .pipe(gulpif(!production, livereload()));
                //  .pipe(browserSync.reload);


  return yamlPipe;
});

gulp.task('inject', ['scripts', 'styles'], function() {
  var target = outputFolder + '/server/views';
  var injector = gulp.src(target + '/application.jade')
                    .pipe(inject(gulp.src(bowerJS, {read: false}), {
                      name: 'vendor',
                      ignorePath: [outputFolder, 'client'],
                      transform: function(filePath, file) {
                       filePath = filePath.replace('bower_components', 'vendor/scripts');
                       return "script(src='" + filePath + "')";
                      }
                    }))
                    .pipe(inject(gulp.src(bowerCss, {read: false}), {
                      name: 'vendor',
                      ignorePath: [outputFolder, 'client'],
                      transform: function(filePath, file) {
                       filePath = filePath.replace('bower_components', 'vendor/styles');
                       return "link(rel='stylesheet' href='" + filePath + "')";
                      }
                    }))
                    .pipe(inject(gulp.src([outputFolder + 'client/styles/**/*.css'], {read: false}), {
                      name: 'app',
                      ignorePath: [outputFolder, 'client']
                    }))
                    .pipe(inject(gulp.src([outputFolder + 'client/src/**/*.js']).pipe(ngFileSort()), {
                      name: 'app',
                      ignorePath: [outputFolder, 'client']
                    }))
                    .pipe(gulp.dest(outputFolder + 'server/views/'));

  return injector;

});

gulp.task('inject:karma', function() {
  var target = "test/specs/client/karma.conf.js";
  var injector = gulp.src(target)
                     .pipe(inject(gulp.src(outputFolder + "client/src/**/*.js").pipe(ngFileSort()), {
                       starttag: '// app:js',
                       endtag: '// endinject',
                       addRootSlash: false,
                       transform: function(filepath, file, i, length) {
                         return '\'' + filepath + '\','.replace('/.', '');
                       }
                     }))
                     .pipe(gulp.dest("test/specs/client/"));
                     
});


gulp.task('inject:build', ['scripts', 'styles', 'vendor'], function() {
  var injector = gulp.src('./server/views/application.jade')
                     .pipe(inject(gulp.src([outputFolder + 'client/vendor/**/*.js', outputFolder + 'client/vendor/**/*.css'], {read: false}), {
                       name: 'vendor',
                       ignorePath: [outputFolder, 'client']
                     }))
                     .pipe(inject(gulp.src([outputFolder + 'client/src/**/*.js', outputFolder + 'client/styles/**/*.css'], {read: false}), {
                       name: 'app',
                       ignorePath: [outputFolder, 'client']
                     }))
                     .pipe(gulp.dest(outputFolder + 'server/views'));
   return injector;

});

gulp.task('inject:scss', function() {
  return gulp.src('client/styles/main.scss')
             .pipe(inject(gulp.src(['client/styles/**/**.scss', '!client/styles/main.scss'], {read: false}), {
               starttag: '// inject',
               endtag: '// endinject',
               ignorePath: ['client', 'styles'],
               transform: function(filePath, file) {
                 filePath = filePath.replace('/', '');
                 return "@import '" + filePath + "';";
               }
             }))
             .pipe(gulp.dest('client/styles/'));
});

gulp.task('start', ['watch'], function() {
  return nodemon({
    script: devFolder + 'server.js',
    watch: [
      '.dev/server/'
    ],
    delay: '2',
    ext: 'js ts'
  });
});

gulp.task('start:build', function() {
  return nodemon({
    script: outputFolder + 'server.js',
    env: {
      NODE_ENV: 'production',
      port: 3000
    }
  });
});


gulp.task('watch', function() {
  // livereload.listen();
  gulp.watch('client/styles/**/*.scss', ['styles']).on('change', function() {
    utils.log('SCSS Change!');
  });

  gulp.watch('client/src/**/*.ts', ['inject']).on('change', function() {
    utils.log('Scripts change');
    browserSync.reload();
  });

  gulp.watch(['server.ts', 'server/**/*.ts'], ['server']).on('change', function() {
    utils.log('server change');
  });

  gulp.watch(['client/src/**/*.jade'], ['views']).on('change', function() {
    utils.log('Views change');
    browserSync.reload();
  });

  gulp.watch('client/views/application.jade', ['applicationView', 'inject']).on('change', function() {
    utils.log('Main View Change');
    browserSync.reload();

  });

  gulp.watch('locales/**.yml', ['yaml']).on('change', function() {
    utils.log('YAML update');
    browserSync.reload();
  });
});



gulp.task('karma-server', function(done) {
  new Karma({
    configFile: __dirname + '/test/specs/client/karma.conf.js',
  }, done).start();
});

gulp.task('test:server', function() {
  return gulp.src('./test/specs/server/**/*.js')
             .pipe(mocha())
             .on('error', function(err) {
               if (env === "production") {
                 process.exit(1);
               } else {
                 this.emit('end');
               }
             });
});

gulp.task('watch-test', function() {
  gulp.watch(['test/specs/**/*.js'], ['test:server']);
  gulp.watch(['server/**/*.ts'], function() {
    return runSequence('server', 'test:server');
  });
});

gulp.task('run', function(cb) {
  if (env === "staging" || env === "production") {
    return runSequence('clean',
                       ['assets', 'views', 'config', 'server', 'yaml', 'applicationView'],
                       'inject:build',
                       'start:build',
                       cb);
  } else {
    return runSequence('clean',
                       'vendor',
                       ['assets', 'views', 'config', 'server', 'applicationView', 'yaml'],
                       'inject',
                       'browser-sync',
                        cb);
  }

});



gulp.task('browser-sync', ['start'], function() {
  browserSync.init({
    proxy: 'http://localhost:3000',
    port: '3001'
  });
});


gulp.task('build', function(cb) {
  return runSequence('clean',
                     ['assets', 'views', 'config', 'server', 'yaml', 'applicationView'],
                     'inject:build',
                     cb);
});

gulp.task('karma', function(cb) {
  return runSequence('clean', 
                     ['config', 'scripts', 'yaml'],
                     'inject:karma',
                     'karma-server',
                     cb)
});



gulp.task('mocha', function(cb) {
  return runSequence('clean',
                     ['assets', 'views', 'config', 'server', 'yaml', 'applicationView'],
                     'test:server',
                     'watch-test',
                     cb)
});
