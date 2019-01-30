// site gallery data
//
// master file.
// includes all the data
// AND any processing for generated values.

var gallerySetup = (function() {

    // define the site's pages
    //
    // id:              unique id for the page

    // url:             path to the page details content file
    // page:            convenience value. just the page name, without extension. intended to match the panini {{page}} value when on the page, for cross-referencing.

    var galleryData = {

        "page-exampleA": {
            "id": "page-exampleA",
            "url": "pageA.html",
            "page": "pageA"
        },

        "page-exampleB": {
            "id": "page-exampleB",
            "url": "pageB.html",
            "page": "pageB"
        },

        "page-exampleC": {
            "id": "page-exampleC",
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