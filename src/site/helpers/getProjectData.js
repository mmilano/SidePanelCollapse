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
    "use strict";

    let value = "";  // default = empty

    // in lieu of passing in the {object} site-gallery, get it out of the global context that is passed in
    const siteGallery = globalContext && globalContext["site-gallery"];

    if (globalContext[page] !== undefined) {
        // first try to get the page data object...
        let pageData = globalContext[page];

            if (pageData["id"] !== undefined) {
                // ...then get the pages's id...
                let pageID = pageData["id"];

                if (siteGallery[pageID] !== undefined) {
                    // ... then lookup the siteGallery data by the id...
                    let pageCollectionData = siteGallery[pageID];

                    if (pageCollectionData[key] !== undefined) {
                        // and finally, lookup the value of the key
                        value = pageCollectionData[key];
                    };
                };
            };
    };

    return value;
};