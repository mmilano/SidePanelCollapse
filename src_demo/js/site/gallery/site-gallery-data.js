// site 'gallery of pages' data
//
// master file.
// includes all the data
// AND any processing for generated values.

const gallerySetup = (function() {

    // define the site's pages
    //
    // each page has its own object of data
    // the page key = the page id
    //
    // object data:
    // id:              unique id for the page
    // url:             name of the page's content file
    // page:            convenience value. just the page name, without extension. intended to match the panini {{page}} value when on the page, for cross-referencing.

    const galleryData = {

        "page-a": {
            "id": "page-a",
            "url": "page-a.html",
            "page": "page-a"
        },

        "page-b": {
            "id": "page-b",
            "url": "page-b.html",
            "page": "page-b"
        },

        "page-c": {
            "id": "page-c",
            "url": "page-c.html",
            "page": "page-c"
        },
    };

    // **********
    // BEGIN:
    // any processing of the gallery data
        // nothing for the demo
    // END
    // **********

    return galleryData;
})();

module.exports = gallerySetup;