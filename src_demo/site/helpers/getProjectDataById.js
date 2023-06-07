// *****
// handlebars helper
//
// get a VALUE from the site-gallery data object given the page ID
//
// usage:
// {{getProjectDataById this id key}}
//
// @param {object} context - the top level context for the site. ie. "@root.this"
// @param {string} id - the id value
// @param {string} key - the key for the value to get
//
// @returns {string} the value of key from the gallery data
"use strict";

module.exports = function(globalContext, pageID, key) {

    let value = "";  // default = empty

    // get the {object} site-gallery data out of the global context
    const siteGallery = globalContext && globalContext["site-gallery"];

    if (siteGallery[pageID] !== undefined) {
        const pageCollectionData = siteGallery[pageID];

        if (pageCollectionData[key] !== undefined) {
            value = pageCollectionData[key];
        };
    };

    return value;
};