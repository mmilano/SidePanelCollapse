// pages
// master array object of scripts specific to each individual page.
// one for each page in the site.
// keys = pageID
//

/* jshint sub:true */               // This option suppresses warnings about using [] notation when it can be expressed in dot notation
/* globals ImagesLoaded, site */    // global variables that are not formally defined in the source code
/* jshint latedef: false */         // This option prohibits the use of a variable before it was defined

"use strict";

// set of internal utility methods
var util = {

    checkWidth: function checkWidth() {
        // Bootstrap values are included as css variables in the Bootstrap css.
        // get the value
        let breakpoint_md = parseInt(getComputedStyle(document.body).getPropertyValue("--breakpoint-md"));
        // get width of the current window
        let pageWidth = window.innerWidth;

        if (!breakpoint_md) {
            // if no value, then the browser doesn't support css variables. e.g. IE 10.
            // so use a default value for now
            breakpoint_md = 42;
        };
        return (pageWidth > breakpoint_md ? true : false);
    },

    scrollSpyCreate: function scrollSpyCreate(target, flag) {

        // if a target value is passed, use that; if not, use the default value
        target = target ? target : "#primaryNav";

        // widthFlag to check for window width and only activate scrollspy if true = in certain cases, wider window sizes
        // default to the computed active flag, whatever that is
        var shouldSpy = (flag !== undefined) ? flag : scrollSpyShouldActivate;

        if (shouldSpy) {
            $(document.body).scrollspy ({
                target: target,
                offset: 140,
            });
        };
    },

    scrollSpyRefresh: function() {
        $(document.body).scrollspy("refresh");
    },

    scrollSpyDispose: function() {
        $(document.body).scrollspy("dispose");
    },

    scrollSpyToggle: function(target) {
        util.scrollSpyDispose();
        util.scrollSpyCreate(target);
    },

    getIfDisplayed: function getDisplayStyle(el) {
        return function() {
            // return true if the element of interest (passed in as param) IS displayed
            return (getComputedStyle(el).display !== "none" ? true : false );
        };
    },

};


// flag to only activate scrollspy if window is larger than breakpoint
// this is dependent on the layout being in columns are md size, so that nav will be displayed
let scrollSpyShouldActivate = util.checkWidth();

// define page specific scripts, if any are needed.
// if not, can use the defaultPage

var pages = {

    // pages script for homepage = index.html
    "index": function indexPage(pageID) {

        // start page setup

        // define the 2 different nav elements for the page
        const navHorizontal = "#primaryNav";
        const navVertical = "#sideNav-nav";

        // deal with the 2 possible primary navs on the page:
        // the horizontal, primarynav, displayed at wider sizes
        // the vertical, sidenav, displayed when the primary nav is collapsed at smaller screen sizes

        // start by checking
        // the primarynav horizontal element that will collapse according to screen size (css media query)
        let hnav = document.getElementById("primaryNav-horiz");
        // function: is the horizontal nav displayed (have a display value other than 'none')
        let horizNavDisplayed = util.getIfDisplayed(hnav);

        // create the scrollspy on the nav for the current state of the homepage
        // homepage: needs to have the scrollspy work on both
        // (a) the primarynav, horizontal links when window is wider,
        // (2) the sidenav, vertical list when window is narrower

        let targetNav = horizNavDisplayed() ? navHorizontal : navVertical;
        // create the first scrollSpy on the currently displayed nav, and pass true because it "should spy" now.
        util.scrollSpyCreate(targetNav, true);

        // end of page setup
        util.scrollSpyRefresh();
    },

    // default page handler
    "default": function(pageID) {
        util.scrollSpyCreate("#tableOfContents", scrollSpyShouldActivate);
    },
};

// *****
// page function
// general opening script for each page
//
// establish some of the global values for the page, and call page specific function(s)

var pageMain = function(pageID) {

    console.log ("page: ", pageID);
    // if there is page function defined, invoke that
    // if no page function defined, invoke the defaultPage function
    if (typeof site.pageMethods[pageID] !== "undefined") {
        site.pageMethods[pageID](pageID);
    } else {
        site.pageMethods.default(pageID);
    };
};


// attach/expose specific util methods for use elsewhere
pages.pageURL = util.pageURL;
pages.pageMain = pageMain;

module.exports = pages;