var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var del = require('del');
var es = require('event-stream');
var bowerFiles = require('main-bower-files');
var browserSync = require('browser-sync');
// If you use jade in your project you must set variable 'useJade' equal 'TRUE'
var useJade = false;
// If we want see error logs
var log = function (error) {
  console.log([
    '',
    "----------ERROR MESSAGE START----------",
    ("[" + error.name + " in " + error.plugin + "]"),
    error.message,
    "----------ERROR MESSAGE END----------",
    ''
  ].join('\n'));
  this.end();
};
/* = = =
  |
  | PATH SEGMENT
  |
   = = = */
var paths = {
  scripts: 'app/**/*.js', //path for our js files
  styles: ['./app/css/**/*.css', './app/css/**/*.less'], //path for our *.css and *.less
  images: 'app/img/**/*', //path for our images
  index: 'app/index.html', //path for our index.html
  indexJade: 'app/index.jade', //path for our index.jade
  partials: ['app/**/*.html', 'app/**/*.tpl', '!app/index.html'], //path for our *.html files
  partialsJade: ['app/**/*.jade', '!app/index.jade'], //path for our *.jade files
  distDev: 'dist.dev', //path for our DEV directory
  distProd: 'dist.prod', //path for our PROD directory
  distDevCss: 'dist.dev/css', //path for our DEV directory and CSS folder
  distProdCss: 'dist.prod/css', //path for our PROD directory and CSS folder
  distDevImg: 'dist.dev/img', //path for our DEV directory and IMG folder
  distProdImg: 'dist.prod/img', //path for our DEV directory and IMG folder
  distScriptsProd: 'dist.prod/scripts' //path for our PROD directory and JS folder
};
/* = = =
 |
 | PIPE SEGMENT
 |
 = = = */
var pipes = {};
// Sorts our scripts, first jQuery, and then angular
pipes.orderedVendorScripts = function() {
  return plugins.order(['jquery.js', 'angular.js']);
};
// Check our JS scripts through jsHint
pipes.validatedAppScripts = function() {
  return gulp.src(paths.scripts)
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter('jshint-stylish'));
};
// Built index.jade file or gulp.src index.html
pipes.buildIndexFile = function() {
  if (useJade) {
    return gulp.src(paths.indexJade)
      .pipe(plugins.plumber({
        errorHandler: function (error) {
          console.log(error.message);
          this.emit('end');
        }}))
      .pipe(plugins.jade())
      .pipe(plugins.prettify({indent_size: 2}))
  } else {
    return gulp.src(paths.index);
  }
};
/* = = =
 | DEV PIPE SEGMENT
 = = = */
// Copy all the scripts from the bower_components and then moves to DEV directory

pipes.builtVendorScriptsDev__ = function() {
  return gulp.src(bowerFiles())
	.pipe(plugins.if(('**/*.less'), plugins.less()))
    .pipe(gulp.dest(paths.distDev + '/bower_components'));
};


pipes.builtVendorScriptsDev = function() {
  return gulp.src(bowerFiles({
		overrides: {
			bootstrap: {
				main: [
					//'./dist/js/bootstrap.js',
					//'./dist/css/*.min.*',
					'./dist/css/bootstrap.css',
					'./dist/css/bootstrap-theme.css',
					'./dist/fonts/*.*'
				]
			}
		}
	}))
	//.pipe(plugins.if(('**/*.less'), plugins.less()))

	.pipe(plugins.if(('**/*.css'), 
		plugins.cssUrlAdjuster({
			replace:  ['../fonts/','/bower_components/'] //When we use sprite we have wrong path for our sprite, this is fixed
		})
	))

	
	/*
	
	*/
	
	
    .pipe(gulp.dest(paths.distDev + '/bower_components'));
};






// Built App Script and then moves to DEV directory
pipes.builtAppScriptsDev = function() {
  //return pipes.validatedAppScripts()
  return gulp.src(paths.scripts)
    .pipe(plugins.ngAnnotate()) // We use ngAnnotate for inject on Angular
    .pipe(plugins.concat('app.js'))
    .pipe(gulp.dest(paths.distDev));
};
// Built Style scss file
pipes.builtStylesDev___ = function() {
    return gulp.src('./app/scss/**/*.scss')
      .pipe(plugins.plumber({
        errorHandler: function (error) {
          console.log(error.message);
          this.emit('end');
        }}))
      .pipe(plugins.compass({
          sourcemap: true,
          css: paths.distDevCss,
          sass: './app/scss/',
          image: './app/img/',
          require: ['compass', 'singularitygs']
      }))
      .pipe(plugins.cssUrlAdjuster({
        replace:  ['../../app/img','../img/'] //When we use sprite we have wrong path for our sprite, this is fixed
      }))
      .pipe(gulp.dest(paths.distDevCss));
};
pipes.builtStylesDev=function(){
	return gulp.src(paths.styles)
		.pipe(plugins.less(paths.styles))
		//.pipe(gulp.dest(paths.distDev+'/css/'));	
		.pipe(gulp.dest(paths.distDevCss));
};


