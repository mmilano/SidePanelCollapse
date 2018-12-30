/* jshint esversion: 6 */  // allow es6 features

"use strict";

const gulp =            require("gulp");

// gulp debuggin'
const glog =            require("fancy-log");
const debug =           require("gulp-debug");

// css sass/scss
const sass =            require("gulp-sass");
const autoprefixer =    require("gulp-autoprefixer");

// javascript
const jshint =          require("gulp-jshint");
const browserify =      require("browserify");
const source =          require("vinyl-source-stream");
const buffer =          require("vinyl-buffer");
const babel =           require('gulp-babel');
const babelENV =        require("@babel/preset-env");

// html tools
const htmlvalidator =   require("gulp-html");


// content template system
const panini =          require("panini");

// tools
const glob =            require("glob");
const sourcemaps =      require("gulp-sourcemaps");
const rename =          require("gulp-rename");
const notify =          require("gulp-notify");

const cached =          require('gulp-cached');
const changed =         require("gulp-changed");
const changedInPlace =  require("gulp-changed-in-place");

const del =             require("del");
const node_path =       require("path");
const fs_utimes =       require("fs").utimes;

const requireDir =      require("require-dir");

const gwatch =          require("gulp-watch");  // TODO REMOVE?


// pull in all of the subtasks
requireDir("./gulp/tasks/");


// simply touch a file so that filesystem thinks the file changed
function touch(file) {
    let timenow = Date.now() / 1000;  // https://nodejs.org/docs/latest/api/fs.html#fs_fs_utimes_path_atime_mtime_callback
    fs_utimes(file, timenow, timenow, function(){return;});
}


// glob ignore for osx ds_store file
const DSStoreIgnore = "!**/.DS_Store";

// **********
// build globals

const siteBuildDestinationRoot = "build/";
const siteBuildSource = "./src/site/";


var paths = {

    // build locations to clean out
    cleanGLOB : [
        "./build/public/css/**/*",
        "./build/public/images/**/*",
        "./build/public/js/**/*",
        "./build/pages/**/*",
        "./build/index.html",
    ],

    // images
    imgSourceGLOBDIR: "./assets/images/**/*",
    imgSourceGLOB: "./assets/images/**/*.+(png|jpg|jpeg|gif|svg)",
    imgDestination: siteBuildDestinationRoot + "./public/images/",

    // css
    scssSource: "./src/scss/site.scss",
    scssSourceGLOB: "./src/scss/**/*.scss",
    cssDestination: siteBuildDestinationRoot + "/public/css",

    cssVendorGLOB: "src/css/vendor/**/*",
    cssVendorDestination: siteBuildDestinationRoot + "/public/css",

    // js
    jsDestination: siteBuildDestinationRoot + "public/js/",

    // all the js files
    jsSourceGLOB: ["./src/js/**/*.js"],

    // the site's js files
    jsVendorGLOB: "src/js/vendor/**/*.js",
    jsVendorDestination: siteBuildDestinationRoot + "/public/js",

    // the site's js files
    jsSourceSITEGLOB: ["./src/js/site/**/*.js"],

    jsFile_site: "site.js",
    browserifyDestinationFile_site: "site.js",


    // panini and site building
    siteBuildSource: siteBuildSource,

    pageBuildSourceRoot: siteBuildSource + "pages/",

    // pages
    indexPage: "index.html",
    get indexPageSRC() {
        return paths.siteBuildSource + "pages/page/" + paths.indexPage;
    },
    buildIndexPageDestination: siteBuildDestinationRoot,
    indexPageBuildDestination: siteBuildDestinationRoot,
    get indexPageBuilt() {
        return paths.buildIndexPageDestination + paths.indexPage;
    },

    pagesBuildDestinationRoot: siteBuildDestinationRoot,

    pagesBuiltGLOB: "./build/pages/**/*.html",


    sitePages: siteBuildSource + "pages/",
    sitePagesData: "./src/site/pages/data/**/*.js",
    get siteSourcePagesData() {
        return ([paths.sitePages + "data/**/*.js"]);
    },

    get siteSourcePagesContent() {
        return ([paths.sitePages + "page/**/*.html"]);
    },


    // panini/handlebars
    siteHBSFiles: siteBuildSource + "{layouts,helpers,partials}/**/*",

    // MASTER FILE of the portfolio data.
    // stored in the site client-side files
    sitePortfolioDataFile: "site-portfolio-data.js",
    sitePortfolioDataDestination: "./src/js/site/",
    sitePortfolioDataMASTER: "./src/js/site/portfolio/site-portfolio-canonical.js",


};



