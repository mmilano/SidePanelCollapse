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
    "use strict";

    let value = "";  // default

    // check that options === the handlebars options object.
    // allow for arbitrary number of attributes passed
    if (!options || !options.fn) {
        options = arguments[arguments.length-1];
    }

    // in lieu of passing in the root context, get it out of the options object
    let globalContext = options.data.root;
    // in lieu of passing in the {object} site-gallery, get it out of the global context
    let siteGallery = globalContext && globalContext["site-gallery"];

    // use the existing panin helper
    let getPageData = panini.Handlebars.helpers.getPageData;

    // given the id,
    // first get the gallery data, then get the page name
    let siteGalleryData = siteGallery[pageID];
    let page = siteGalleryData["page"];

    // then, lookup the pagedata object
    value = getPageData(globalContext, page, key);

    return value;
};