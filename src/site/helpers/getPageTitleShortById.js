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

module.exports = function(pageID, options) {
    "use strict";

    // which data value to get
    const key = "page-title-short";

    // check that options === the handlebars options object.
    // allow for arbitrary number of attributes passed
    if (!options || !options.fn) {
        options = arguments[arguments.length-1];
    }

    // in lieu of passing in the root context, get it out of the options object
    const globalContext = options.data.root;

    // get the {object} site-gallery data out of the global context
    const siteGallery = globalContext && globalContext["site-gallery"];

    // given the id,
    // first have to get the name of the page
    let pageGalleryData = siteGallery[pageID];
    let page = pageGalleryData["page"];

    // then, lookup the pagedata object using the existing helper
    let getPageData = panini.Handlebars.helpers.getPageData;
    let pageDataValue = getPageData(globalContext, page, key);

    return pageDataValue;
};