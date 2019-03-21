// pages.js
// master array object of scripts specific to each individual page.
// one for each page in the site.
// key = pageID
//

/* jshint sub:true */                    // suppress warnings about using [] notation when it can be expressed in dot notation
/* globals SidePanelCollapse, site */    // tell jshint about global variables that are not formally defined in the particular file
/* jshint latedef: false */              // prohibits the use of a variable before it was defined

"use strict";

// utility methods
var util = {

    // utility method to check if window is larger than breakpoint
    checkWidth: function() {
        // Bootstrap values are included as css variables in the Bootstrap css.
        // get the value
        let breakpoint_size = parseInt(getComputedStyle(document.body).getPropertyValue("--breakpoint-lg"));
        if (!breakpoint_size) {
            // if no value, then the browser doesn't support css variables.
            // so use an arbitrary default value
            breakpoint_size = 42;
        };

        // get width of the current window
        let pageWidth = window.innerWidth;

        return (pageWidth > breakpoint_size ? true : false);
    },

    scrollSpyCreate: function(target, shouldSpy) {
        // if a target value is passed, use that; if not, use a default value for the primary nav
        target = target ? target : "#primaryNav";

        // check if scrollspy should activate based on the window width - in certain cases, wider window sizes
        // default to the computed active flag, whatever that is
        shouldSpy = (shouldSpy !== undefined) ? shouldSpy : util.checkWidth();

        if (shouldSpy) {
            $(document.body).scrollspy({
                target: target,
                offset: 110,
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

    checkIfDisplayed: function getDisplayStyle(el) {
        // setup closure function for the passed in element for ongoing use in page
        // return true if the element of interest IS displayed
        return function() {
            return (getComputedStyle(el).display !== "none" ? true : false );
        };
    },

};


// define page specific scripts, if any are needed.
// if not, use the default

var pages = {

    // pages script for homepage = index.html
    "index": function indexPage(pageID) {

        // handle toggling the nav & scrollspy
        function navSpy(flag) {
            if (flag) {
                // TRUE = now the horiz nav IS displayed
                // so dispose of the existing scrollspy, and create a new one for the primarynav
                util.scrollSpyToggle(navHorizontal);
                // console.log ("toggle: now display " + navHorizontal);
            } else {
                // FALSE = now the horiz nav IS NOT displayed
                // so dispose of the existing scrollspy, and create a new one for sidenav
                util.scrollSpyToggle(navVertical);
                // console.log ("toggle: now display " + navVertical);
            }
        }

        // instantiate a new side panel for the page for when/if the sidenav will display
        // options for this page
        var sidepanelOptions = {
            durationShow: "2.25s",
            durationHide: "2s",
            durationHideFast: "0.5s",
            backdropStyleClass: "dark",
        };

        // expose sidepanel as global for demo purposes
        window.sidepanel = new SidePanelCollapse(sidepanelOptions);

        // define the 2 different nav's for the page
        // the horizontal - primaryNav - displayed at very large window sizes (Bootstrap definition of large)
        // the vertical - sidePanelNav - displayed when the primary nav is collapsed at smaller window sizes
        //
        // for scrollspy, these need to be css selectors for the <nav> element on this page
        const navHorizontal = "#primaryNav";
        const navVertical = "#sidePanelNav";

        // deal with the 2 possible primary navs on the page:
        // start by checking
        // the primarynav horizontal nav that will collapse depending to screen size (= navbar-expand-*)
        let horizontalNav = document.getElementById("primaryNav-horiz");
        // is the horizontal nav being displayed (i.e. have a display value other than 'none'?)
        let horizontalNavDisplayed = util.checkIfDisplayed(horizontalNav);

        // create the scrollspy on the nav for the current state of the index page
        // pages needs to have the scrollspy work on both horizontal and vertical navs
        let navRightNow = horizontalNavDisplayed();
        let targetNav = navRightNow ? navHorizontal : navVertical;
        // initialize boolean value for determining if the nav display toggled between display states,
        // meaning the the nav changed from horiz to vertical
        let previousNavWasHoriz = navRightNow;

        // create the first scrollSpy on the currently displayed nav, and it "should spy" now.
        util.scrollSpyCreate(targetNav, true);

        // resize events will update the primaryNav behavior
        window.addEventListener("resize", function(e) {
            // check the current style.display value

            let horizontal = horizontalNavDisplayed();
            if (horizontal && !previousNavWasHoriz) {  // if: horiz nav IS true (=displayed) && previous-nav is false, then
                navSpy(true);
                previousNavWasHoriz = true;
            } else if (!horizontal && previousNavWasHoriz) {  // else if: horiz nav is NOT displayed and previous-nav is true, then
               navSpy(false);
               previousNavWasHoriz = false;
            }
        }, false);

    },

    // default page handler
    "default": function(pageID) {
        // can do something with pageID if necessary

        // instantiate a new sidepanel for the page
        // with options
        var sidepanelOptions = {
            // sidepanelElement: "#sidePanel",
            // sidepanelCloseElement: ".sidePanel-close",
            durationShow: "1.5s",
            durationHide: ".7s",
            durationHideFast: "0.2s",
            backdropStyle: "dark",
        };

        // expose sidepanel as global for demo purposes
        window.sidepanel = new SidePanelCollapse(sidepanelOptions);

        // only activate scrollspy on TOC if window is above certain size
        // this is dependent on the layout being in columns >= checked size, so that TOC will be displayed
        util.scrollSpyCreate("#tableOfContents", util.checkWidth());
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


// expose specific methods
pages.pageRouter = pageRouter;

module.exports = pages;