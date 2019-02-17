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

// html
const htmlvalidator =   require("gulp-html");
const htmlmin =         require("gulp-htmlmin");

// content/template system
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

// dev webserver
const connect =         require("gulp-connect");
const networkInterfaces = require("os").networkInterfaces();


// simply touch a file so that filesystem thinks the file changed
function touchNow(file) {
    let timenow = Date.now() / 1000;  // https://nodejs.org/docs/latest/api/fs.html#fs_fs_utimes_path_atime_mtime_callback
    fs_utimes(file, timenow, timenow, function(){return;});
}

// tell panini to refresh all the files
function refreshPanini(done) {
    panini.refresh();
    done();
}


// **********
// build globals

const siteBuildDestinationRoot = "demo/";
const siteBuildSource = "./src/site/";


const paths = {

    // ignore for osx ds_store file
    DSStoreIgnore: "!**/.DS_Store",

    // build locations to clean out
    cleanGLOB : [
        siteBuildDestinationRoot + "public/**/*",
        siteBuildDestinationRoot + "pages/**/*",
        siteBuildDestinationRoot + "index.html",
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

    // the site's 3rd party js files.
    // only here for the option to develop locally without network access
    jsVendorGLOB: "src/js/vendor/**/*.js",
    jsVendorDestination: siteBuildDestinationRoot + "/public/js",

    // the site's js files
    jsSourceSITEGLOB: ["./src/js/site/**/*.js"],

    jsFile_site: "site.js",
    browserifyDestinationFile_site: "site.js",

    // panini and site building
    siteBuildSource: siteBuildSource,  // dupe for convenience/consistency
    siteDataGLOB: "./src/site/data/site/**/*",
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
    pagesBuiltGLOB: siteBuildDestinationRoot + "pages/**/*.html",

    sitePages: siteBuildSource + "pages/",
    sitePagesData: "./src/site/pages/data/**/*.js",
    sitePagesGLOB: "./src/site/pages/page/**/*",

    get siteSourcePagesData() {
        return ([paths.sitePages + "data/**/*.js"]);
    },

    get siteSourcePagesContent() {
        return ([paths.sitePages + "page/**/*.html"]);
    },

    // panini/handlebars
    siteHBSFilesGLOB: siteBuildSource + "{layouts,helpers,partials}/**/*",
    siteHBSjsFilesGLOB: siteBuildSource + "{layouts,helpers,partials}/**/*.js",

    // MASTER FILE of the gallery data
    siteGalleryDataMASTER: "./src/js/site/gallery/site-gallery-data.js",

};


// erases the directories, clean out the compiled stuff
function siteClean(done) {
    del(paths.cleanGLOB).then(paths => {
        // console.log("deleted:");
        // console.log(paths.join("\n"));  // display list of everything del'd
        done();
    });
}

gulp.task("site:clean", siteClean);


// webserver
// simple node server for dev
// along with simple utility function to show current IP address

function findAddress() {
    let ip_main, ip, address = undefined;
    if (typeof networkInterfaces["en4"] !== "undefined") {
        ip_main = networkInterfaces["en4"];  // ethernet cableconsole.log ("ip_eth: ", ip_eth);
        ip = ip_main.find(netInterface => netInterface.family === "IPv4");
    } else if (typeof networkInterfaces["en0"] !== "undefined") {
        ip_main = networkInterfaces["en0"];  // wifi
        ip = ip_main.find(netInterface => netInterface.family === "IPv4");
    };
    if (typeof ip !== "undefined") {
        address = ip.address;
    }

    return address;
}

// note: host 0.0.0.0 allows a browser to view the built site at
// http://localhost:9191 OR http://[current IP address]:9191 (on macOS),
// & http://[current IP address]:9191 from a virtual (win10) machine.
// original source of this suggestion:
// https://stackoverflow.com/questions/10158771/access-localhost-on-the-main-machine-from-vmware-workstation-8-for-asp-net-devel/10159420#10159420

const serverOptions = {
    name: "dev",
    port: 9191,
    host: "0.0.0.0",
    defaultFile: "index.html",
    root: siteBuildDestinationRoot,
    directoryListing: {
      enable: false,
      path: "./"
    },
};

function webserver(done) {
    connect.server(serverOptions);
    let currentAddress = findAddress();
    console.log ("***** current IP address:", currentAddress);

    done();
}

gulp.task("webserver", webserver);



// copy images
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
    var watcherImages =  gulp.watch(paths.imgSourceGLOBDIR);
    watcherImages.on("error", err => glog("watch images error: " + err));
    watcherImages.on("change", path => glog("images changed >>> " + path));
    watcherImages.on("change", gulp.series("copy:images-changed"));

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


// let localDevFiles = [{
//         local: "site-css-local.hbs",
//         remote: "site-css-remote.hbs",
//         destination: "site-css.hbs",
//         path: "./src/site/partials/page/docHead/",
//     },
//     {
//         local: "site-js-local.hbs",
//         remote: "site-js-remote.hbs",
//         destination: "site-js.hbs",
//         path: "./src/site/partials/page/docBottom/",
//     }];
//
// function developmentFileSwitch(status) {
//     let sourceFile;
//
//     if (status === "local") {
//         sourceFile = "local";
//     } else {
//         sourceFile = "remote";
//     }
//
//     localDevFiles.forEach(function(file, i) {
//         gulp
//         .src(file.path + file[sourceFile])
//         .pipe(rename(file.destination))
//         .pipe(gulp.dest(file.path))
//         .pipe(debug({title: "file: "}))
//         .on("error", err => glog("error: " + err.message))
//     });
// }
//
// gulp.task("site:local", function(done) {
//     developmentFileSwitch("local");
//     done();
// });
//
// gulp.task("site:remote", function(done) {
//     developmentFileSwitch("remote");
//     done();
// });


const pageBuildOptions = {
    root:       paths.siteBuildSource,             // Path to the root folder all the page build elements live in
    layouts:    paths.siteBuildSource + "layouts/",
    pageLayouts: {
                "index.html":           "layout-index",
                "pages/page/**/*":      "layout-page",
                },
    helpers:    paths.siteBuildSource + "helpers/",       // Path to a folder containing Panini helpers
    partials:   paths.siteBuildSource + "partials/",      // Path to a folder containing HTML partials
    data:       [paths.siteBuildSource + "data/", paths.siteBuildSource + "pages/data/"],  // Path to global data, which will be passed in to every page; relative to root.
    debug: 0
};

function buildPagesAll(done) {
    refreshPanini(done);

    return gulp
    .src(paths.siteSourcePagesContent)          // ./src/site/pages/page/**/*.html
    .pipe(panini(pageBuildOptions))
    .pipe(debug({title: "pages building:"}))
    .pipe(gulp.dest(paths.pagesBuildDestinationRoot))  // ./build/
    .pipe(debug({title: "BUILT page:"}));
}

function buildPage(page, path) {
    refreshPanini(done);

    return gulp
    .src(page)
    .pipe(debug({title: "building:"}))
    .pipe(panini(pageBuildOptions))
    .pipe(gulp.dest(paths.pagesBuildDestinationRoot))
    .pipe(debug({title: "BUILT page:"}));
}

function buildIndexPage(done) {
    refreshPanini(done);

    return gulp
    .src(paths.indexPageSRC)
    .pipe(panini(pageBuildOptions))
    .pipe(debug({title: "BUILT index page."}))
    .pipe(gulp.dest(paths.buildIndexPageDestination));
}

gulp.task("build:index", buildIndexPage);
gulp.task("build:homepage", gulp.series("build:index"));  // alias
gulp.task("build:pages", buildPagesAll);


// source of html files

function watchindexPageSource(done) {
    var watcherIndex =  gulp.watch(paths.indexPageSRC);
    watcherIndex.on("error", err => glog("watch index error: " + err));
    watcherIndex.on("change", path => glog("index changed >>> " + path));
    watcherIndex.on("change", gulp.series("build:index"));

    done();
}

gulp.task("watch:index", watchindexPageSource);



// site building: watch the data files
// if data file for project page changes, then build the project page itself
//
// pages are paired: $$$.html & $$$.js.
// so if $$$.js changes,
// - construct the name of the paired $$$.html file,
// - and change the mtime on $.html so that it appears to have been changed
// - which in turn should kick off the rebuild of the page due to other tasks watching $.html pages
function buildPageOnDataChange(done) {
    var watcherPageChange =  gulp.watch(paths.siteSourcePagesData);
    watcherPageChange.on("error", err => glog("watch error: " + err));
    watcherPageChange.on("change", function(dataFile) {
        refreshPanini(done);

        // given the full path to the html file,
        // need to remove the common root part of the path that is the pages directory (-pageBuildSourceRoot)
        // to get the page's own subdirectory

        // ie get pagefile - pageBuildSourceRoot
        // src/site/pages/page/pageA.html - src/site/pages/
        let pageFile = constructPagePath(dataFile);
        glog("data:", dataFile);
        glog("page:", pageFile);
        glog("root destination:", paths.pagesBuildDestinationRoot);

        let pageSubPath = "/.";

        buildPage(pageFile, pageSubPath);
    });

    done();
}



// site building: construct Project Path
// given a data file of /path/path/file.js,
// break down the path and construct the path & name of the counterpart file.html
// remove the src path from both files: src/site/pages/data  &  src/site/pages/page
function constructPagePath(file) {

    function constructHTMLFilename(file) {
        return file + ".html";
    };

    const extension = ".html";
    const pathBase = paths.siteBuildSource;  // top portion location of the content pages
    const pagePathBase = "src/site/pages/";

    let dataPagePathBase = "src/site/pages/data";
    let htmlPagePathBase = "src/site/pages/page";

    let parsedFile = node_path.parse(file);
    let filePath = parsedFile.dir;
    let counterPath = filePath.replace(dataPagePathBase, htmlPagePathBase);
    let htmlFilename = constructHTMLFilename(parsedFile.name);

    // construct path to the html version...
    let htmlFile = counterPath + node_path.sep + htmlFilename;
    return htmlFile;
};


// **************
// **************

const changedInPlaceOptions = {
    firstPass: true,
    howToDetermineDifference: "modification-time"
};

function buildpagesCHANGED(done) {
    panini.refresh(done);

    // uses "changed-in-place" to determine if the source file itself was modified
    return gulp
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
}

// watch just the project pages and only build the ones whose html pages changed
gulp.task("build:pages-changed", buildpagesCHANGED);


function watchPages(done) {
    var watcherPages =  gulp.watch([paths.sitePagesGLOB, paths.DSStoreIgnore]);
    watcherPages.on("error", err => glog("watch error: " + err));
    watcherPages.on("change", path => glog("pages changed >>> " + path));
    watcherPages.on("change", gulp.series("build:pages-changed"));

	done();
}

gulp.task("watch:pages", gulp.series(buildPageOnDataChange, watchPages));


// site building: watch the Panini sources and if any of them change, rebuild the html pages.
// rebuild all because these items affect all pages.
// also watch the site data, which also affects all the pages.
function watchTemplateSources(done) {
    var watchTemplateSources =  gulp.watch([paths.siteHBSFilesGLOB, paths.siteDataGLOB]);
    watchTemplateSources.on("error", err => glog("watch templates & helpers error: " + err));
    watchTemplateSources.on("change", path => glog("templates & helpers changed >>> " + path));
    watchTemplateSources.on("change", gulp.series("build:pages"));

    done();
}

gulp.task("watch:buildSources", watchTemplateSources);



// **********
// HTML
//


// html minimization: all the pages
function minifyPages() {
    const htmlminOptions = {
        caseSensitive: true,
        collapseWhitespace: true,
        removeComments: true,
        keepClosingSlash: true,
        minifyJS: true
    };

    // set up to use base & relative path for overwriting the original file with the minified file
    const pathRelative = "./";

    return gulp
    .src("./build/**/*.html", {base: pathRelative})
    .pipe(htmlmin(htmlminOptions))
    .pipe(debug({title: "minifying: "}))
    .pipe(gulp.dest(pathRelative))
    .on("error", err => glog("HTML minification error: " + err))
    .on("change", path => console.log("minification of page >>> " + path));
}


gulp.task("minify:pages", minifyPages);
gulp.task("minify:site", gulp.series("minify:pages"));  // alias


// validate the (built) html pages
const validatorOptions = {
    "errors-only": true
};

function validatepPagesBuilt() {
    return gulp
    .src([paths.pagesBuiltGLOB, paths.indexPageBuilt])
    .pipe(htmlvalidator(validatorOptions))
    .on("error", err => glog("PAGE validation error:\n" + err.message))
	.on("change", path => glog("PAGE validated >>> " + path));
}

gulp.task("validate:pages", validatepPagesBuilt);
gulp.task("validate:all", gulp.parallel("validate:pages"));  // alias



// **********
// SCSS/SASS
//
// compile the scss, etc

const scssOptions = {
    includePaths: ["/"],
    errLogToConsole: true,
    outputStyle: "expanded",
    sourceComments: true,
    indentWidth: 4,
    precision: 4
};

const autoprefixerOptions = {
    browsers: ["last 2 versions"],
};

function maketheCSS() {
    return gulp
    .src(paths.scssSource)
    .pipe(sourcemaps.init())
    .pipe(sass(scssOptions)
    .on("error", sass.logError))
    .pipe(autoprefixer(autoprefixerOptions))
    .pipe(sourcemaps.write("./map"))
    .pipe(gulp.dest(paths.cssDestination))
    .on("end", () => { glog("compile:sass completed"); })
    .pipe(notify({
        title: "SCSS",
        message: "task: compile:SCSS complete",
        onLast: true,
        icon: null }));
}

gulp.task("compile:scss", maketheCSS);

// watch the scss sources
function watchSCSS(done) {
    var watcherSCSS =  gulp.watch(paths.scssSourceGLOB);
    watcherSCSS.on("error", err => glog("watch scss error: " + err));
    watcherSCSS.on("unlink", path => glog(path + " was deleted"));
    watcherSCSS.on("change", gulp.series("compile:scss"));

    done();
}

gulp.task("watch:scss", watchSCSS);



// **********
// SITE DATA

function touchGalleryData() {
    return new Promise(function(resolve, reject) {
        let file = paths.siteGalleryDataMASTER;
        touchNow(file);
        resolve();
    });
}

function touchIndexPage() {
    return new Promise(function(resolve, reject) {
        let file = paths.indexPageSRC;
        touchNow(file);
        resolve();
    });
}

gulp.task("touch:site-gallery", touchGalleryData);
gulp.task("touch:index", touchIndexPage);


// site building: watch the gallery data
// the gallery data is used to generate the set of page cards displayed on the index page,
// and the inter-page navigation displayed in the sidepanel nav
function watchGalleryData(done) {
    var watcherGallery =  gulp.watch(paths.siteGalleryDataMASTER);
    watcherGallery.on("error", err => glog("watch gallery data error: " + err));
    watcherGallery.on("change", gulp.parallel("build:index"));

    done();
}

// watch the project gallery data
gulp.task("watch:siteGallery", watchGalleryData);


// **********
// JAVASCRIPT
//
// lint, assemble, compile, and etc., for the javascript

function lintSiteJS() {
    return gulp
    .src(paths.jsSourceSITEGLOB)
    // .pipe(debug())   // iterate out name of each file being checked
    .pipe(cached("jslintSite"))
    .pipe(jshint(paths.jshintConfiguration))
    .pipe(jshint.reporter("default"));
}

// check the Panini files
function lintPaniniJS() {
    return gulp
    .src(paths.siteHBSjsFilesGLOB)
    .pipe(debug())   // iterate out name of each file being checked
    .pipe(cached("jslintPanini"))
    .pipe(jshint(paths.jshintConfiguration))
    .pipe(jshint.reporter("default"));
}

gulp.task ("lint:Paninijs", lintPaniniJS);
gulp.task ("lint:js", lintSiteJS);


// main site javascript assembly
function browserifyScript(file) {

    const standaloneFile= "site";

    const bundleOptions = {
        entries: ["./src/js/site/" + file],   // starting file for the requires. relative to this gulpfile
        paths: ["./src/js/site/", "./src/js/site/modules", "./src/js/site/pages", "./src/js/general/"],
        standalone: standaloneFile,
        debug: false
    };

    const babelOptions = {
        presets: ["@babel/preset-env"]
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
        // add transformation tasks in the pipeline here
        .pipe(babel(babelOptions))
        // .pipe(uglify())  // will minify the js if you want that
        // end transformations
        .pipe(sourcemaps.write('./map'))
        .pipe(gulp.dest(paths.jsDestination))
        .on("end", () => glog("browserify SITE complete"));
}

// browserify the site.js bundle
gulp.task("browserify:site", function browserifySiteJS(done) {
    browserifyScript(paths.jsFile_site);

    done();
});

// watch the js sources
function watchJS(done) {
    var watcherJS =  gulp.watch(paths.jsSourceGLOB);
    watcherJS.on("error", err => glog("watch js error: " + err.message));
    watcherJS.on("change", path => glog("js changed >>> " + path));
    watcherJS.on("change", gulp.series("lint:js", "browserify:site"));

	done();
}

gulp.task("watch:js", watchJS);

// watch all the things
gulp.task("watch:full", gulp.parallel(
    "watch:images",
    "watch:buildSources",
    "watch:scss",
    "watch:js",
    "watch:siteGallery",
    "watch:index",
    "watch:pages",
));



gulp.task("default", gulp.series(
    "site:setup",
    "webserver",
    gulp.parallel(
        "compile:scss",
        "browserify:site",
        "build:index",
        "build:pages"
    ),
    "watch:full"
));

// dev task is basically the default, but without the initial setup (clean and copy) task
gulp.task("dev", function taskDevBasic(done) {
    gulp.series(
        "webserver",
        gulp.parallel(
            "compile:scss",
            "browserify:site",
            "build:index",
            "build:pages"
        ),
        "watch:full")();
    done();
});


// build for 'production'
// includes minification of code and validation of the html

function production(done) {

    gulp.series(
        "site:setup",
        "webserver",
        // "site:remote",
        gulp.parallel(
            "compile:scss",
            "browserify:site",
            productionIndexPage,
            productionPages
        ),
        "watch:full")();

    done();
}

function productionPages(done) {
    gulp.series("build:pages", "validate:pages");
}

exports.production = production;
exports.productionPages = productionPages;
