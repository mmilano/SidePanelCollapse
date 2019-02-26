/* jshint esversion: 6 */  // allow es6 features
"use strict";

const gulp =            require("gulp");

// gulp debuggin'
const glog =            require("fancy-log");
const debug =           require("gulp-debug");

// css sass/scss
const sass =            require("gulp-sass");
const autoprefixer =    require("gulp-autoprefixer");
const cssnano =         require("gulp-cssnano");

// javascript
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

// content/template system
const panini =          require("panini");

// tools
const noop =            require("gulp-noop");
const glob =            require("glob");
const sourcemaps =      require("gulp-sourcemaps");
const rename =          require("gulp-rename");
const notify =          require("gulp-notify");
const notify_node =     require("node-notifier");  // existing dependency of gulp-notify
const filter =          require("gulp-filter");
const through =         require("through2");

const cached =          require("gulp-cached");
const changed =         require("gulp-changed");
const changedInPlace =  require("gulp-changed-in-place");

const del =             require("del");
const node_path =       require("path");
const fs_utimes =       require("fs").utimes;

// dev webserver
const connect =         require("gulp-connect");
const networkInterfaces = require("os").networkInterfaces();


// **********
// globals: paths and files of sources, etc.

const siteBuildDestinationRoot = "./demo/";
const siteBuildSource = "./src/site/";

const paths = {

    // ignore for osx ds_store file
    DSStoreIgnore: "!**/.DS_Store",

    // build locations to clean out
    cleanGLOB : [
        siteBuildDestinationRoot + "public/**/*",
        siteBuildDestinationRoot + "/**/*.html",
    ],

    // images
    imgSourceGLOBDIR: "./src/images/**/*",
    imgSourceGLOB: "./src/images/**/*.+(png|jpg|jpeg|gif|svg)",
    imgDestination: siteBuildDestinationRoot + "public/images/",

    // css
    scssSource: ["./src/scss/site.scss", "./src/scss/site-simple.scss"],
    scssSourceGLOB: "./src/scss/**/*.scss",
    cssDestination: siteBuildDestinationRoot + "public/css",

    cssVendorGLOB: "./src/css/vendor/**/*",
    cssVendorDestination: siteBuildDestinationRoot + "public/css",

    // js
    jsDestination: siteBuildDestinationRoot + "public/js/",

    // all the js files
    jsSourceGLOB: ["./src/js/**/*.js"],

    // the site's 3rd party js files.
    // only here for the option to develop locally without network access
    jsVendorGLOB: "src/js/vendor/**/*.js",
    jsVendorDestination: siteBuildDestinationRoot + "public/js",

    // the demo site's js files
    jsSourceSITEGLOB: ["./src/js/site/**/*.js"],
    jsFile_site: "site.js",
    browserifyDestinationFile_site: "site.js",
    browserifyDestinationFile_SidePanel: "SidePanelCollapse.js",

    // demo site building files
    siteBuildSource: siteBuildSource,  // dupe for convenience/consistency
    pageBuildSourceRoot: siteBuildSource + "pages/",
    siteDataGLOB: "./src/site/data/site/**/*",

    // MASTER FILE of the gallery data
    siteGalleryData: "./src/js/site/gallery/site-gallery-data.js",

    // demo html pages
    indexPage: "index.html",
    get indexPageSRC() {
        return this.siteBuildSource + "pages/page/" + this.indexPage;
    },
    indexPageBuildDestination: siteBuildDestinationRoot,
    get indexPageBuilt() {
        return this.indexPageBuildDestination + this.indexPage;
    },
    pagesBuildDestinationRoot: siteBuildDestinationRoot,  // alias
    pagesBuiltGLOB: siteBuildDestinationRoot + "**/*.html",
    sitePages: siteBuildSource + "pages/",
    sitePagesData: "./src/site/pages/data/**/*.js",
    sitePagesGLOB: "./src/site/pages/page/**/*",
    get siteSourcePagesDataGLOB() {
        return (this.sitePages + "data/**/*.js");
    },
    get siteSourcePagesContentGLOB() {
        return (this.sitePages + "page/**/*.html");
    },

    // panini/handlebars files
    siteHBSFilesGLOB: siteBuildSource + "{layouts,helpers,partials}/**/*",

    get siteHBSjsFilesGLOB() {
        return this.siteHBSFilesGLOB + ".js";
    },

};


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