// Built all others jade file or html files and then moves to DEV directory
pipes.builtPartialsFilesDev = function() {
  if (useJade) {
    return gulp.src(paths.partialsJade)
        .pipe(plugins.plumber())
        .pipe(plugins.jade())
        .pipe(plugins.prettify({indent_size: 2}))
        .pipe(gulp.dest(paths.distDev));
  } else {
    return gulp.src(paths.partials)
        .pipe(plugins.htmlhint({'doctype-first': false}))
        .pipe(plugins.htmlhint.reporter())
        .pipe(gulp.dest(paths.distDev));
  }
};
// Copy images files and then moves to DEV directory
pipes.processedImagesDev = function() {
  return gulp.src(paths.images)
      .pipe(gulp.dest(paths.distDevImg));
};
// Built all project
pipes.builtIndexDev = function() {
  var orderedVendorScripts = pipes.builtVendorScriptsDev()
    .pipe(pipes.orderedVendorScripts());
	
	
  var orderedAppScripts = pipes.builtAppScriptsDev();
  
  var appStyles = pipes.builtStylesDev();
  //var appVendorStyles = pipes.builtVendorStyleDev();
  
  return pipes.buildIndexFile()
    .pipe(gulp.dest(paths.distDev)) // write first to get relative path for inject
    .pipe(plugins.inject(orderedVendorScripts, {relative: true, name: 'bower',  addRootSlash: true}))
    .pipe(plugins.inject(orderedAppScripts, {relative: true, addRootSlash: true}))
    //.pipe(plugins.inject(appVendorStyles, {relative: true}))
    .pipe(plugins.inject(appStyles, {relative: true,  addRootSlash: true}))
    .pipe(gulp.dest(paths.distDev));
};
// Run streaming Assembly
pipes.builtAppDev = function() {
  return es.merge(pipes.builtIndexDev(), pipes.builtPartialsFilesDev(), pipes.processedImagesDev());
};
/* = = =
 | PROD PIPE SEGMENT
 = = = */
