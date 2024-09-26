"use strict";

// const gulp =            require("gulp");
const {src, dest, watch, series, parallel} =   require('gulp');

// gulp debuggin'
const log =             require("fancy-log");
const debug =           require("gulp-debug");

// css, sass/scss
const sass =            require("gulp-sass")(require("sass"));

// post css + plugins
const postcss =         require("gulp-postcss");
const autoprefixer =    require("autoprefixer");
const cssnano =         require("cssnano");

// js
const ESLint =          require("gulp-eslint-new");

const browserify =      require("browserify");
const source =          require("vinyl-source-stream");
const buffer =          require("vinyl-buffer");
const babel =           require("gulp-babel");
const uglify =          require("gulp-uglify");

// html
const htmlValidator =   require("gulp-html");
const htmlmin =         require("gulp-htmlmin");

// page-generation/templating tool
const panini =          require("panini");

// tools
const noop =            require("gulp-noop");
const sourcemaps =      require("gulp-sourcemaps");
const rename =          require("gulp-rename");
// const filter =          require("gulp-filter");
const cached =          require("gulp-cached");
const changedInPlace =  require("gulp-changed-in-place");
const del =             require("del");
const node_path =       require("path");

// dev/demo web server
const connect =         require("gulp-connect");
const ip = 				require("ip");

// **********
// globals: build settings, paths and files of sources, etc.

const sidePanel_libraryName = "SidePanelCollapse";

// file paths
const siteSourceRoot = "./src_demo/";
const siteBuildSource = siteSourceRoot + "site/";
const siteBuildDestinationRoot = "./demo/";

// globals for the demo site(s)
// 'site' is more or less synonymous with 'demo'

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
    icoSource: siteSourceRoot + "images/ico/favicon.ico",
    icoDestination: siteBuildDestinationRoot,

    // css
    scssSource: [siteSourceRoot + "scss/site.scss", siteSourceRoot + "scss/site-simple.scss"],
    scssSourceGLOB: siteSourceRoot + "scss/**/*.scss",
    cssDestination: siteBuildDestinationRoot + "public/css",
    cssDestinationGLOB: siteBuildDestinationRoot + "public/css/**/*.css",

    // js
    jsDestination: siteBuildDestinationRoot + "public/js/",

    // all the js files
    jsSourceGLOB: siteSourceRoot + "js/**/*.js",

    // the site's 3rd party js files.
    // only here for the option to develop locally without network access
    // jsVendorGLOB: siteSourceRoot + "js/vendor/**/*.js",
    // jsVendorDestination: siteBuildDestinationRoot + "public/js",

    jsSourceSITEGLOB: [siteSourceRoot + "js/site/**/*.js", siteSourceRoot + "site/pages/**/*.js"],
    jsFile_site: "site.js",
    browserifyDestinationFile_site: "site.js",
    jsFile_site_simple: "site-simple.js",

    // demo site building files
    siteBuildSource: siteBuildSource,  // alias for convenience
    pageBuildSourceRoot: siteBuildSource + "pages/",
    siteDataGLOB: siteSourceRoot + "site/data/site/**/*",

    // MASTER FILE of the subpage/gallery data
    siteGalleryData: siteSourceRoot + "js/site/gallery/site-gallery-data.js",

    // html
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


// paths for the SidePanelCollapse library
const sidePanelSourceRoot = "./src/";
const sidePanelDestinationRoot = "./dist/";

const paths_sidePanel = {
    scss_source: [sidePanelSourceRoot + "scss/SidePanelCollapse.scss"],
    scss_sourceGLOB: [sidePanelSourceRoot + "scss/**/*.scss"],
    css_destination: sidePanelDestinationRoot + "css",

    js_source: [sidePanelSourceRoot + "js/**/SidePanelCollapse.js"],
    js_sourceGLOB: [sidePanelSourceRoot + "js/**/*"],
};


// tell panini to refresh all the {layouts, partials, helpers, data} files
function refreshPanini() {
    panini.refresh();
}

// WEB SERVER
// simple node server for development and demo viewing

// utility function to find current IP address.
// * might not be bulletproof *
const findIPAddress = () => {
	let address = ip.address();

    if (typeof address === "undefined") {
        address = noAddressMessage;
    }

    return address;
}