// erases the directories, clean out the compiled stuff
gulp.task("site:clean", function siteClean() {
    return del(paths.cleanGLOB);
});


// utility: copy images into public folder

function copyImages(done) {
    gulp
    .src([paths.imgSourceGLOB])
    .pipe(gulp.dest(paths.imgDestination));
    done();
}

function copyImagesChanged(done) {
    gulp
    .src([paths.imgSourceGLOB])
    .pipe(changed(paths.imgDestination))
    .pipe(gulp.dest(paths.imgDestination));
    done();
}

function watchImages(done) {
    gulp
    .watch(paths.imgSourceGLOBDIR, {delay: 600}, gulp.series("copy:images-changed"));
    done();
}

function copyCSSVendor(done) {
    gulp
    .src(paths.cssVendorGLOB)
    .pipe(gulp.dest(paths.cssVendorDestination));
    done();
}

gulp.task("copy:css-vendor", copyCSSVendor);

function copyJSVendor(done) {
    gulp
    .src(paths.jsVendorGLOB)
    .pipe(gulp.dest(paths.jsVendorDestination));
    done();
}

gulp.task("copy:images", copyImages);
gulp.task("copy:images-changed", copyImagesChanged);
gulp.task("copy:js-vendor", copyJSVendor);

gulp.task("watch:images", watchImages);


// move and copy things that need to be moved and copied
gulp.task("site:copy", gulp.parallel("copy:images", "copy:js-vendor", "copy:css-vendor"));
gulp.task("site:setup", gulp.series("site:clean", "site:copy"));


let localDevFiles = [{
    local: "site-css-local.hbs",
    remote: "site-css-remote.hbs",
    destination: "site-css.hbs",
    path: "./src/site/partials/page/docHead/",
    },
    {
    local: "site-js-local.hbs",
    remote: "site-js-remote.hbs",
    destination: "site-js.hbs",
    path: "./src/site/partials/page/docBottom/",
    }];

function developmentFileSwitch(status) {
    let sourceFile;

    if (status === "local") {
        sourceFile = "local";
    } else {
        sourceFile = "remote";
    }

    localDevFiles.forEach(function(file, i) {
        gulp
        .src(file.path + file[sourceFile])
        .pipe(rename(file.destination))
        .pipe(gulp.dest(file.path))
        .pipe(debug({title: "file: "}))
        .on("error", err => glog("error: " + err.message))
    });

}

gulp.task("site:local", function(done) {
    developmentFileSwitch("local");
    done();
});

gulp.task("site:remote", function(done) {
    developmentFileSwitch("remote");
    done();
});


const pageBuildOptions = {
    root:       paths.siteBuildSource,             // Path to the root folder all the page build elements live in
    layouts:    paths.siteBuildSource + "layouts/",
    pageLayouts: {
                // "**/*/index.html":          "layout-page",
                "index.html":            "layout-page",
                "pages/page/**/*":     "layout-page",
                },
    helpers:    paths.siteBuildSource + "helpers/",       // Path to a folder containing Handlebars helpers
    partials:   paths.siteBuildSource + "partials/",      // Path to a folder containing HTML partials
    data:       [paths.siteBuildSource + "data/", paths.siteBuildSource + "pages/data/"],  // Path to global data, which will be passed in to every page. relative to root.
    debug: 0
};