// Built all others jade file or html files and then moves to PROD directory, before we check our files through htmlHint
pipes.builtPartialsFilesProd = function() {
  if (useJade) {
    return gulp.src(paths.partialsJade)
        .pipe(plugins.plumber())
        .pipe(plugins.jade())
        .pipe(plugins.prettify({indent_size: 2}))
        .pipe(plugins.htmlhint({'doctype-first': false}))
        .pipe(plugins.htmlhint.reporter())
        .pipe(plugins.htmlmin({collapseWhitespace: true, removeComments: true}))
        .pipe(gulp.dest(paths.distProd));
  } else {
    return gulp.src(paths.partials)
        .pipe(plugins.htmlhint({'doctype-first': false}))
        .pipe(plugins.htmlhint.reporter())
        .pipe(plugins.htmlmin({collapseWhitespace: true, removeComments: true}))
        .pipe(gulp.dest(paths.distProd));
  }
};
// Built App Script concat, minification and then moves to PROD directory
pipes.builtAppScriptsProd = function() {
  //return pipes.validatedAppScripts()
  return gulp.src(paths.scripts)
      .pipe(plugins.ngAnnotate())
      .pipe(plugins.concat('app.min.js'))
      .pipe(plugins.uglify())
      .pipe(gulp.dest(paths.distScriptsProd));
};
// Copy all the scripts from the bower_components and then moves to PROD/scripts directory
pipes.builtVendorScriptsProd = function() {
  return gulp.src(bowerFiles('**/*.js'))
      .pipe(pipes.orderedVendorScripts())
      .pipe(plugins.concat('vendor.min.js'))
      .pipe(plugins.uglify())
      .pipe(gulp.dest(paths.distScriptsProd));
};
// Built style scss file
pipes.builtStylesProd___ = function() {
  return gulp.src('./app/scss/**/*.scss')
      .pipe(plugins.compass({
        css: paths.distDevCss,
        sass: './app/scss/',
        image: './app/img/',
        require: ['compass', 'singularitygs']
      }))
      .pipe(plugins.cssUrlAdjuster({
        replace:  ['../../app/img','../img/']
      }))
      .pipe(plugins.minifyCss({compatibility: 'ie8'}))
      .pipe(plugins.rename('style.min.css'))
      .pipe(plugins.csso())
      .pipe(gulp.dest(paths.distProdCss));
};
pipes.builtStylesVendorProd__=function(){
	//return gulp.src(bowerFiles('**/*.css'))
	//return gulp.src(bowerFiles('**/*.js'))
	/*
	return gulp.src(bowerFiles({
		overrides: {
			bootstrap: {
				main: [
					//'./dist/js/bootstrap.js',
					//'./dist/css/*.min.*',
					'./dist/css/bootstrap.css',
					'./dist/css/bootstrap-theme.css',
					//'./dist/fonts/*.*'
				]
			}
		}
	}))
	*/
	//return gulp.src(bowerFiles(['css']))
	//.pipe(plugins.if(('**/*.less'), plugins.less()))
	//return gulp.ext(['css', 'less']).files;

	return gulp.src(bowerFiles({
		overrides: {
			bootstrap: {
				main: [
					//'./dist/js/bootstrap.js',
					//'./dist/css/*.min.*',
					'./dist/css/bootstrap.css',
					'./dist/css/bootstrap-theme.css',
					//'./dist/fonts/*.*'
				]
			}
		}
	}))

	.pipe(plugins.if(('**/*.css'), 
		plugins.cssUrlAdjuster({
			replace:  ['../fonts/','/bower_components/'] //When we use sprite we have wrong path for our sprite, this is fixed
		})
	))
	
	
		.pipe(plugins.concat('vendor.style.min.css'))	
		.pipe(plugins.minifyCss({compatibility: 'ie8'}))
		.pipe(plugins.rename('vendor.style.min.css'))
		.pipe(plugins.csso())// упаковка css 
		.pipe(gulp.dest(paths.distProdCss));
};
pipes.builtStylesVendorProd=function(){
	return gulp.src(bowerFiles('**/*.less'))
		.pipe(plugins.less())
		.pipe(plugins.concat('vendor.style.min.css'))	
		.pipe(plugins.minifyCss({compatibility: 'ie8'}))
		.pipe(plugins.rename('vendor.style.min.css'))
		.pipe(plugins.csso())// упаковка css 
		.pipe(gulp.dest(paths.distProdCss));
};




pipes.builtFontVendorProd = function() {
	 return gulp.src(bowerFiles({
		overrides: {
			bootstrap: {
				main: [
					'./dist/fonts/*.*'
				]
			}
		}
	}))
	.pipe(
		plugins.if(('!*.js'), gulp.dest(paths.distProd+'/fonts/' ))
	);
};



pipes.builtStylesProd=function(){
		/*
	return gulp.src(paths.styles)
		.pipe(plugins.compass({
			css: paths.distDevCss,
			sass: './app/scss/',
			image: './app/img/',
			require: ['compass', 'singularitygs']
		}))
		.pipe(plugins.cssUrlAdjuster({
			replace:  ['../../app/img','../img/']
		}))
		
		.pipe(plugins.concat('style.min.css'))	
		.pipe(plugins.minifyCss({compatibility: 'ie8'}))
		.pipe(plugins.rename('style.min.css'))
		.pipe(plugins.csso())// упаковка css 
		.pipe(gulp.dest(paths.distProdCss));
		*/
		
		
	return gulp.src(paths.styles)
		.pipe(plugins.less(paths.styles))
		.pipe(plugins.concat('style.min.css'))	
		.pipe(plugins.minifyCss({compatibility: 'ie8'}))
		.pipe(plugins.rename('style.min.css'))
		.pipe(plugins.csso())// упаковка css 
		.pipe(gulp.dest(paths.distProdCss));
		
};


