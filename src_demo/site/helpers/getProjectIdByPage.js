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
// @returns {string} id - the id value from the gallery data

module.exports = function(page, options) {

    let pageID = "";  // default = empty

    // check that options === the handlebars options object.
    // allow for arbitrary number of attributes passed as arguments
    if (!options || !options.fn) {
        options = arguments[arguments.length-1];
    }

    // get the globalContext out of the options data the Panini passes
    const globalContext = options.data.root;

    if (globalContext[page] !== undefined) {
        // first get the page data object...
        const pageData = globalContext[page];

        if (pageData["id"] !== undefined) {
            // ...then get the page's id...
            pageID = pageData["id"];
        };
    };

    return pageID;
};
