/* jshint esversion: 6 */  // allow es6 features
"use strict";

const gulp =            require("gulp");
// const HubRegistry =       require("gulp-hub");

// gulp debuggin'
const glog =            require("fancy-log");
const debug =           require("gulp-debug");

// css, sass/scss
const sass =            require("gulp-sass");
const autoprefixer =    require("gulp-autoprefixer");
const cssnano =         require("gulp-cssnano");
const csslint =         require("gulp-csslint");

// js
const jshint =          require("gulp-jshint");
const browserify =      require("browserify");
const source =          require("vinyl-source-stream");
const buffer =          require("vinyl-buffer");
const babel =           require("gulp-babel");
const babelENV =        require("@babel/preset-env");
const uglify =          require("gulp-uglify");

// html
const htmlvalidator =   require("gulp-html");
const htmlmin =         require("gulp-htmlmin");

// content/template tool
const panini =          require("panini");

// gulp tools
const noop =            require("gulp-noop");
const glob =            require("glob");
const sourcemaps =      require("gulp-sourcemaps");
const rename =          require("gulp-rename");
const notify =          require("gulp-notify");
const notify_node =     require("node-notifier");  // existing dependency of gulp-notify
const filter =          require("gulp-filter");
// const through =         require("through2");
const cached =          require("gulp-cached");
const changed =         require("gulp-changed");
const changedInPlace =  require("gulp-changed-in-place");
const del =             require("del");
const node_path =       require("path");
const fs_utimes =       require("fs").utimes;

// dev/demo webserver
const connect =         require("gulp-connect");
const networkInterfaces = require("os").networkInterfaces();


// **********
// globals: build settings, paths and files of sources, etc.

const browserTargets = ["> 0.5%"];

const siteSourceRoot = "./src_demo/";
const siteBuildSource = siteSourceRoot + "site/";
const siteBuildDestinationRoot = "./demo/";

// globals for the demo site(s)

const paths = {

    // ignore for osx ds_store file
    DSStoreIgnore: "!**/.DS_Store",

    // build locations to clean out
    cleanGLOB : [
        siteBuildDestinationRoot + "public/**/*",
        siteBuildDestinationRoot + "**/*.html",
    ],

    // images
    imgSourceGLOBall: siteSourceRoot + "images/**/*",
    imgSourceGLOB: siteSourceRoot + "images/**/*.+(png|jpg|jpeg|gif|svg)",
    imgDestination: siteBuildDestinationRoot + "public/images/",
    icoSource: siteSourceRoot + "images/ico/favicon.ico",  // single ico file for use at 'root' of demo
    icoDestination: siteBuildDestinationRoot,

    // css
    scssSource: [siteSourceRoot + "scss/site.scss", siteSourceRoot + "scss/site-simple.scss"],
    scssSourceGLOB: siteSourceRoot + "scss/**/*.scss",
    cssDestination: siteBuildDestinationRoot + "public/css",
    cssDestinationGLOB: siteBuildDestinationRoot + "public/css/**/*.css",

    // cssVendorGLOB: siteSourceRoot + "css/vendor/**/*",
    // cssVendorDestination: siteBuildDestinationRoot + "public/css",

    // js
    jsDestination: siteBuildDestinationRoot + "public/js/",

    // all the js files
    jsSourceGLOB: siteSourceRoot + "js/**/*.js",

    // the site's 3rd party js files.
    // only here for the option to develop locally without network access
    jsVendorGLOB: siteSourceRoot + "js/vendor/**/*.js",
    jsVendorDestination: siteBuildDestinationRoot + "public/js",

    // the demo site's js files
    jsSourceSITEGLOB: [siteSourceRoot + "js/site/**/*.js"],
    jsFile_site: "site.js",
    browserifyDestinationFile_site: "site.js",
    jsFile_site_simple: "site-simple.js",

    browserifyDestinationFile_SidePanel: "SidePanelCollapse.js",

    // demo site building files
    siteBuildSource: siteBuildSource,  // dupe for convenience/consistency
    pageBuildSourceRoot: siteBuildSource + "pages/",
    siteDataGLOB: siteSourceRoot + "site/data/site/**/*",

    // MASTER FILE of the subpage/gallery data
    siteGalleryData: siteSourceRoot + "js/site/gallery/site-gallery-data.js",

    // demo html pages
    indexPage: "index.html",
    indexPage_simple: "index-simple.html",
    get indexPageSRC() {
        return [siteBuildSource + "pages/page/" + this.indexPage, siteBuildSource + "pages/page/" + this.indexPage_simple];
    },
    indexPageBuildDestination: siteBuildDestinationRoot,
    get indexPageBuilt() {
        return this.indexPageBuildDestination + this.indexPage;
    },
    pagesBuildDestinationRoot: siteBuildDestinationRoot,  // alias
    pagesBuiltGLOB: siteBuildDestinationRoot + "**/*.html",
    sitePages: siteBuildSource + "pages/",
    sitePagesData: siteSourceRoot + "site/pages/data/**/*.js",
    sitePagesGLOB: siteSourceRoot + "site/pages/page/**/*",
    get siteSourcePagesDataGLOB() {
        return (this.sitePages + "data/**/*.js");
    },
    get siteSourcePagesContentGLOB() {
        return (this.sitePages + "page/**/*.html");
    },

    // panini/handlebars files
    siteHBSFilesGLOB: siteBuildSource + "{data,layouts,helpers,partials}/**/*",

    get siteHBSjsFilesGLOB() {
        return this.siteHBSFilesGLOB + ".js";
    },

};