// note: default_server_host 0.0.0.0 allows you to view the pages at
//      http://localhost:9191
// OR   http://[current IP address]:9191 (on macOSX),
// AND  http://[current IP address]:9191 from a virtual machine.
// (assuming default port # as listed below)
//s
const default_server_host = "0.0.0.0";
const currentIPAddress = findIPAddress();
const noAddressMessage = "* cannot be determined *";

const options_webserver = {
    name: "dev",
    port: 9191,
    host: default_server_host,
    defaultFile: "index.html",
    root: siteBuildDestinationRoot,
    directoryListing: {
      enable: false,
      path: "./"
    },
    livereload: false,
};

// some user-friendly server info
const displayServerInfo = () => {
    console.info("\n");
    console.info("Web server is running...");
    console.info("Connection options:");
    console.info("localhost:" + options_webserver.port );

    if ((typeof currentIPAddress !== "undefined") && (currentIPAddress !== noAddressMessage)) {
    	console.info(currentIPAddress + ":" + options_webserver.port );
    }
    console.info("\n");
}

// note about using connect:
// connect will throw an error and halt if any error happens while trying to start up,
// such as trying to start the web server something is running on that port already (i.e. "EADDRINUSE").
function webserver(done) {
    connect.server(options_webserver);
    displayServerInfo();
    done();
}

exports.webserver = webserver;

// **************
// CLEAN UP and SET UP

// erases the directories, clean out the compiled stuff
const siteClean = function (done) {
    del(paths.cleanGLOB)
        .then(paths => {
            // console.log("deleted:");
            // console.log(paths.join("\n"));  // display list of everything del'd
        })
        .finally(() => {
            done();
        });
};

exports.siteClean = siteClean;

// copy ico file
const copyIco = function (done) {
    src(paths.icoSource)
    .pipe(dest(paths.icoDestination));
    done();
};

// copy images
const copyImages = function (done) {
    src(paths.imgSourceGLOB)
    .pipe(dest(paths.imgDestination));
    done();
}


// move and copy things that need to be moved and copied
const siteCopy = parallel(copyImages, copyIco);
exports.siteCopy = siteCopy;

const siteSetup = series(siteClean, siteCopy);
exports.siteSetup = siteSetup;

// **************
// PAGE GENERATION

// options for the changed-in-place module
const options_changedInPlace = {
    firstPass: true,
    howToDetermineDifference: "modification-time"
};

// options for the page building
const options_pageBuild = {
    root:       "./src_demo/site/pages/page",   // path to the root folder all the pages live in
    layouts:    paths.siteBuildSource + "layouts/",
    pageLayouts: {
        "index.html":           "layout-index",
        "index-simple.html":    "layout-index-simple",
        "":                     "layout-page",  // key intentionally left blank
    },
    helpers:    paths.siteBuildSource + "helpers/",       // path to a folder containing panini & handlebars helpers
    partials:   paths.siteBuildSource + "partials/",      // path to a folder containing HTML partials
    data:       [paths.siteBuildSource + "data/", paths.siteBuildSource + "pages/data/"],  // path to all data, which (the data) will be passed in and available to to every page
    debug: false,
};


// build a single page or glob of pages
// will build page(s) with no condition checks
// function buildPage(pages, destination) {
const buildPage = function (pages, destination) {
    refreshPanini();

    return src(pages)
    .pipe(panini(options_pageBuild))
    .pipe(dest(destination))
    .pipe(debug({title: "BUILT page:"}));
};

// build all the known pages,
// including the index page(s)
// function buildPages(done) {
const buildPages = function (done) {
    const src = paths.siteSourcePagesContentGLOB;
    const dest = paths.pagesBuildDestinationRoot;

    buildPage(src, dest);
    // log("BUILDING: ALL PAGES");
    done();
};

// build ONLY the index page(s)
const buildIndex = function (done) {
    const src = paths.indexPageSRC;
    const dest = paths.indexPageBuildDestination;

    buildPage(src, dest);
    // log("BUILDING: INDEX PAGES");
    done();
};

exports.buildIndex = buildIndex;
exports.buildPages = buildPages;


function watchIndexPageSource(done) {
    const watcherIndex = watch(paths.indexPageSRC, series(buildIndex));
    watcherIndex.on("change", path => log("changed >>> " + path));
    watcherIndex.on("error", err => log("watch error: " + err));
    done();
}


