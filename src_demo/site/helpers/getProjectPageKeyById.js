// *****
// handlebars helper
//
// get the page key value from the page data
//
// usage:
// {{getProjectPageKeyById pageID key}}
//
// @param {string} pageID - the page id value
// @param {string} key - the page key value to get
// *** @param options is the object that Handlebars already passes in
//
// @returns {string} the value of key from the page data

const panini = require("panini");

module.exports = function(pageID, key, options) {

    // check that options === the handlebars options object.
    // allow for arbitrary number of attributes passed as arguments
    if (!options || !options.fn) {
        options = arguments[arguments.length-1];
    }

    // in lieu of passing in the root context, get it out of the options object
    const globalContext = options.data.root;

    // in lieu of passing in the {object} site-gallery, get it out of the global context
    const siteGallery = globalContext && globalContext["site-gallery"];

    // given the id,
    // first get the gallery data, then get the page name
    const siteGalleryData = siteGallery[pageID];
    const page = siteGalleryData["page"];

    // then, lookup the pagedata object
    // use the existing panini helper
    const getPageData = panini.Handlebars.helpers.getPageData;
    const value = getPageData(globalContext, page, key);

    return value;
};
