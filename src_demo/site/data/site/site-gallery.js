// js template
// site gallery data for panini/handlebars
//
/* jshint esversion: 6 */  // allow es6 features

const basepath = process.cwd();

// special invocation of require
const requireNoCache = require(basepath + "/src_demo/site/lib/invalidateRequireCacheForFile.js");

// include the canonical subpage/gallery data file
let galleryData = requireNoCache(basepath + "/src_demo/js/site/gallery/site-gallery-data.js");

module.exports = galleryData;