function buildPagesAll(done) {
    panini.refresh();

    gulp
    .src(paths.siteSourcePagesContent)          // ./src/site/pages/page/**/*.html
    .pipe(panini(pageBuildOptions))
    .pipe(debug({title: "pages building:"}))
    .pipe(gulp.dest(paths.pagesBuildDestinationRoot))  // ./build/
    .pipe(debug({title: "BUILT page:"}));
    done();
}

function buildPage(page, path) {
    panini.refresh();

    glog ("page to build:", page);

    gulp
    .src(page)
    .pipe(debug({title: "building:"}))
    .pipe(panini(pageBuildOptions))
    .pipe(gulp.dest(paths.pagesBuildDestinationRoot))
    .pipe(debug({title: "BUILT page:"}));
}


function buildIndexPage(done) {
    panini.refresh();

    gulp
    .src(paths.indexPageSRC)
    .pipe(panini(pageBuildOptions))
    .pipe(debug({title: "BUILT homepage page."}))
    .pipe(gulp.dest(paths.buildIndexPageDestination));
    done();
}

gulp.task("build:index", buildIndexPage);
gulp.task("build:homepage", gulp.series("build:index"));  // alias
gulp.task("build:pages", buildPagesAll);


// source of html files

function watchindexPageSource(done) {
    gulp
    .watch(paths.indexPageSRC, gulp.series("build:index"))
	.on("error", err => glog("watch error: " + err))
    .on("change", path => glog("watch:index >>> " + path));
    done();
}

gulp.task("watch:index", watchindexPageSource);



// watch the data files...
// if data file for project page changes, then build the project page itself
//
// pages are paired: $$$.html & $$$.js.
// so if $$$.js changes,
// - construct the name of the paired $$$.html file,
// - and change the mtime on $.html so that it appears to have been changed
// - which in turn should kick off the rebuild of the page due to other tasks watching $.html pages
function buildPageOnDataChange(done) {

    gulp
    .watch(paths.siteSourcePagesData)
	.on("error", err => glog("watch error: " + err.message))
	.on("change", function(dataFile) {
        panini.refresh();

        // given the full path to the html file,
        // need to remove the common root part of the path that is the pages directory
        // to get the page's own subdirectory

        let pageFile = constructPagePath(dataFile);
        glog ("data:", dataFile);
        glog ("page:", pageFile);
        glog ("root:", paths.pagesBuildDestinationRoot);

        let pageSubPath = "/.";

        buildPage(pageFile, pageSubPath);
	});

    done();
}


function constructPageFilename(file) {
    return file + ".html";
};

// constructProjectPath:
// given a data file of /path/path/file.js,
// break down the path and construct the path & name of the counterpart file.html
function constructPagePath(file) {
    const extension = ".html";
    const pathBase = paths.siteBuildSource;  // top portion location of the content pages

    //const pagePathBase = paths.pageBuildSourceRoot;  // root location of the pages, both html and js
    const pagePathBase = "src/site/pages/";

    let htmlPagePathBase = "src/site/pages/page";

    glog ("construct:");

    let parsedFile = node_path.parse(file);
    let filePath = parsedFile.dir;
    let htmlFilename = constructPageFilename(parsedFile.name);

    let counterpathPath = filePath.replace("src/site/pages/data", "src/site/pages/page");

    glog ("other path: ", counterpathPath);

    // construct path to the html version...
    let htmlFile = counterpathPath + node_path.sep + htmlFilename;
    return htmlFile;
};




// **************
// **************

const changedInPlaceOptions = {
    firstPass: true,
    howToDetermineDifference: "modification-time"
};


function buildpagesCHANGED(done) {
    panini.refresh();

    gulp
    .on("error", function(err) {
        glog("page build error: " + err.message);
        this.emit("end");
        })
    .src(paths.siteSourcePagesContent)
    .pipe(changedInPlace(changedInPlaceOptions))
    .pipe(panini(pageBuildOptions))
    .pipe(debug({title: "building:"}))
    .pipe(gulp.dest(paths.pagesBuildDestinationRoot))
    .pipe(debug({title: "BUILT: "}))
    done();
}