// site building: construct page path
// given a data file of /path/path/file.js,
// break down the path and construct the path & name of the counterpart file.html
// remove the src path from both files: src/site/pages/data & src/site/pages/page
const constructPagePath = (file) => {

    const makeHTMLFilename = (file) => {
        return file + ".html";
    };

    // const sitePathBase = paths.siteBuildSource;

    const dataPagePathBase = "pages/data";
    const htmlPagePathBase = "pages/page";

    const parsedFile = node_path.parse(file);
    const htmlFilename = makeHTMLFilename(parsedFile.name);

    const filePath = parsedFile.dir;
    // replace portion of the path to data (.js) file with path to the html (.html) file
    let counterPath = filePath.replace(dataPagePathBase, htmlPagePathBase);

    // construct full path to the html version...
    const htmlFile = counterPath + node_path.sep + htmlFilename;
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
    const pageFile = constructPagePath(dataFile);
    log("data:", dataFile);
    log("page:", pageFile);

    buildPage(pageFile, paths.pagesBuildDestinationRoot);
    done();
}

// function watchPageData(done) {
const watchPageData = function (done) {
    const watcherPageData = watch(paths.siteSourcePagesDataGLOB);
    watcherPageData.on("change", path => log("data changed >>> " + path));
    watcherPageData.on("change", path => buildPageOnDataChange(path, done));
    watcherPageData.on("error", err => log("watch error: " + err));
    done();
};

function buildPagesCHANGED(done) {
    // refreshPanini();

    // uses "changed-in-place" to determine if the source file itself was modified.
    // note: the changed-in-place options of firstpass = true will have the effect of making it build ALL files on first run of build.
    // as a result, first page change will trigger ALL pages to build; subsequent changes will build just the individual changed pages
    return src(paths.siteSourcePagesContentGLOB)
    .pipe(changedInPlace(options_changedInPlace))
    .pipe(panini(options_pageBuild))
    .on("error", function(err) {
        log("page build error: " + err.message);
        this.emit("end");
    })
    .pipe(debug({title: "building:"}))
    .pipe(dest(paths.pagesBuildDestinationRoot));
}

// watch just the project pages and only build the ones whose html pages changed
exports.buildpagesCHANGED = buildPagesCHANGED;


function watchPages(done) {
    const watcherPages = watch([paths.sitePagesGLOB, paths.DSStoreIgnore], {delay: 400}, buildPagesCHANGED);
    watcherPages.on("change", path => log("pages changed >>> " + path));
    watcherPages.on("error", err => log("watch error: " + err));
    done();
}

const watchAllPages = parallel(watchPageData, watchPages);
exports.watchAllPages = watchAllPages;


// site building: watch the Panini sources and if any of them change, rebuild all the html pages.
// rebuild all because these items affect all pages.
// also watch the site data, which also affects all the pages.
function watchBuildingSources(done) {
    const watchTemplateSources = watch([paths.siteHBSFilesGLOB, paths.siteDataGLOB], buildPages);
    watchTemplateSources.on("change", path => log("templates & helpers changed >>> " + path));
    watchTemplateSources.on("error", err => log("watch templates & helpers error: " + err));
    done();
}

exports.watchBuildingSources = watchBuildingSources;


// **************
// HTML

// html minimization: all the pages
// orverwrite the original file with the minified version

// html minification parameters
const options_htmlMin = {
    caseSensitive: true,
    collapseWhitespace: true,
    removeComments: true,
    keepClosingSlash: true,
    minifyJS: true
};

// html minification for the demo html
const minifyPages = function() {

    // set up to use base & relative path for overwriting the original file with the minified file
    const pathRelative = "./";

    return src(paths.pagesBuiltGLOB, {base: pathRelative})
    .pipe(htmlmin(options_htmlMin))
    .pipe(debug({title: "minifying:"}))
    .pipe(dest(pathRelative))
    .on("change", path => log("minification of page >>> " + path))
    .on("error", err => log("HTML minification error: " + err));
};

// html validation of the built pages
//
// html validator parameters
const options_validator = {
    "errors-only": false,
    "format": "text",
};

function validatepPagesBuilt() {
    return src([paths.pagesBuiltGLOB])
    .pipe(htmlValidator(options_validator))
    .pipe(debug({title: "validating:"}))
    .on("error", err => log("PAGE validation error:\n" + err.message))
    .on("end", () => log("PAGES validated"));
}

