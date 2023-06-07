// *****
// handlebars helper
//
// get a VALUE from the page data
//
// usage:
// {{getPageData this page key}}
//
// @param {object} globalContext - the top level context for the pages
// @param {string} page - the @page value, which is @page. this serves as the index to @page.json data, from which the key's value is extracted.
// @param {string} key - the key for the value to get
//
// @returns {string/object} the value of key from the individual page data
"use strict";

module.exports = function(globalContext, page, key) {

    let value = "";  // default value

    if (globalContext[page] !== undefined) {
        let pageData = globalContext[page];

        if (pageData[key] !== undefined) {
            value = pageData[key];
        };
    };

    return value;
};