// watch just the project pages and only build the ones whose html pages changed
gulp.task("build:pages-changed", buildpagesCHANGED);


function watchPages(done) {
    gulp
    .watch(["./src/site/pages/page/**/*", DSStoreIgnore], gulp.series("build:pages-changed"))
	.on("error", err => glog("watch error: " + err.message))
	.on("change", path => glog("watch:pages >>> " + path))
	done();
}

gulp.task("watch:pages", gulp.series(buildPageOnDataChange, watchPages));



// watch the handlebars elements and rebuild html pages if any of them change
// rebuild all because these items affect all pages.
// also watch the site data, which also affects all the pages.

function watchHandlebars(done) {

    paths.siteData = "./src/site/data/site/**/*";

    gulp
    .watch([paths.siteHBSFiles, paths.siteData])
	.on("error", err => glog("watch error: " + err.message))
	.on("change", path => glog("watch:templates & helpers changed >>> " + path))
	.on("change", path => gulp.series("build:pages")())
    .on("unlink", path => glog("removed: " + path));
	done();
}

gulp.task("watch:handlebars", watchHandlebars);



// ********************
// validate the html pages

const validatorOptions = {
    "errors-only": true
};


function validateAPage(page) {
    return gulp
    .src(page)
    .pipe(htmlvalidator(validatorOptions))
    .on("error", err => glog("page " + page + " validation error: " + err.message));
    done();
}


// html validation: index page
gulp.task("validate:index", function validateIndexPage() {
    return gulp
    .src(paths.indexPageBuilt)
    .pipe(htmlvalidator(validatorOptions))
    .on("error", err => glog("index page validation error: " + err.message))
});

// html validation: A page
gulp.task("validate:page", function validateAPage(page) {
    validateAPage(page, done);
    done();
});

// html validation: ALL pages
gulp.task("validate:pages", function validatepPagesBuilt() {
    return gulp
    .src(paths.pagesBuiltGLOB)
    .pipe(htmlvalidator(validatorOptions))
    .on("error", err => glog("PAGE validation error: " + err.message))
	.on("change", path => glog("PAGE validated >>> " + path));

});

gulp.task("validate:all", gulp.parallel("validate:pages", "validate:index"));




// ********************
// ********************
// compile sass/scss

const scssOptions = {
    errLogToConsole: true,
    outputStyle: "expanded",
    sourceComments: false,
    indentWidth: 4,
    precision: 4
};

const autoprefixerOptions = {
    browsers: ["last 2 versions", "not opera < 49"],
};

function maketheCSS(done) {

    gulp
    .src(paths.scssSource)
    .pipe(sourcemaps.init())
    .pipe(sass(scssOptions).on("error", sass.logError))
    .pipe(autoprefixer(autoprefixerOptions))
    .pipe(sourcemaps.write("./map"))
    .pipe(gulp.dest(paths.cssDestination))
    .on("end", () => { glog("compile:sass complete"); })
    .pipe(notify({
        title: "SCSS",
        message: "task: compile:SCSS complete",
        onLast: true,
        icon: null }));
    done();
}

gulp.task("compile:scss", maketheCSS);




// **********
// SITE DATA

function touchSiteData(done) {
    let file = paths.sitePortfolioDataDestination + paths.sitePortfolioDataFile;
    touch(file);
    done();
}

function touchIndexPage(done) {
    let file = paths.indexPageSRC;
    touch(file);
    done();
}

gulp.task("touch:site-portfolio", touchSiteData);
gulp.task("touch:index", touchIndexPage);


function watchSiteData(done) {
    gulp
    .watch(paths.sitePortfolioDataMASTER)
	.on("error", err => glog("watch siteData error: " + err.message))
	.on("change", gulp.parallel("touch:site-portfolio", "touch:index"))
	.on("change", path => glog("watch:siteData >>> " + path));
    done();
}

