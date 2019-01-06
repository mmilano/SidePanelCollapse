// js template
// site gallery data for handlebars
//
/* jshint esversion: 6 */  // allow es6 features

const basepath = process.cwd();

// special invocation of require
let requireNoCache = require(basepath + "/src/site/lib/invalidateRequireCacheForFile.js");

// include the canonical gallery data file
var galleryData = requireNoCache(basepath + "/src/js/site/gallery/site-gallery-canonical.js");

var galleryPages = (function() {
    return galleryData;
})();

module.exports = galleryPages;