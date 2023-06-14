// js data helper
// access the site gallery data and make it available for panini/handlebars
//
// data will be part of the panini global context with key = this filename ("site-gallery")

const basepath = process.cwd();

// include the canonical subpage/gallery data file
const galleryData = require(basepath + "/src_demo/js/site/gallery/site-gallery-data.js");

module.exports = galleryData;
