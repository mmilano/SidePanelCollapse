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

    let data = "";  // default

    // get the {object} site-gallery data out of the global context
    const siteGallery = globalContext && globalContext["site-gallery"];

    if (siteGallery[pageID] !== undefined) {
        data = siteGallery[pageID];
    };

    return data;
};