const validate_pages = validatepPagesBuilt;
exports.validate_site = validate_pages // alias


// **************
// SCSS/SASS
//
// compile the scss, minify it, etc.

const options_cssnano = {
    preset: ["advanced", {
        zindex: false
    }]
};

const options_autoprefix = {};

const postcss_plugins_production = [
    autoprefixer(),
    cssnano(options_cssnano),
];

const postcss_plugins_dev = [
    autoprefixer(),
];

function buildCSS(source, destination, outputfilename, options, mode) {
    console.log ("build CSS...", source, "-", mode);

    if (outputfilename === "" ) {
        outputfilename = false;
    }

    return new Promise(function(resolve, reject) {
        src(source)
        .pipe(sourcemaps.init())
        .pipe(sass(options))
        .on("error", sass.logError)
        .pipe(outputfilename ? rename({basename: outputfilename}) : noop())
        .pipe(mode === "production" ? postcss(postcss_plugins_production) : postcss(postcss_plugins_dev))
        .pipe(mode === "production" ? rename({suffix: ".min"}) : noop())
        .pipe(sourcemaps.write("./map"))
        .pipe(dest(destination))

        .on("error", () => reject("scss compilation error in: " + src))
        .on("end", () => resolve("scss compilation completed (" + mode + ")"));
    });
}

// compile the sidePanelCollapse.scss for standalone,
// and output the css files, both normal and minified, to /dist
// written as a chained promise so that this will not return UNTIL all the making is really complete
const makeTheCSS_sidePanel = function (done) {
    const scss_sidePanel_source = paths_sidePanel.scss_source;
    const scss_sidePanel_destination = paths_sidePanel.css_destination;
    const scss_sidePanel_destination_filename = sidePanel_libraryName;

    const options_scss_normal = {
        includePaths: ["/"],
        errLogToConsole: true,
        outputStyle: "expanded",
        sourceComments: true,
        indentWidth: 4,
        precision: 4,
    };

    const options_scss_production = {
        includePaths: ["/"],
        errLogToConsole: true,
        outputStyle: "expanded",
        sourceComments: false,
        indentWidth: 2,
        precision: 4,
    };

    // build css in "normal" mode
    const buildNormal = buildCSS(
        scss_sidePanel_source,
        scss_sidePanel_destination,
        scss_sidePanel_destination_filename,
        options_scss_normal,
        "normal"
    );

    // build css in "production" mode
    const buildProduction = buildCSS(
        scss_sidePanel_source,
        scss_sidePanel_destination,
        scss_sidePanel_destination_filename,
        options_scss_production,
        "production"
    );

    // wait until the files are completely built and done.
    Promise.all([buildNormal, buildProduction])
    // .then(msgs => {
    //     // msgs.forEach( msg => log(msg));
    // })
    .catch(err => {
        log(err);
    })
    .then(() => {
        done();
    });

};


// SidePanelCollapse.css for demo
// in this case, copy the /dist files to /demo
const copyCSS_sidePanel = function () {

    const source = "./dist/css/**/*";
    const destination = siteBuildDestinationRoot + "public/css/" + sidePanel_libraryName;

    return src(source)
    .pipe(debug({title: "sidepanel: "}))
    .pipe(dest(destination));
}

const compileSCSS_sidePanel = makeTheCSS_sidePanel;
exports.compileSCSS_sidePanel = makeTheCSS_sidePanel;

function makeTheCSS_site(buildMode) {

    const options_scss_demo = {
        includePaths: ["/", "src/scss"],
        errLogToConsole: true,
        outputStyle: "expanded",
        sourceComments: true,
        indentWidth: 4,
        precision: 4,
        debug: false
    };

    buildCSS(paths.scssSource, paths.cssDestination, null, options_scss_demo, buildMode)
    .then(msg => {log(msg)})
    .catch(err => {log(err)});
    // .then(() => {});
}

const compileSCSS_site = function (done) {
    makeTheCSS_site("normal");
    done();
};

const compileSCSS = parallel(compileSCSS_sidePanel, compileSCSS_site);

// watch the SidePanelCollapse scss sources
function watchSCSS_sidePanel(done) {
    // see note in watchSCSS()
    const watcherSCSS = watch(paths_sidePanel.scss_sourceGLOB, {delay: 400}, series(compileSCSS, copyCSS_sidePanel));
    watcherSCSS.on("change", path => log("changed >>> " + path));
    watcherSCSS.on("error", err => log("watch error: " + err));
    watcherSCSS.on("unlink", path => log("deleted >>> " + path));
    done();
}

