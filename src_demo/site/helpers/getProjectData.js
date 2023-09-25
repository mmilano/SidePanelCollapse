// *****
// handlebars helper
//
// get a VALUE from the site-gallery data given the page name
//
// usage:
// {{getProjectData this page key}}
//
// @param {object} globalContext - the top level context for the site. ie. "this"
// @param {string} page - the @page value, which is @page=name of the page file (without extension). this serves as the index to @page.json data, from which the "id" is extracted,
//                        and then the "id" is used as the key to the site.json data
// @param {string} key - the key for the value to get
//
// @returns {string} the value of key from the gallery data

module.exports = function(globalContext, page, key) {

    let value = "";  // default = empty

    // get the {object} site-gallery data out of the global context
    const siteGallery = globalContext && globalContext["site-gallery"];

    if (globalContext[page] !== undefined) {
        // first try to get the page data object...
        const pageData = globalContext[page];

        if (pageData["id"] !== undefined) {
            // ...then get the pages's id...
            const pageID = pageData["id"];

            if (siteGallery[pageID] !== undefined) {
                // ... then lookup the siteGallery data by the id...
                const pageCollectionData = siteGallery[pageID];

                if (pageCollectionData[key] !== undefined) {
                    // and finally, lookup the value of the key
                    value = pageCollectionData[key];
                };
            };
        };
    };

    return value;
};