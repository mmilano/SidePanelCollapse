// TODO: may be unused

// *****
// handlebars helper
//
// get the entire page data OBJECT from the site-gallery data
//
// usage:
// {{getProjectDataObject this pageID}}
//
// @param {object} globalContext - the top level context for the site. ie. "this"
// @param {string} pageID - the page id value
//
// @returns {object} the page object from the gallery data


module.exports = function(globalContext, pageID) {
    "use strict";

    let data = "";  // default

    // in lieu of passing in the {object} site-gallery, get it out of the global context that is passed in
    let siteGallery = globalContext && globalContext["site-gallery"];

    if (siteGallery[pageID] !== undefined) {
        data = siteGallery[pageID];
    };

    return data;
};