exports.watchSCSS_sidePanel = watchSCSS_sidePanel;

// watch the demo-site scss sources
function watchSCSS(done) {
    // note: using the "watcher = watch" format DOES NOT IMPLEMENT the queue and delay options.
    // and there does not appear to be any documentation about using chokidir's internal throttle ability, so...
    // delay will apply to the events managed by gulp, but response will be immediate for the direct .on events
    const watcherSCSS = watch(paths.scssSourceGLOB, {delay: 400}, compileSCSS);
    watcherSCSS.on("change", path => log("changed >>> " + path));
    watcherSCSS.on("error", err => log("watch error: " + err));
    watcherSCSS.on("unlink", path => log("deleted >>> " + path));
    done();
}

exports.watchSCSS = watchSCSS;



// **************
// DEMO SITE DATA

// site building: watch the gallery data
// the gallery data is used to generate the set of page cards displayed on the index page,
// and the inter-page navigation displayed in the side nav
const watchGalleryData = function (done) {
    const watcherGallery = watch(paths.siteGalleryData, buildIndex);
    watcherGallery.on("error", err => log("watch error: " + err));
    done();
};

// **************
// JAVASCRIPT
//
// lint, assemble, compile, and etc., the javascript


// lint check files
function ESlint(source, cache) {
    return src(source)
    .pipe(cached(cache))  // named cache for persistence
    .pipe(debug({ title: "lint:" }))  // iterate out name of each file being checked
    .pipe(ESLint({ fix: false }))
    .pipe(ESLint.format());
}

function lintJS_Panini(done) {
    const source = paths.siteHBSjsFilesGLOB;
    const cacheName = "panini";
    ESlint (source, cacheName);
    done();
}

function lintJS_demo(done) {
    const source = paths.jsSourceSITEGLOB;
    const cacheName = "demo";
    ESlint (source, cacheName);
    done();
}

function lintJS_sidePanel(done) {
    const source = paths.jsSourceSITEGLOB;
    const cacheName = "SidePanel";
    ESlint (source, cacheName);
    done();
}

const lintAll = series (lintJS_Panini, lintJS_demo, lintJS_sidePanel);
exports.lintAll = lintAll;

// javascript building: global options
// babel options to transpile javascript to browser-compatible form
const options_babel = {
    "presets": [
        [ "@babel/preset-env",
            {
                "exclude": [
                    "transform-typeof-symbol"  // don't add polyfill for typeof
                ],
                "modules": false,
                "debug": false,
            }
        ]
    ],
};

const options_uglify = {
    output: {
        comments: "/^!/",  // retain comments that match this pattern
    },
    compress: {
        drop_debugger: false,
    }
};

// main site.js assembly for demo
const browserifyScript = function (file) {

    const standalone_file = "site";
    const options_bundle = {
        entries: siteSourceRoot + "js/site/" + file,  // starting file for the processing. relative to this gulpfile
        paths: [siteSourceRoot + "js/site/", siteSourceRoot + "js/site/modules/", siteSourceRoot + "js/site/pages/", sidePanelSourceRoot + "js/"],
        standalone: standalone_file,
        debug: false,
    };

    return browserify(options_bundle)
        .bundle()
        .on("error", function(err) {
            log("browserify error: " + err);
            this.emit("end");
        })
        .pipe(source(paths.browserifyDestinationFile_site))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        // begin transformation
        // add transformation tasks in the pipeline here
        .pipe(babel(options_babel))
        // .pipe(uglify())  // enable if you want to minify the demo site.js
        // end transformations
        .pipe(sourcemaps.write("./map"))
        .pipe(dest(paths.jsDestination))
        .on("end", () => log("browserify:SCRIPT complete"));
};

// browserify the site.js code
const browserifyJSDemo = function (done) {
    browserifyScript(paths.jsFile_site);
    done();
};

exports.browserifyJSDemo = browserifyJSDemo;

