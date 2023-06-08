// js data helper
// access the site gallery data and make it available for panini/handlebars
//
// data will be part of the panini global context with key = this filename ("site-gallery")

const basepath = process.cwd();

// special invocation of require
const requireNoCache = require(basepath + "/src_demo/site/lib/invalidateRequireCacheForFile.js");

// include the canonical subpage/gallery data file
const galleryData = requireNoCache(basepath + "/src_demo/js/site/gallery/site-gallery-data.js");

module.exports = galleryData;