// utility function for displaying individual file names within a gulp stream
function logFile(title) {
    function logger (file, enc, callback) {
        glog (title, ":", file.path);
        callback( null, file);
    }
    return through.obj(logger);
}


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

// gulp.task("copy:css-vendor", copyCSSVendor);
gulp.task("copy:images", copyImages);
gulp.task("copy:images-changed", copyImagesChanged);
// gulp.task("copy:js-vendor", copyJSVendor);

gulp.task("watch:images", watchImages);


// move and copy things that need to be moved and copied
// gulp.task("site:copy", gulp.parallel("copy:images", "copy:js-vendor", "copy:css-vendor"));
gulp.task("site:copy", gulp.parallel("copy:images"));
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
                "index-simple.html":    "layout-index-simple",
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
    .src(paths.siteSourcePagesContentGLOB)
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
    .pipe(gulp.dest(paths.indexPageBuildDestination));
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


// site building: construct page path
// given a data file of /path/path/file.js,
// break down the path and construct the path & name of the counterpart file.html
// remove the src path from both files: src/site/pages/data & src/site/pages/page
function constructPagePath(file) {

    function constructHTMLFilename(file) {
        return file + ".html";
    };

    const pathBase = paths.siteBuildSource;  // top portion location of the content pages
    const pagePathBase = "src/site/pages/";
    const dataPagePathBase = "src/site/pages/data";
    const htmlPagePathBase = "src/site/pages/page";

    let parsedFile = node_path.parse(file);
    let filePath = parsedFile.dir;
    let counterPath = filePath.replace(dataPagePathBase, htmlPagePathBase);
    let htmlFilename = constructHTMLFilename(parsedFile.name);

    // construct path to the html version...
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
function buildPageOnDataChange(done) {
    var watcherPageChange =  gulp.watch(paths.siteSourcePagesDataGLOB);
    watcherPageChange.on("error", err => glog("watch error: " + err));
    watcherPageChange.on("change", function(dataFile) {
        refreshPanini(done);

        // given the full path to the html file,
        // need to remove the common root part of the path that is the pages directory (-pageBuildSourceRoot)
        // to get the page's own subdirectory

        let pageFile = constructPagePath(dataFile);
        glog("data:", dataFile);
        glog("page:", pageFile);
        glog("root destination:", paths.pagesBuildDestinationRoot);

        let pageSubPath = "/.";
        buildPage(pageFile, pageSubPath);
    });
    done();
}


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
    .src(paths.siteSourcePagesContentGLOB)
    .pipe(changedInPlace(changedInPlaceOptions))
    .pipe(panini(pageBuildOptions))
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
// orverwrite the original file with the minified version
function minifyPages() {
    const htmlminOptions = {
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
    .pipe(htmlmin(htmlminOptions))
    .pipe(debug({title: "minifying page: "}))
    .pipe(gulp.dest(pathRelative))
    .on("error", err => glog("HTML minification error: " + err))
    .on("change", path => console.log("minification of page >>> " + path));
}

gulp.task("minify:pages", minifyPages);
gulp.task("minify:site", gulp.series("minify:pages"));  // alias


// config options for the html validator
const validatorOptions = {
    "errors-only": false,
    "format": "text",
};

// validate the (built) html pages
function validatepPagesBuilt() {
    return gulp
    .src([paths.pagesBuiltGLOB, paths.indexPageBuilt])
    .pipe(htmlvalidator(validatorOptions))
    .pipe(debug({title: "validating:"}))
    .on("error", err => glog("PAGE validation error:\n" + err.message))
    .on("end", () => glog("PAGES validated"));
}

gulp.task("validate:pages", validatepPagesBuilt);
gulp.task("validate:all", gulp.parallel("validate:pages"));  // alias


// **********
// SCSS/SASS
//
// compile the scss, minify it, etc.

const autoprefixerOptions = {
    browsers: ["last 2 versions"],
};

const cssnanoOptions = {
    zindex: false
};

function buildcss(src, dest, outputfile, options, mode) {
    return new Promise(function(resolve, reject) {
        gulp
        .src(src)
        .pipe(sourcemaps.init())
        .pipe(sass(options))
        .on("error", sass.logError)
        .on("error", () => reject("scss error in" + src))
        .pipe(autoprefixer(autoprefixerOptions))
        .pipe(debug({title: "compile scss " + "(" + mode + ")" + ":"}))
        //.pipe(rename({basename: outputfile}))
        .pipe(mode === "production" ? rename({suffix: ".min"}) : noop())
        .pipe(mode === "production" ? cssnano(cssnanoOptions) : noop())
        .pipe(sourcemaps.write("./map"))
        .pipe(gulp.dest(dest))
        .on("end", () => resolve("compile scss completed (" + mode + ")"));
    });
}

// compile the sidepanel.scss independently of the full demo site scss for standalone,
// and output the css files
function maketheCSS_sidepanel(done) {

    let scss_sidepanel_source = "./src/scss/sidepanel.scss";
    let scss_sidepanel_destination = "./dist/css/";
    let scss_sidepanel_destination_filename = "sidepanel";

    const scssOptions_normal = {
        includePaths: ["/"],
        errLogToConsole: true,
        outputStyle: "expanded",
        sourceComments: true,
        indentWidth: 4,
        precision: 4
    };

    const scssOptions_production = {
        includePaths: ["/"],
        errLogToConsole: true,
        outputStyle: "compact",
        sourceComments: false,
        indentWidth: 2,
        precision: 4
    };

    let buildoptions = scssOptions_normal;
    buildcss(scss_sidepanel_source, scss_sidepanel_destination, scss_sidepanel_destination_filename, buildoptions, "normal")
    .then(msg => {glog(msg);})
    .catch(err => {glog(err);});

    buildoptions = scssOptions_production;
    buildcss(scss_sidepanel_source, scss_sidepanel_destination, scss_sidepanel_destination_filename, buildoptions, "production")
    .then(msg => {glog(msg);})
    .catch(err => {glog(err);});

    done();
}

gulp.task("compile:scss-sidepanel", maketheCSS_sidepanel);

function maketheCSS_demo(buildMode, done) {

    const scssOptions = {
        includePaths: ["/"],
        errLogToConsole: true,
        outputStyle: "expanded",
        sourceComments: true,
        indentWidth: 4,
        precision: 4
    };

    buildcss(paths.scssSource, paths.cssDestination, "demo site", scssOptions, buildMode)
    .then(msg => {glog(msg);})
    .catch(err => {glog(err);});
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
        let file = paths.siteGalleryData;
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
    var watcherGallery =  gulp.watch(paths.siteGalleryData);
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

function lintJSSite() {
    let src = paths.jsSourceSITEGLOB;

    return gulp
    .src(src)
    .pipe(cached("jslintSite"))
    .pipe(debug({title: "js lint check:"}))   // iterate out name of each file being checked
    .pipe(jshint(paths.jshintConfiguration))
    .pipe(jshint.reporter("default"));
}

// function lintJSSidePanel() {
//     let src = paths.jsSourceSITEGLOB;
//
//     return gulp
//     .src(src)
//     .pipe(debug({title: "js lint check:"}))   // iterate out name of each file being checked
//     .pipe(jshint(paths.jshintConfiguration))
//     .pipe(jshint.reporter("default"));
// }

gulp.task ("lint:Paninijs", lintJSPanini);
gulp.task ("lint:js", lintJSSite);


// javascript building: global options
// babel options to transpile javascript to browser-compatible level
const babelOptions = {
  "presets": [
    [ "@babel/preset-env",
        {
            "targets": {
                "browsers": ["> 1%"]
            },
            "exclude": [
                "transform-typeof-symbol"  // don't add polyfill for typeof
            ],
            "modules": false,
            // "debug": true
        }
    ]
  ],
};

const uglifyOptions = {
    output: {
        comments: "/^!/"  // retain comments that match this pattern
    }
};


// main site.js javascript assembly for demo
function browserifyScript(file) {

    const standalone_file = "site";
    const bundleOptions = {
        entries: "./src/js/site/" + file,  // starting file for the processing. relative to this gulpfile
        paths: ["./src/js/site/", "./src/js/site/modules", "./src/js/site/pages", "./src/js/general/"],
        standalone: standalone_file,
        debug: false
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
        // .pipe(uglify())  // enable if you want to minify the demo site.js
        // end transformations
        .pipe(sourcemaps.write("./map"))
        .pipe(gulp.dest(paths.jsDestination))
        .on("end", () => glog("browserify:SITE complete"));
}

// browserify the site.js bundle
gulp.task("browserify:site", function browserifySiteJS(done) {
    browserifyScript(paths.jsFile_site);
    done();
});


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
    .pipe(babel(babelOptions));

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
        .pipe(uglify(uglifyOptions))
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

// process sidepanelcollapse.js for standalone dist/production
gulp.task("scriptify:sidepanel", function(done) {
    let options = {
        "normal": true,
        "minified": true,
        "source_path": "./src/js/site/modules/",
        "source_file": "SidePanelCollapse.js",
        "destination_path": "./dist/js/",
    };

    javascriptSidePanel(options);
    done();
});

// process sidepanelcollapse.js for the demo
gulp.task("demoify:sidepanel", function(done) {

    let options = {
        "normal": true,
        "minified": false,
        "source_path": "./src/js/site/modules/",
        "source_file": "SidePanelCollapse.js",
        "destination_path": "./demo/public/js/sidePanelCollapse/",
    };

    javascriptSidePanel(options);
    done();
});


// watch the js sources
function watchJS(done) {
    var watcherJS =  gulp.watch(paths.jsSourceGLOB);
    watcherJS.on("error", err => glog("watch js error: " + err.message));
    watcherJS.on("change", path => glog("js changed >>> " + path));
    watcherJS.on("change", gulp.series("lint:js", "browserify:site", "demoify:sidepanel"));
	done();
}

// watch the sidepanelcollapse js
function watchJS(done) {
    var watcherJS =  gulp.watch(paths.jsSourceGLOB);
    watcherJS.on("error", err => glog("watch js error: " + err.message));
    watcherJS.on("change", path => glog("js changed >>> " + path));
    watcherJS.on("change", gulp.series("lint:js", "demoify:sidepanel"));
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
    "watch:pages"
));

gulp.task("build:demo", gulp.series(
    "webserver",
    "site:setup",
    gulp.parallel(
        "compile:scss",
        "browserify:site",
        "build:index",
        "build:pages"
    )
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

gulp.task("demo", gulp.series(
    "webserver",
    gulp.parallel(
        "compile:scss",
        "browserify:site",
        "build:index",
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
            "build:index",
            "build:pages"
        ),
        "watch:full")();
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
            productionIndexPage,
            productionPages
        ),
        "watch:full")();
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
        "lint:js",
        gulp.parallel(
            "scriptify:sidepanel",
            "compile:scss-sidepanel"
        ))();
    done();
}

exports.dist_sidepanel = dist_sidepanel;
exports.production_sidepanel = dist_sidepanel;  // alias

exports.production = production;
exports.productionPages = productionPages;