// watch the project portfolio data
gulp.task("watch:siteData", watchSiteData);


// **********
// JAVASCRIPT
//
// assemble, compile, and etc. for the javascript


function lintJS(done) {
    gulp
    .src(paths.jsSourceSITEGLOB)
    // .pipe(debug())   // iterate out name of each file being checked
    .pipe(cached("jslintCacheName"))
    .pipe(jshint(paths.jshintConfiguration))
    .pipe(jshint.reporter("default"));
    done();
}

gulp.task ("lint:js", lintJS);



const babelOptions = {
    presets: ["@babel/preset-env"]
};

// main site.js script assembly
function browserifyScript(file, standaloneFile) {

    console.log("browserify arguments: ", arguments);  // TODO: dev

    if (!standaloneFile) {
        standaloneFile= "site";
    };

    let bundleOptions = {
        entries: ["./src/js/site/" + file],   // starting file for the requires. relative to this gulpfile
        paths: ["./src/js/site/", "./src/js/site/modules", "./src/js/site/pages", "./src/js/general/"],
        standalone: standaloneFile,       // standalone output file
        debug: true
    };

    return browserify(bundleOptions)
        .bundle()
        .on("error", function(err) {
            glog("browserify error: " + err);
            this.emit("end");
            })
        .pipe(source(paths.browserifyDestinationFile_site))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        // Add transformation tasks in the pipeline here
        .pipe(babel(babelOptions))
        // end transformations
        .pipe(sourcemaps.write('./map'))
        .pipe(gulp.dest(paths.jsDestination))
        .on("end", () => glog("browserify SITE complete"));
}

// browserify the site js code
gulp.task("browserify:site-js", function browserifySiteJS(done) {
    browserifyScript(paths.jsFile_site);
    done();
});


// watch the sass/scss

function watchSCSS(done) {
    gulp
    .watch(paths.scssSourceGLOB, gulp.series("compile:scss"))
	.on("error",  err => glog("watch error: " + err.message))
    .on("change", path => glog("watch:scss >>> " + path + " changed."))
    .on("unlink", path => glog(path + " was deleted"));
    done();
}

gulp.task("watch:scss", watchSCSS);


// watch the js

function watchJS(done) {
    gulp
    .watch(paths.jsSourceSITEGLOB, {delay: 400})
	.on("error", err => glog("watch js error: " + err.message))
	.on("change", gulp.series("lint:js", "browserify:site-js"))
	.on("change", path => glog("watch:js >>> " + path));
	done();
}

gulp.task("watch:js", watchJS);


// watch all the things

gulp.task("watch:full", gulp.parallel(
    "watch:images",
    "watch:scss",
    "watch:siteData",
    "watch:js",
    "watch:index",
    "watch:pages",
    "watch:handlebars"
));

gulp.task("default", gulp.series(
    "site:setup",
    gulp.parallel(
        "webserver",
        "compile:scss",
        "browserify:site-js",
        "build:index",
        "build:pages-changed"
    ),
    "watch:full"
));

gulp.task("dev", function taskDevBasic(done) {
    gulp.series(
        "webserver",
        "site:local",
        gulp.parallel(
            "compile:scss",
            "browserify:site-js",
            "build:index",
            "build:pages-changed"
        ),
        "watch:full")();
    done();
});


//build tasks

function production(done) {

    gulp.series(
        "webserver",
        "site:remote",
        gulp.parallel(
            "compile:scss",
            "browserify:site-js",
            productionIndexPage,
            productionPages
        ),
        "watch:full")();

    done();
}

function productionIndexPage(done) {
    gulp.series(
        "build:index",
        "validate:index"
        );
    done();
}

function productionPages(done) {
    gulp.series("build:pages", "validate:pages");
}

exports.production = production;
exports.productionIndexPage = productionIndexPage;
exports.productionPages = productionPages;

