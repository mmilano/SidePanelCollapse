// pages.js
// master array object of scripts specific to each individual page.
// one for each page in the site.
// key = pageID
//

/* jshint sub:true */               // suppress warnings about using [] notation when it can be expressed in dot notation
/* globals SidePanelCollapse, site */                  // global variables that are not formally defined in the source code
/* jshint latedef: false */         // prohibits the use of a variable before it was defined

"use strict";

// define page specific scripts, if any are needed.
// if not, use the default

var pages = {

    // default page handler
    "default": function(pageID) {
        // initialize the sidepanel

        // instantiate a new sidepanel for the page
        // sidepanel options for this site
        var sidepanelOptions = {
            sidepanelElement: "#sidePanel",
            sidepanelCloseElement: ".sidepanel-close",
        };

        var sidepanel = new SidePanelCollapse(sidepanelOptions);
    },
};

// *****
// page function
// general opening script for each page
//
// establish some of the global values for the page, and call page specific function(s)

var pageRouter = function(pageID) {

    console.log ("page: ", pageID);
    // if there is page function defined, invoke that
    // if no page function defined, invoke the default
    if (typeof site.pageMethods[pageID] !== "undefined") {
        site.pageMethods[pageID](pageID);
    } else {
        site.pageMethods.default(pageID);
    };
};


// attach/expose specific methods
pages.pageRouter = pageRouter;

module.exports = pages;