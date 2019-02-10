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


module.exports = function(context, pageID, key) {
    "use strict";

    let value = "";  // default = empty

    // in lieu of passing in the {object} site-gallery, get it out of the global context that is passed in
    const siteGallery = globalContext && globalContext["site-gallery"];

    if (siteGallery[pageID] !== undefined) {
        let pageCollectionData = siteGallery[pageID];

        if (pageCollectionData[key] !== undefined) {
            value = pageCollectionData[key];
        };
    };

    return value;
};