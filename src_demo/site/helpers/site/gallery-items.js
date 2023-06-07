// *****
// handlebars BLOCK helper module
//
// generate the gallery of pages
"use strict";

const gallery = function(globalContext, options) {

    let out = ""; // output

    // check that options = the handlebars options object.
    // allow for arbitrary number of attributes passed as arguments
    if (!options || !options.fn) {
        options = arguments[arguments.length-1];
    }

    // in lieu of passing in the {object} site-gallery, get it out of the global context that is passed in
    const siteGallery = globalContext && globalContext["site-gallery"];

    // create a parallel array of just the active page keys
    const keys = Object.keys(siteGallery);
    const pagesActive = [];
    keys.forEach(function(page) {
        if (!siteGallery[page].disable) {
           pagesActive.push(page);
        };
    });

    let pagesLength = pagesActive.length - 1;  // convert human-friendly length to be compatible with the machine-friendly index
    if (pagesLength < 1) {pagesLength = 1;};

    // generate the block element for each active page
    pagesActive.forEach(function(p) {
        const aPage = siteGallery[p];

        // render the block helper content
        let element = options.fn(aPage);
        out += element;
    });

    return out;
};

module.exports = gallery;