// globals for the sidePanelCollapse module
const sidepanelSourceRoot = "./src/";

const paths_sidepanel = {

    scss_source: [sidepanelSourceRoot + "scss/sidePanelCollapse.scss"],
    scss_sourceGLOB: [sidepanelSourceRoot + "scss/**/*"],
    css_built: "./dist/css",

    js_source: [sidepanelSourceRoot + "js/**/SidePanelCollapse.js"],
    js_sourceGLOB: [sidepanelSourceRoot + "js/**/*"],
};


// simply touch a file so that filesystem thinks the file changed
function touchNow(src) {
    let timenow = Date.now() / 1000;  // https://nodejs.org/docs/latest/api/fs.html#fs_fs_utimes_path_atime_mtime_callback
    if (!Array.isArray(src)) {
        src = src.split();
    }
    src.forEach( function(file) {
        fs_utimes(file, timenow, timenow, function(){return;});
    });
}


// tell panini to refresh all the files
function refreshPanini() {
    panini.refresh();
}

// utility function for displaying individual file names within a gulp stream
// function logFile(title) {
//     function logger (file, enc, callback) {
//         glog (title, ":", file.path);
//         callback( null, file);
//     }
//     return through.obj(logger);
// }


// webserver
// simple node server for dev
// along with simple utility function to show current IP address

