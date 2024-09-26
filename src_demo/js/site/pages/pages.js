// pages.js
//
// master object of scripts specific to each individual page.
// one for each page in the site.
// key = pageID
//

/* global SidePanelCollapse, bootstrap */
"use strict";

console.log ("the pages.js file");
// establish the breakpoint size
// Bootstrap values are included as css variables in the Bootstrap css.
// get the value

let breakpoint = parseInt(getComputedStyle(document.body).getPropertyValue("--bs-breakpoint-lg"));
if (!breakpoint) {
    // if no value, then the css variables arent available (no browser support? didnt load?)
    // so use an arbitrary default value.
    breakpoint = 42; // arbitrary breakpoint size value in px.
};
console.log ("the pages.js file:", breakpoint);

/**
 * layout constant
 * Pixels to offset from top when calculating position of scroll.
 * used for Bootstrap scrollSpy
 * "offset" is deprecated in Bootstrap 5; see scrollRootMargin
 * @const
 */
const scrollOffset = 110;

/**
 * deriving from scrollOffset,
 * convert the offset to rootMargin for Bootstrap 5 scrollSpy
 * borrowing the scrollSpy source values for the conversion
 * @const
 */
const scrollRootMargin = `${scrollOffset}px 0px -30% 0px`;


// utility methods
const siteMethods = {
    scrollSpyInstance: () => {},

    // utility method to check if window is larger than breakpoint
    checkWidth: function() {

        // get width of the current window
        const pageWidth = window.innerWidth;
        return pageWidth > breakpoint ? true : false;
    },

    scrollSpyCreate: function(target, shouldSpy) {
        // if a target value is passed, use that; if not, use a default value for the primary nav
        const scrollTarget = target ? target : "#primaryNav";

        // check if scrollspy should activate based on the window width
        shouldSpy = (shouldSpy !== undefined) ? shouldSpy : this.checkWidth();

        // placeholder
        // let scrollSpy = {
        //     refresh: () => {},
        //     dispose: () => {},
        // };
        let scrollSpy;

        if (shouldSpy) {
            scrollSpy = new bootstrap.ScrollSpy(document.body, {
                target: scrollTarget,
                // offset: scrollOffset,
                rootMargin: scrollRootMargin,
            });
        };

        // store the scollspy for usage
        this.scrollSpyInstance = scrollSpy;
    },



    scrollSpyRefresh: function() {
        // bootstrap.ScrollSpy.getInstance(dataSpyEl).refresh();
        if (this.scrollSpyInstance) {
            this.scrollSpyInstance.refresh();
        }
    },

    scrollSpyDispose: function() {
        if (this.scrollSpyInstance) {
            this.scrollSpyInstance.dispose();
        }
    },

    scrollSpyToggle: function(target) {
        this.scrollSpyDispose();
        this.scrollSpyCreate(target);
    },

    // create a function
    // return true if the element of interest IS displayed
    checkIfDisplayed: function getComputedDisplayStatus(el) {
        return () => (getComputedStyle(el).display !== "none" ? true : false);
    },
};

// define page specific scripts, if any are desired/needed.
// if there is no specific, default will be used
const pageMethods = {

    // pages script for homepage (= index.html)
    index: function indexPageMethod() {

        // handle toggling the nav & scrollspy
        function navSpy(flag) {
            if (flag) {
                // TRUE = now the horiz nav IS displayed
                // so dispose of the existing scrollspy, and create a new one for the primary-nav
                siteMethods.scrollSpyToggle(navHorizontal);
            } else {
                // FALSE = now the horiz nav IS NOT displayed
                // so dispose of the existing scrollspy, and create a new one for side-nav
                siteMethods.scrollSpyToggle(navVertical);
            }
        }

        // SidePanelCollapse options for this page
        const sidePanelOptions = {
            durationShow: "1.77s",
            durationHide: "1s",
            durationHideFast: "0.4s",
            backdropStyleClass: "dark",
        };

        // instantiate a new side panel for the page for when/if the side-nav will display
        // expose sidePanel as global for demo purposes
        window.SidePanelInstance = new SidePanelCollapse(sidePanelOptions);

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
        const horizontalNav = document.getElementById("primaryNav-horiz");
        // is the horizontal nav being displayed (i.e. have a display value other than 'none'?)
        const horizontalNavDisplayed = siteMethods.checkIfDisplayed(horizontalNav);
        const horizontalNavIsDisplayed = horizontalNavDisplayed();

        // create the scrollspy on the nav for the current state of the index page
        // pages needs to have the scrollspy work on both horizontal and vertical navs
        const targetNav = horizontalNavIsDisplayed ? navHorizontal : navVertical;

        // initialize boolean value for determining if the nav display toggled between display states,
        // meaning the the nav changed from horiz to vertical
        let previousNavWasHoriz = horizontalNavIsDisplayed;

        // create scrollSpy on the currently displayed nav, and it "should spy" now.
        siteMethods.scrollSpyCreate(targetNav, true);

        // on resize events: update the primaryNav behavior
        window.addEventListener("resize", () => {
            // check the current style.display value
            const horizontalNavIsDisplayed = horizontalNavDisplayed();
            if (horizontalNavIsDisplayed && !previousNavWasHoriz) {
                // if: horiz nav IS true (=displayed) && previous-nav is false, then
                navSpy(true);
                previousNavWasHoriz = true;
            } else if (!horizontalNavIsDisplayed && previousNavWasHoriz) {
                // else if: horiz nav is false (=NOT displayed) && previous-nav is true, then
                navSpy(false);
                previousNavWasHoriz = false;
            }
        }, false);
    },

    // default page handler
    default: function (pageID) {
        // ...can do something with pageID if desired
        // console.log ("page: ", pageID);

        // SidePanelCollapse options for these pages (note: different from index)
        const sidePanelOptions = {
            durationShow: "1.95s",
            durationHide: "0.7s",
            durationHideFast: "0.19s",
            backdropStyle: "dark",
        };

        // instantiate a new SidePanelCollapse for the page
        // expose sidePanel as global for demo purposes
        window.sidePanel = new SidePanelCollapse(sidePanelOptions);

        // only activate scrollspy on TOC if window is above certain size
        // this is dependent on the layout being in columns >= checked size, so that TOC will be displayed
        console.log ("only activate scrollspy");
        siteMethods.scrollSpyCreate("#tableOfContents", siteMethods.checkWidth());
    },
};

// *****
// page function
// general opening script for each page
//
// establish any global values for the page, and call page specific function(s)

const pageRouter = function(pageID) {
    // page name/info for debugging
    console.log ("page: ", pageID);
    // if there is page=specific function defined, invoke that
    // if no page function defined, invoke the default
    if (typeof pageMethods[pageID] !== "undefined") {
        pageMethods[pageID](pageID);
    } else {
        pageMethods.default(pageID);
    };

};

// expose specific methods
module.exports = {
    pageMethods: pageMethods,
    pageRouter: pageRouter,
};
