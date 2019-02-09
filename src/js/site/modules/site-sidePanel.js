/*! **********
 * Horizontal Sliding Sidebar v1.1
 * A Bootstrap 4-based sidebar using "collapse" component to collapse horizontally,
 * and allow variable transition timing for the expand and the collapse transitions
 *
 * by Michel Milano
 */

/* jshint latedef: nofunc */

var sidePanelToggle = (function() {
   "use strict";

    // css selectors for the sidepanel DOM elements
    var sidepanelElement = "#sidePanel";  // top-level of the sidepanel
    var sidepanelCloseElement = ".sidepanel-close";  // the close button, containing the close icon, visible when the sidepanel is displayed

    let $sidepanel, sidepanelCloseButton;

    let sidepanelDurationShow,
        sidepanelDurationHide,
        sidepanelDurationHideFast;

    // default values for the sidepanel transition timings
    const sidepanelDurationShow_default = "0.65s";  // leisurely opening
    const sidepanelDurationHide_default = "0.31s";   // quick to close
    const sidepanelDurationHideFast_default = "0.11s";  // very fast to close

    // keypress handler
    // when the sidenav is displayed (open), ESC will close
    function sidepanelKeyHandle(e) {
        const keyID = (window.event) ? event.keyCode : e.keyCode;

        switch(keyID) {
            case 27: // 'esc'
                sidepanelClose(e);
                break;
        }
    }

    // sidepanel backdrop and its methods
    var sidepanelBackdrop = {

        // placeholder for the backdrop DOM element that will be created and assigned
        backdrop: null,

        // create the backdrop DOM element, insert it into the DOM, and cache it in the backdrop property
        // add an event listener so that clicking on the backdrop will close the sidepanel
        create: function() {
            let _backdrop = document.createElement("div");
            _backdrop.className = "backdrop light";
            _backdrop.addEventListener("click", sidepanelClose, true);
            document.body.appendChild(_backdrop);
            this.backdrop = _backdrop;
        },

        // show the backdrop element that was already created and stored in the object
        show: function() {
            let _backdrop = this.backdrop;
            _backdrop.classList.add("show", "fadein");
        },

        // hide the backdrop
        hide: function() {

            // method to run when fadeout animation ends. receives event object, uses backdrop from that for simplicity
            function whenAnimationEnds(e) {
                let _backdrop = e.target;
                _backdrop.classList.remove("show");
                // cleanup by removing the listener
                _backdrop.removeEventListener("animationend", whenAnimationEnds, false);
            };

            let _backdrop = this.backdrop;
            // removing "fadein" enables the default animation to fadeout
            _backdrop.classList.remove("fadein");
            _backdrop.addEventListener("animationend", whenAnimationEnds, false);
        }
    };


    function sidepanelShowManually() {
        $sidepanel.collapse("show");  // invoke Bootstrap function
    }

    function sidepanelHideManually() {
        $sidepanel.collapse("hide");  // invoke Bootstrap function
    }


    // function for when a link in the sidenav is clicked
    // either:
    // the link is an anchor (within the page), or
    // the link is to another page

    function linkClick(e) {

        let target = e.target;

    }


    // CLOSE the sidepanel, case: normal.
    // when link destination is an anchor within the current page
    function sidepanelClose(e) {

        // event function:
        // when hiding/closing is complete, remove the transition duration override so that
        // the fallback, css-defined duration, will apply when the sidebar is shown/opened again.
        var whenHideEnds = function(e) {
            e.target.style.transitionDuration = null;
        };

        e.preventDefault();

        if ($sidepanel.hasClass("show")) {
            sidepanelHideManually();
        }

        // jquery event listener to run once on the Bootstrap "hidden" event
        $sidepanel.one("hidden.bs.collapse", whenHideEnds);
        sidepanelBackdrop.hide();

        // cleanup: remove the listener for keyup
        document.removeEventListener("keyup", sidepanelKeyHandle, false);

        // remove class from the document
        $(document.body).removeClass("sidenav-open");
    }

    // CLOSE the sidepanel, case: when page is changing because sidenav link leads to a new page.
    // close the sidenav with fast transition duration,
    // then go to link destination
    function sidepanelClosePage(e) {

        // event function
        function whenHideTransitionEnds(destination) {
            window.location = destination;
        }

        e.preventDefault();

        // manually change close duration to fast speed. use native DOM element from jquery object
        $sidepanel[0].style.transitionDuration = sidepanelDurationHideFast;

        // jquery event listener to run once on the Bootstrap "hidden" completion event
        $sidepanel.one("hidden.bs.collapse", whenHideTransitionEnds(e.target.href));
        sidepanelBackdrop.hide();
        sidepanelHideManually();
    }

    // do when the sidepanel OPENS
    function sidepanelOpen(e) {

        // event function:
        // when the sidebar opening is completed, manually change the duration of transition
        // so that closing uses a custom duration.
        // this is overriding the default Bootstrap behavior, where duration is set by the css .collapsing class.
        // presumes event is on the sidenav element.
        function whenShowEnds(e) {
            e.target.style.transitionDuration = sidepanelDurationHide;
        }

        // initiate the showing
        sidepanelBackdrop.show();

        // jquery event listener to run once on the Bootstrap "shown" completion event
        $sidepanel.one("shown.bs.collapse", whenShowEnds);

        // when sidepanel is open, set keyup event handler to catch ESC key (and close sidepanel if pressed)
        document.addEventListener("keyup", sidepanelKeyHandle, false);

        // add a style class to the document page.
        // optional - for use in enabling any specific styles
        $(document.body).addClass("sidenav-open");

        // if on page where sidenav links are anchor links, then links should just go to the anchor and close the sidebar.
        // if on page where sidenav links are to another page, then links should close the navbar and then go to the link destination
        let pageID = "anchorLinkPage";
        let callback = pageID === "anchorLinkPage" ? sidepanelClose : sidepanelClosePage;

        // apply a 'click' event handler to each of the links in the sidebar
        let sidelinks = e.currentTarget.getElementsByTagName("a");
        let ln = sidelinks.length;
        for (var i = 0; i < ln; i++) {
            sidelinks[i].addEventListener("click", linkClick, false);
        };
    }


    function init() {

        // extract the duration values from the css variables
        // doing this so that the duration values do not have to be repeated in the javascript,
        // and there is only one declaration to change.
        // if these are defined as js values instead, the durations need to be in seconds as css transition format
        sidepanelDurationShow = getComputedStyle($sidepanel[0]).getPropertyValue("--sidepanelDurationShow");
        sidepanelDurationHide = getComputedStyle($sidepanel[0]).getPropertyValue("--sidepanelDurationHide");
        sidepanelDurationHideFast = getComputedStyle($sidepanel[0]).getPropertyValue("--sidenpanelDurationHideFast");

        // add event listener for collapse event
        // show.bs.collapse: This event fires immediately when the show instance method is called.
        // use jquery event because BS4 uses jquery-land events.
        $sidepanel.on("show.bs.collapse", sidepanelOpen);

        // select and cache the close button element
        // sidepanelCloseButton = document.querySelector("#sideNav .sidenav-close");
        sidepanelCloseButton = $sidepanel[0].querySelector(".sidepanel-close");

        // set event on the close button so that click will close the sidenav
        sidepanelCloseButton.addEventListener("click", sidepanelClose, false);

        // create and insert the backdrop element so it is ready to go
        sidepanelBackdrop.create();
    }

    // select and cache the sidepanel element.
    // use jquery event because the events are in Bootstrap jquery-land
    $sidepanel = $(sidepanelElement);

    // check if sidepanel exists on the page. if yes, then initialize
    if ($sidepanel.length) {
        document.addEventListener("DOMContentLoaded", init, false);
    };

})();


// to invoke...
//
// values to pass in:
// css selector of the sidepanel in the html
// css selector of the close button?

//
//
// module.exports = function(options) {
//   if (!panini) {
//     panini = new Panini(options);
//     panini.loadBuiltinHelpers();
//     panini.refresh();
//     module.exports.refresh = panini.refresh.bind(panini);
//
//     // expose Handlebars to the outside
//     module.exports.Handlebars = panini.Handlebars;
//   }
//
//   // Compile pages with the above helpers
//   return panini.render();
// }
//
