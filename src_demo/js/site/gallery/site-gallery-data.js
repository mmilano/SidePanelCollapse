// site 'gallery of pages' data
//
// master file.
// includes all the data
// AND any processing for generated values.

var gallerySetup = (function() {

    // define the site's pages
    //
    // each page has its own object of data
    // the page key = the page id
    //
    // object data:
    // id:              unique id for the page
    // url:             name of the page's content file
    // page:            convenience value. just the page name, without extension. intended to match the panini {{page}} value when on the page, for cross-referencing.

    var galleryData = {

        "pageA": {
            "id": "pageA",
            "url": "pageA.html",
            "page": "pageA"
        },

        "pageB": {
            "id": "pageB",
            "url": "pageB.html",
            "page": "pageB"
        },

        "pageC": {
            "id": "pageC",
            "url": "pageC.html",
            "page": "pageC"
        },
    };

    // **********
    // BEGIN:
    // any processing of the gallery data

    // END
    // **********

    return galleryData;
})();

module.exports = gallerySetup;