function findAddress() {
    let ip_main, ip, address;

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

const options_server = {
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
    connect.server(options_server);
    let currentAddress = findAddress();
    console.log ("***** current IP address:", currentAddress);
    done();
}

gulp.task("webserver", webserver);



// erases the directories, clean out the compiled stuff
function siteClean(done) {
    del(paths.cleanGLOB).then(paths => {
        // console.log("deleted:");
        // console.log(paths.join("\n"));  // display list of everything del'd
        done();
    });
}

gulp.task("site:clean", siteClean);


// copy images
function copyImages(done) {
    gulp
    .src(paths.imgSourceGLOB)
    .pipe(gulp.dest(paths.imgDestination));
    done();
}

function copyImagesChanged(done) {
    gulp
    .src(paths.imgSourceGLOB)
    .pipe(changed(paths.imgDestination))
    .pipe(gulp.dest(paths.imgDestination));
    done();
}

function watchImages(done) {
    var watcherImages =  gulp.watch(paths.imgSourceGLOBall);
    watcherImages.on("error", err => glog("watch images error: " + err));
    watcherImages.on("change", path => glog("image changed >>> " + path));
    watcherImages.on("change", gulp.series("copy:images-changed"));
    done();
}

// copy ico file for demo. pretty much just to avoid the console error that ico file cannot be found
function copyIco(done) {
    gulp
    .src(paths.icoSource)
    .pipe(gulp.dest(paths.icoDestination));
    done();
}


// function copyCSSVendor(done) {
//     gulp
//     .src(paths.cssVendorGLOB)
//     .pipe(gulp.dest(paths.cssVendorDestination));
//     done();
// }
//
// function copyJSVendor(done) {
//     gulp
//     .src(paths.jsVendorGLOB)
//     .pipe(gulp.dest(paths.jsVendorDestination));
//     done();
// }

gulp.task("copy:images", copyImages);
gulp.task("copy:images-changed", copyImagesChanged);

// move and copy things that need to be moved and copied
// gulp.task("site:copy", gulp.parallel("copy:images", "copy:js-vendor", "copy:css-vendor"));
gulp.task("site:copy", gulp.parallel("copy:images", copyIco));
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

const options_changedInPlace = {
    firstPass: true,
    howToDetermineDifference: "modification-time"
};

const options_pageBuild = {
    root:       paths.siteBuildSource,             // path to the root folder all the page build stuff lives in
    layouts:    paths.siteBuildSource + "layouts/",
    pageLayouts: {
                "index.html":           "layout-index",
                "index-simple.html":    "layout-index-simple",
                "pages/page/**/*":      "layout-page",
                },
    helpers:    paths.siteBuildSource + "helpers/",       // path to a folder containing panini & handlebars helpers
    partials:   paths.siteBuildSource + "partials/",      // path to a folder containing HTML partials
    data:       [paths.siteBuildSource + "data/", paths.siteBuildSource + "pages/data/"],  // path to all data, which (the data) will be passed in and available to to every page
    debug: 0
};


// build a single page or glob of pages
// will build page(s) with no condition checks
function buildPage(pages, destination) {
    refreshPanini();

    return gulp
    .src(pages)
    // .pipe(debug({title: "building:"}))
    .pipe(panini(options_pageBuild))
    .pipe(gulp.dest(destination))
    .pipe(debug({title: "BUILT page:"}));
}


// build all the known pages,
// including the index page(s)
function buildPagesAll(done) {

    let src = paths.siteSourcePagesContentGLOB;
    let dest = paths.pagesBuildDestinationRoot;

    buildPage(src, dest);
    glog("BUILDING ALL PAGES");
    done();
}


// build the index.html page(s)
function buildIndex(done) {
    let stream = buildPage(paths.indexPageSRC, paths.indexPageBuildDestination);
    return stream;
}

gulp.task("build:index", buildIndex);
gulp.task("build:pages", buildPagesAll);


function watchindexPageSource(done) {
    var watcherIndex = gulp.watch(paths.indexPageSRC);
    watcherIndex.on("error", err => glog("watch index error: " + err));
    watcherIndex.on("change", path => glog("file changed >>> " + path));
    watcherIndex.on("change", gulp.series("build:index"));
    done();
}

gulp.task("watch:index", watchindexPageSource);


// site building: construct page path
// given a data file of /path/path/file.js,
// break down the path and construct the path & name of the counterpart file.html
// remove the src path from both files: src/site/pages/data & src/site/pages/page
function constructPagePath(file) {

    function makeHTMLFilename(file) {
        return file + ".html";
    };

    const sitePathBase = paths.siteBuildSource;

    const dataPagePathBase = "pages/data";
    const htmlPagePathBase = "pages/page";

    let parsedFile = node_path.parse(file);
    let htmlFilename = makeHTMLFilename(parsedFile.name);

    let filePath = parsedFile.dir;
    // replace portion of the path to data (.js) file with path to the html (.html) file
    let counterPath = filePath.replace(dataPagePathBase, htmlPagePathBase);

    // construct full path to the html version...
    let htmlFile = counterPath + node_path.sep + htmlFilename;

    return htmlFile;
};

// site building: watch the data files
// if data file for project page changes, then build the project page itself
//
// page sources are paired: page.html & page.js.
// so if page.js changes,
// - get the name of the paired page.html file,
// - and change the mtime on page.html so that it appears to have been changed
// - which in turn should kick off the rebuild of the page due to other task watching page.html pages


function buildPageOnDataChange(dataFile, done) {
    refreshPanini();

    // given the full path to the html file,
    // need to remove the common root part of the path that is the pages directory (-pageBuildSourceRoot)
    // to get the page's own subdirectory
    let pageFile = constructPagePath(dataFile);
    glog("data:", dataFile);
    glog("page:", pageFile);

    buildPage(pageFile, paths.pagesBuildDestinationRoot);
    done();
}


function watchPageData(done) {
    var watcherPageData = gulp.watch(paths.siteSourcePagesDataGLOB);
    watcherPageData.on("error", err => glog("watch error: " + err));
    watcherPageData.on("change", path => glog("data changed >>> " + path));
    watcherPageData.on("change", path => buildPageOnDataChange(path, done));
    done();
}


// function buildPageOnDataChange(done) {
//     var watcherPageChange =  gulp.watch(paths.siteSourcePagesDataGLOB);
//     watcherPageChange.on("error", err => glog("watch error: " + err));
//     watcherPageChange.on("change", function(dataFile) {
//         refreshPanini();
//
//         // given the full path to the html file,
//         // need to remove the common root part of the path that is the pages directory (-pageBuildSourceRoot)
//         // to get the page's own subdirectory
//
//         let pageFile = constructPagePath(dataFile);
//         // glog("data:", dataFile);
//         // glog("page:", pageFile);
//
//         buildPage(pageFile, paths.pagesBuildDestinationRoot);
//     });
//     done();
// }


// **************
// **************


function buildpagesCHANGED(done) {
    panini.refresh(done);

    // uses "changed-in-place" to determine if the source file itself was modified
    return gulp
    .src(paths.siteSourcePagesContentGLOB)
    .pipe(changedInPlace(options_changedInPlace))
    .pipe(panini(options_pageBuild))
    .on("error", function(err) {
        glog("page build error: " + err.message);
        this.emit("end");
    })
    .pipe(debug({title: "building:"}))
    .pipe(gulp.dest(paths.pagesBuildDestinationRoot));
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

gulp.task("watch:pages", gulp.series(watchPageData, watchPages));


// site building: watch the Panini sources and if any of them change, rebuild all the html pages.
// rebuild all because these items affect all pages.
// also watch the site data, which also affects all the pages.
function watchTemplateSources(done) {
    var watchTemplateSources =  gulp.watch([paths.siteHBSFilesGLOB, paths.siteDataGLOB]);
    watchTemplateSources.on("error", err => glog("watch templates & helpers error: " + err));
    watchTemplateSources.on("change", path => glog("templates & helpers changed >>> " + path));
    watchTemplateSources.on("change", gulp.series("build:pages"));
    done();
}

gulp.task("watch:buildingSources", watchTemplateSources);


// **********
// HTML
//
// html minimization: all the pages
// orverwrite the original file with the minified version
function minifyPages() {
    const options_htmlMin = {
        caseSensitive: true,
        collapseWhitespace: true,
        removeComments: true,
        keepClosingSlash: true,
        minifyJS: true
    };

    // set up to use base & relative path for overwriting the original file with the minified file
    let pathRelative = "./";

    console.log ("build val: ", paths.pagesBuiltGLOB);

    return gulp
    .src(paths.pagesBuiltGLOB, {base: pathRelative})
    .pipe(htmlmin(options_htmlMin))
    .pipe(debug({title: "minifying page: "}))
    .pipe(gulp.dest(pathRelative))
    .on("error", err => glog("HTML minification error: " + err))
    .on("change", path => console.log("minification of page >>> " + path));
}

gulp.task("minify:pages", minifyPages);
gulp.task("minify:site", gulp.series("minify:pages"));  // alias


// html validation of the built pages
function validatepPagesBuilt() {

    // config options for the html validator
    const options_validator = {
        "errors-only": false,
        "format": "text",
    };

    return gulp
    .src([paths.pagesBuiltGLOB])
    .pipe(htmlvalidator(options_validator))
    .pipe(debug({title: "validating:"}))
    .on("error", err => glog("PAGE validation error:\n" + err.message))
    .on("end", () => glog("PAGES validated"));
}

gulp.task("validate:pages", validatepPagesBuilt);
gulp.task("validate:site", gulp.parallel("validate:pages"));  // alias


// **********
// SCSS/SASS
//
// compile the scss, minify it, etc.

const options_autoprefix = {
    browsers: browserTargets,
};

const options_cssnano = {
    zindex: false
};

// general utility method to compile scss according to the passed-in arguments
function buildcss(src, dest, outputfile, options, mode) {
    return new Promise(function(resolve, reject) {
        gulp
        .src(src)
        .pipe(sourcemaps.init())
        .pipe(sass(options))
        .on("error", sass.logError)
        .on("error", () => reject("scss error in" + src))
        .pipe(autoprefixer(options_autoprefix))
        .pipe(debug({title: "compile scss " + "(" + mode + ")" + ":"}))
        //.pipe(rename({basename: outputfile}))
        .pipe(mode === "production" ? rename({suffix: ".min"}) : noop())
        .pipe(mode === "production" ? cssnano(options_cssnano) : noop())
        .pipe(sourcemaps.write("./map"))
        .pipe(gulp.dest(dest))
        .on("end", () => resolve("compile scss completed (" + mode + ")"));
    });
}

// compile the sidepanel.scss for standalone,
// and output the css files, both normal and minified
function maketheCSS_sidepanel(done) {

    let scss_sidepanel_source = "./src/scss/sidePanelCollapse.scss";
    let scss_sidepanel_destination = "./dist/css/";
    let scss_sidepanel_destination_filename = "sidePanelCollapse";

    const options_scss_normal = {
        includePaths: ["/"],
        errLogToConsole: true,
        outputStyle: "expanded",
        sourceComments: true,
        indentWidth: 4,
        precision: 4
    };

    const options_scss_production = {
        includePaths: ["/"],
        errLogToConsole: true,
        outputStyle: "compact",
        sourceComments: false,
        indentWidth: 2,
        precision: 4
    };

    buildcss(scss_sidepanel_source, scss_sidepanel_destination, scss_sidepanel_destination_filename, options_scss_normal, "normal")
    .then(msg => {glog(msg)})
    .catch(err => {glog(err)});

    buildcss(scss_sidepanel_source, scss_sidepanel_destination, scss_sidepanel_destination_filename, options_scss_production, "production")
    .then(msg => {glog(msg)})
    .catch(err => {glog(err)});

    done();
}

// process sidepanel.css for demo
// in this case, just copy the /dist files to /demo
function copyCSS_sidepanel(done) {

    let css_sidepanel_dist = "./dist/css/**/*";
    let css_sidepanel_destination = "./demo/public/css/sidePanelCollapse";

    gulp
    .src(css_sidepanel_dist)
    .pipe(gulp.dest(css_sidepanel_destination));
    done();
}


gulp.task("compile:scss-sidepanel", maketheCSS_sidepanel);
gulp.task("copy:css-sidepanel", copyCSS_sidepanel);

function maketheCSS_demo(buildMode, done) {

    const options_scss_demo = {
        includePaths: ["/", "src/scss"],
        errLogToConsole: true,
        outputStyle: "expanded",
        sourceComments: true,
        indentWidth: 4,
        precision: 4,
        debug: true
    };

    buildcss(paths.scssSource, paths.cssDestination, "demo site", options_scss_demo, buildMode)
    .then(msg => {glog(msg)})
    .catch(err => {glog(err)});
    done();
}

gulp.task("compile:scss", function(done) {
    maketheCSS_demo("normal", done);
    done();
});

gulp.task("compile:scss_production", function(done) {
    maketheCSS_demo("production", done);
    done();
});


const options_css_lint = {
    "order-alphabetical": false,
};

function lintCSS_demo() {
    let src = paths.cssDestinationGLOB;

    return gulp
    .src(src)
    .pipe(debug({title: "css check:"}))
    .pipe(csslint(options_css_lint))
    .pipe(csslint.formatter());
}

gulp.task("lint:css-demo", lintCSS_demo);



// watch the sidepanel scss sources
function watchSCSS_sidepanel(done) {
    var watcherSCSS =  gulp.watch(paths_sidepanel.scss_sourceGLOB);
    watcherSCSS.on("error", err => glog("watch scss error: " + err));
    watcherSCSS.on("unlink", path => glog(path + " was deleted"));
    watcherSCSS.on("change", path => glog("scss changed: "+ path));
    watcherSCSS.on("change", gulp.series("compile:scss-sidepanel", "copy:css-sidepanel", "compile:scss"));
    done();
}

// watch the demo scss sources
function watchSCSS(done) {
    var watcherSCSS =  gulp.watch(paths.scssSourceGLOB);
    watcherSCSS.on("error", err => glog("watch scss error: " + err));
    watcherSCSS.on("unlink", path => glog(path + " was deleted"));
    watcherSCSS.on("change", gulp.series("compile:scss"));
    done();
}

gulp.task("watch:scss-sidepanel", watchSCSS_sidepanel);
gulp.task("watch:scss", watchSCSS);



// **********
// SITE DATA

// site building: watch the gallery data
// the gallery data is used to generate the set of page cards displayed on the index page,
// and the inter-page navigation displayed in the sidepanel nav
function watchGalleryData(done) {
    var watcherGallery =  gulp.watch(paths.siteGalleryData);
    watcherGallery.on("error", err => glog("watch gallery data error: " + err));
    watcherGallery.on("change", gulp.parallel("build:index"));
    done();
}

// watch the project subpage/gallery data
gulp.task("watch:siteGallery", watchGalleryData);


// **********
// JAVASCRIPT
//
// lint, assemble, compile, and etc., for the javascript


// check the Panini files
function lintJSPanini() {
    let src = paths.siteHBSjsFilesGLOB;

    return gulp
    .src(src)
    .pipe(cached("jslintPanini"))
    .pipe(debug({title: "js lint check:"}))   // iterate out name of each file being checked
    .pipe(jshint(paths.jshintConfiguration))
    .pipe(jshint.reporter("default"));
}

function lintJSDemoSite() {
    let src = paths.jsSourceSITEGLOB;

    return gulp
    .src(src)
    .pipe(cached("jslintSite"))
    .pipe(debug({title: "js lint check:"}))   // iterate out name of each file being checked
    .pipe(jshint(paths.jshintConfiguration))
    .pipe(jshint.reporter("default"));
}

function lintJS_sidepanel() {
    let src = paths_sidepanel.js_source;

    return gulp
    .src(src)
    .pipe(debug({title: "js lint check:"}))
    .pipe(jshint(paths.jshintConfiguration))
    .pipe(jshint.reporter("default"));
}

gulp.task ("lint:js-panini", lintJSPanini);
gulp.task ("lint:js-demo", lintJSDemoSite);
gulp.task ("lint:js-sidepanel", lintJS_sidepanel);


// javascript building: global options
// babel options to transpile javascript to browser-compatible level
const options_babel = {
  "presets": [
    [ "@babel/preset-env",
        {
            "targets": {
                "browsers": browserTargets
            },
            "exclude": [
                "transform-typeof-symbol"  // don't add polyfill for typeof
            ],
            "modules": false,
            "debug": false
        }
    ]
  ],
};

const options_uglify = {
    output: {
        comments: "/^!/"  // retain comments that match this pattern
    }
};


// main site.js javascript assembly for demo
function browserifyScript(file) {

    const standalone_file = "site";
    const options_bundle = {
        entries: siteSourceRoot + "js/site/" + file,  // starting file for the processing. relative to this gulpfile
        paths: [siteSourceRoot + "js/site/", siteSourceRoot + "js/site/modules/", siteSourceRoot + "js/site/pages/", sidepanelSourceRoot + "js/"],
        standalone: standalone_file,
        debug: false
    };

    return browserify(options_bundle)
        .bundle()
        .on("error", function(err) {
            glog("browserify error: " + err);
            this.emit("end");
            })
        .pipe(source(paths.browserifyDestinationFile_site))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        // add transformation tasks in the pipeline here
        .pipe(babel(options_babel))
        // .pipe(uglify())  // enable if you want to minify the demo site.js
        // end transformations
        .pipe(sourcemaps.write("./map"))
        .pipe(gulp.dest(paths.jsDestination))
        .on("end", () => glog("browserify:SITE complete"));
}

// browserify the site.js code
function browserifyJSSite(done) {
    browserifyScript(paths.jsFile_site);
    done();
}

gulp.task("browserify:site", browserifyJSSite);

// SidePanelCollapse.js javascript processing
// create (conditionally) two files: normal version and minified version
function javascriptSidePanel(options) {

    let source = options.source_path + options.source_file;
    let destination_path = options.destination_path;
    let destination_filename = options.standalone_file;

    let create_normal = options.normal;
    let create_minified = options.minified;

    // start the stream
    let stream = gulp.src(source)
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(babel(options_babel));

    // output the non-minified version
    if (create_normal) {
        stream = stream
        .pipe(sourcemaps.write("./map"))
        .pipe(gulp.dest(destination_path));
    }

    // now do the minified version
    if (create_minified) {
        stream = stream
        // filter out non .js (i.e. the .map file) before uglification step
        .pipe(filter("**/*.js"))
        .pipe(uglify(options_uglify))
         .on("error", function(err) {
            glog("error: " + err);
            this.emit("end");
        })
       .pipe(rename({suffix: ".min"}))
       .pipe(sourcemaps.write("./map"))
       .pipe(gulp.dest(destination_path));
    }

    return stream;
}

// sidepanelcollapse.js for standalone dist/production
// build/transpile sidepanel
// then put it into the /dist directory
function scriptifySidepanel(done) {
    let options = {
        "normal": true,
        "minified": true,
        "source_path": sidepanelSourceRoot + "js/",
        "source_file": "SidePanelCollapse.js",
        "destination_path": "./dist/js/",
    };
    javascriptSidePanel(options);
    done();
}

gulp.task("scriptify:sidepanel", scriptifySidepanel);

// sidepanelcollapse.js for the demo site
// build/transpile sidepanel
// then put it into the demo directory
function demoifySidepanel(done) {
    let options = {
        "normal": true,
        "minified": true,
        "source_path": sidepanelSourceRoot + "js/",
        "source_file": "SidePanelCollapse.js",
        "destination_path": paths.jsDestination + "/sidePanelCollapse/",
    };
    javascriptSidePanel(options);
    done();
}

gulp.task("demoify:sidepanel", demoifySidepanel);

// process site-simple.js for demo.
// which is actually so simple that no processing is needed.
// so, this is jusy a copy task
function copyJSSimple(done) {
    gulp
    .src(siteSourceRoot + "js/site/" + paths.jsFile_site_simple)
    .pipe(gulp.dest(paths.jsDestination));
    done();
}

gulp.task("copy:jsSimple", copyJSSimple);

gulp.task("js:site", gulp.parallel("browserify:site", "copy:jsSimple"));


// watch the js sources
function watchJSSite(done) {
    // exclude site-simple.js from this watch for simplicity
    let NOTsiteSimple = "!" + siteSourceRoot + "js/site/" + paths.jsFile_site_simple;

    var watcherJS = gulp.watch([paths.jsSourceGLOB, NOTsiteSimple]);
    watcherJS.on("error", err => glog("watch js error: " + err.message));
    watcherJS.on("change", path => glog("js changed >>> " + path));
    watcherJS.on("change", gulp.series("lint:js-demo", "browserify:site"));
	done();
}

// watch the site-simple.js source
function watchJSSiteSimple(done) {
    var watcherJSsimple =  gulp.watch(siteSourceRoot + "js/site/" + paths.jsFile_site_simple);
    watcherJSsimple.on("error", err => glog("watch js error: " + err.message));
    watcherJSsimple.on("change", path => glog("js changed >>> " + path));
    watcherJSsimple.on("change", gulp.series("lint:js-demo", "copy:jsSimple"));
	done();
}

// watch the sidepanelcollapse js
// if it changes, rebuild the js for the demo
function watchJSSidePanel(done) {
    var watcherJSsidepanel =  gulp.watch(paths_sidepanel.js_sourceGLOB);
    watcherJSsidepanel.on("error", err => glog("watch js error: " + err.message));
    watcherJSsidepanel.on("change", path => glog("js changed >>> " + path));
    watcherJSsidepanel.on("change", gulp.series("lint:js-sidepanel", "browserify:site", "demoify:sidepanel", "scriptify:sidepanel"));
	done();
}

gulp.task("watch:js", watchJSSite);
gulp.task("watch:js-simple", watchJSSiteSimple);
gulp.task("watch:js-sidepanel", watchJSSidePanel);


// watch all the things
gulp.task("watch:everything", gulp.parallel(
    "watch:scss-sidepanel",
    "watch:js-sidepanel",
    "watch:buildingSources",
    "watch:scss",
    "watch:js",
    "watch:js-simple",
    "watch:siteGallery",
    "watch:index",
    "watch:pages"
));

gulp.task("build:demo", gulp.series(
    "webserver",
    "site:setup",
    gulp.parallel(
        "compile:scss",
        "browserify:site",
        "demoify:sidepanel",
        "build:pages"
    )
));

gulp.task("default", gulp.series(
    "site:setup",
    "webserver",
    gulp.parallel(
        "compile:scss",
        "browserify:site",
        "build:pages"
    ),
    "watch:everything"
));

gulp.task("demo", gulp.series(
    "webserver",
    "site:setup",
    gulp.parallel(
        "compile:scss",
        "js:site",
        "demoify:sidepanel",
        "build:pages"
    )
));



// dev task is basically the default
gulp.task("dev", function taskDevBasic(done) {
    gulp.series(
//         "site:setup",
        "webserver",
        gulp.parallel(
            "compile:scss",
            "browserify:site",
            "demoify:sidepanel",
            "build:pages"
        ),
        "watch:everything")();
    done();
});


function productionPages(done) {
    gulp.series("build:pages", "validate:pages");
}

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
            productionPages
        ),
        "watch:everything")();
    done();
}


// sidepanel dist/production process
//
// js:
// * lint js
// * copy the main js file to dist/js
// * browserify the copy into min version, same dest
//
// css:
// * compile the standalone scss file, normal, dest = dist/css
// * compile the standalone scss file, minify, dest = dist/css

function dist_sidepanel(done) {
    gulp.series(
        "lint:js-sidepanel",
        gulp.parallel(
            "scriptify:sidepanel",
            "compile:scss-sidepanel"
        ),
        "watch:js-sidepanel")();
    done();
}

exports.dist_sidepanel = dist_sidepanel;
exports.production_sidepanel = dist_sidepanel;  // alias

exports.production = production;
exports.productionPages = productionPages;