// SidePanelCollapse.js javascript processing
// create (conditionally) two files: verbose version and minified version
const processJavascriptSidePanel = function (options) {

    const source = options.source_path + options.source_file;
    const destination_path = options.destination_path;

    // init the stream
    let stream;

    // make the non-minified version
    if (options.normal) {
        stream = src(source)
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(babel(options_babel))
        .pipe(sourcemaps.write("./map"))
        .pipe(dest(destination_path));
    }

    // make the minified version
    if (options.minified) {
        stream = src(source)
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(babel(options_babel))
        // filter out any non-.js (e.g. the .map file) before uglification step
        // .pipe(filter("**/*.js"))
        .pipe(uglify(options_uglify))
         .on("error", function(err) {
            log("error: " + err);
            this.emit("end");
        })
       .pipe(rename({suffix: ".min"}))
       .pipe(sourcemaps.write("./map"))
       .pipe(dest(destination_path));
    }

    return stream;
};

// SidePanelCollapse.js for standalone dist/production
// build/transpile sidePanel
// then put it into the /dist directory
function scriptifySidePanel(done) {
    const options = {
        "normal": true,
        "minified": true,
        "source_path": sidePanelSourceRoot + "js/",
        "source_file": "SidePanelCollapse.js",
        "destination_path": "./dist/js/"
    };

    const build = new Promise(function(resolve, reject) {
        processJavascriptSidePanel(options)
        .on("end", () => {
            resolve();
        });

    })
    .catch(err => {log(err)})
    .then(() => {
        done();
    });
}


// SidePanelCollapse javascript for the demo site
// in this case, copy the /dist files to /demo
function copyjs_sidePanel() {

    const source = "./dist/js/**/*";
    const destination = paths.jsDestination + "/SidePanelCollapse/";

    return src(source)
    .pipe(dest(destination));
}

// copy the SidePanelCollapse production files into demo/
const demo_sidePanel = parallel(copyjs_sidePanel, copyCSS_sidePanel);
exports.demo_sidePanel = demo_sidePanel;


// process site-simple.js for demo.
// which is actually so simple that no processing is needed.
// so, this is jusy a copy task
const copyJSSimple = function (done) {
    const sources = siteSourceRoot + "js/site/" + paths.jsFile_site_simple;
    src(sources)
    .pipe(dest(paths.jsDestination));
    done();
};
exports.copyJSSimple = copyJSSimple;

const jsSite = series(browserifyJSDemo, copyJSSimple);
exports.jsSite = jsSite;

// watch the js sources
const watchJSSource = function (done) {
    const watcherJS = watch([paths.jsSourceGLOB], {delay: 400}, series(lintJS_demo, browserifyJSDemo));
    watcherJS.on("change", path => log("changed >>> " + path));
    watcherJS.on("error", err => log("watch error: " + err.message));
    done();
};

// watch the sidePanelCollapse js
// if it changes, rebuild js for /dist and /demo
const watchJSSidePanel = function (done) {
    const watcherJSSidePanel = watch(paths_sidePanel.js_sourceGLOB, series(lintJS_sidePanel, scriptifySidePanel, copyjs_sidePanel, browserifyJSDemo));
    watcherJSSidePanel.on("change", path => log("changed >>> " + path));
    watcherJSSidePanel.on("error", err => log("watch error: " + err.message));
    done();
};

exports.watchJSSite = watchJSSource;
exports.watchJSSource = watchJSSource;
exports.watchJSSidePanel = watchJSSidePanel;


// **************
// PRIMARY TASKS

// watch all the things

const watchEverything = parallel (
    watchSCSS,
    watchSCSS_sidePanel,
    watchJSSource,
    watchJSSidePanel,
    watchBuildingSources,
    watchGalleryData,
    watchIndexPageSource,
    watchAllPages,
);

exports.watchEverything = watchEverything;


// assemble the demo
exports.demo = series (
    webserver,
    siteSetup,

    compileSCSS_site,
    compileSCSS_sidePanel,
    copyCSS_sidePanel,

    jsSite,
    demo_sidePanel,
    buildPages,
);

// primary task for development/working with the source

exports.dev = series (
    webserver,
    siteSetup,

    parallel(
        compileSCSS_site,
        compileSCSS_sidePanel,
        jsSite,
        demo_sidePanel,
        buildPages,
    ),
    watchEverything,
);

const sidePanelProduction = series (
    lintJS_sidePanel,
    scriptifySidePanel,
    compileSCSS_sidePanel,
);


// build SidePanelCollapse for production
exports.production = sidePanelProduction;

// default task = demo
exports.default = exports.demo;