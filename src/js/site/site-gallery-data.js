// js template
// site gallery data for site.js
//
// sets up the gallery pages data.

let galleryData = require("gallery/site-gallery-canonical.js");

var galleryPages = (function() {
    let galleryDataSITE = galleryData;

    // do anything to the data here

    return galleryDataSITE;
})();

module.exports = galleryPages;