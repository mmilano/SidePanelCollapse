// *****
// handlebars helper
//
// get the SHORT page name (title) from the page data
//
// usage:
// {{getPageTitleShortById pageID}}
//
// @param {string} pageID - the page id value
// *** @param options is the object that Handlebars already passes in
//
// @returns {string} the value of page title name - SHORT VALUE - from the page data

const panini = require("panini");

// which data value to get
const key = "page-title-short";

module.exports = function(pageID, options) {

    // check that options === the handlebars options object
    // allow for arbitrary number of attributes passed as arguments
    if (!options || !options.fn) {
        options = arguments[arguments.length-1];
    }

    // in lieu of passing in the root context, get it out of the options object
    const globalContext = options.data.root;

    // get the {object} site-gallery data out of the global context
    const siteGallery = globalContext && globalContext["site-gallery"];

    // given the id,
    // first have to get the name of the page
    const pageGalleryData = siteGallery[pageID];
    const page = pageGalleryData["page"];

    // then, lookup the pagedata object using the existing helper
    const getPageData = panini.Handlebars.helpers.getPageData;
    const pageDataValue = getPageData(globalContext, page, key);

    return pageDataValue;
};
