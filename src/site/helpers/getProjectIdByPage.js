// *****
// handlebars helper
//
// given the page value, get the page ID
//
// usage:
// {{getProjectIdByPage page}}
//

// @param {string} page - the @page value, which is @page=name of the page file (without extension). this serves as the index to @page.json data, from which the "id" is extracted,
//                        and then the "id" is used as the key to the site.json data
//
// @returns {string} id - the id value from the gallery data


module.exports = function(page, options) {
    "use strict";

    let pageID = "";  // default = empty

    // check that options === the handlebars options object.
    // allow for arbitrary number of attributes passed
    if (!options || !options.fn) {
        options = arguments[arguments.length-1];
    }

    // in lieu of passing in the {object} site-gallery, get it out of the global context from the options object
    const globalContext = options.data.root;

    // in lieu of passing in the {object} site-gallery, get it out of the global context
    // let siteGallery = globalContext && globalContext["site-gallery"];

    if (globalContext[page] !== undefined) {
        // first get the page data object...
        let pageData = globalContext[page];

        if (pageData["id"] !== undefined) {
            // ...then get the page's id...
            pageID = pageData["id"];
        };
    };

    return pageID;
};