// Copy images files and then moves to DEV directory
pipes.processedImagesProd = function() {
  return gulp.src(paths.images)
    .pipe(gulp.dest(paths.distProdImg));
};
// Built all project
pipes.builtIndexProd = function() {
	pipes.builtFontVendorProd();
	
  var vendorScripts = pipes.builtVendorScriptsProd();
  var appScripts = pipes.builtAppScriptsProd();
  var vendoStyles = pipes.builtStylesVendorProd();
  var appStyles = pipes.builtStylesProd();
  return pipes.buildIndexFile()
      .pipe(gulp.dest(paths.distProd)) // write first to get relative path for inject
      .pipe(plugins.inject(vendorScripts, {relative: true, name: 'bower', addRootSlash: true}))
      .pipe(plugins.inject(appScripts, {relative: true, addRootSlash: true}))
      .pipe(plugins.inject(appStyles, {relative: true, addRootSlash: true}))
	  .pipe(plugins.inject(vendoStyles, {relative: true, name: 'bower', addRootSlash: true}))
      .pipe(plugins.htmlmin({collapseWhitespace: true, removeComments: true}))
      .pipe(gulp.dest(paths.distProd));
};
// Run streaming Assembly
pipes.builtAppProd = function() {
  return es.merge(pipes.builtIndexProd(), pipes.builtPartialsFilesProd(), pipes.processedImagesProd());
};
/* = = =
 |
 | TASK
 |
 = = = */
/* = = =
 | DEV TASKS
 = = = */
// removes all compiled dev files
gulp.task('clean-dev', function() {
  return del(paths.distDev);
});
// builds a complete prod environment
gulp.task('build-app-dev', pipes.builtAppDev);
// cleans and builds a complete dev environment
gulp.task('clean-build-app-dev', ['clean-dev'], pipes.builtAppDev);
// clean, build, and watch live changes to the dev environment
gulp.task('watch-dev', ['clean-build-app-dev'], function() {
  var indexPath;
  var partialsPath;
  var reload = browserSync.reload;

  if (useJade) {
    indexPath = paths.indexJade;
    partialsPath = paths.partialsJade;
  } else {
    indexPath = paths.index;
    partialsPath = paths.partials;
  }
  // start browser-sync to auto-reload the dev server
  browserSync({
    port: 8000,
    server: {
      baseDir: paths.distDev
    }
  });

  // watch index
  gulp.watch(indexPath, function() {
    return pipes.builtIndexDev()
        .pipe(reload({stream: true}));
  });

  // watch app scripts
  gulp.watch(paths.scripts, function() {
    return pipes.builtAppScriptsDev()
        .pipe(reload({stream: true}));
  });

  // watch html partials
  gulp.watch(partialsPath, function() {
    return pipes.builtPartialsFilesDev()
        .pipe(reload({stream: true}));

  });

  // watch styles
  gulp.watch(paths.styles, function() {
    return pipes.builtStylesDev()
        .pipe(reload({stream: true}));
  });

  // watch images
  gulp.watch(paths.images, function() {
    return pipes.processedImagesDev()
        .pipe(reload({stream: true}));
  });

});
/* = = =
 | PROD TASKS
 = = = */
// removes all compiled prod files
gulp.task('clean-prod', function() {
  return del(paths.distProd);
});
// builds a complete prod environment
gulp.task('build-app-prod', pipes.builtAppProd);
// cleans and builds a complete prod environment
gulp.task('clean-build-app-prod', ['clean-prod'], pipes.builtAppProd);
// clean, build, and watch live changes to the prod environment
gulp.task('watch-prod', ['clean-build-app-prod'], function() {
  var indexPath;
  var partialsPath;
  var reload = browserSync.reload;

  if (useJade) {
    indexPath = paths.indexJade;
    partialsPath = paths.partialsJade;
  } else {
    indexPath = paths.index;
    partialsPath = paths.partials;
  }
  // start browser-sync to auto-reload the dev server
  browserSync({
    port: 8000,
    server: {
      baseDir: paths.distProd
    }
  });

  // watch index
  gulp.watch(indexPath, function() {
    return pipes.builtIndexDev()
      .pipe(reload({stream: true}));
  });

  // watch app scripts
  gulp.watch(paths.scripts, function() {
    return pipes.builtAppScriptsDev()
      .pipe(reload({stream: true}));
  });

  // watch html partials
  gulp.watch(partialsPath, function() {
    return pipes.builtPartialsFilesDev()
      .pipe(reload({stream: true}));

  });

  // watch styles
  gulp.watch(paths.styles, function() {
    return pipes.builtStylesDev()
      .pipe(reload({stream: true}));
  });

  // watch images
  gulp.watch(paths.images, function() {
    return pipes.processedImagesDev()
      .pipe(reload({stream: true}));
  });

});
/* = = =
 | DEFAULT TASKS
 = = = */
// If we start only gulp command we built DEV folder and DEV server
gulp.task('default', ['watch-dev']);
//gulp.task('default', ['watch-prod']);



