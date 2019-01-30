// **********
// script for site pages
//
// initialize and control the sidenav

/*jslint latedef:false*/

var sideNavCollapse = (function() {
   "use strict";

    let $sidepanel, sidepanelCloseButton;

    let sidenavDurationShow,
        sidenavDurationHide,
        sidenavDurationHideFast;

    // local keypress handler
    // when the sidenav is displayed (open), ESC will close
    function sidepanelKeyHandle(e) {
        let keyID = (window.event) ? event.keyCode : e.keyCode;

        switch(keyID) {
            case 27: // handle 'esc'
                sidepanelClose(e);
                break;
        };
    }

    function sidepanelShowManually() {
        $sidepanel.collapse("show");    // Bootstrap4 function
    }
    function sidepanelHideManually() {
        $sidepanel.collapse("hide");    // Bootstrap4 function
    }

    // backdrop and methods for the sidepanel
    var sidepanelBackdrop = {

        // placeholder for the backdrop DOM element that will be created and assigned
        backdrop: null,

        // create the backdrop DOM element and store it in the backdrop property
        create: function() {
            let _backdrop = document.createElement("div");
            _backdrop.className = "backdrop light";
            _backdrop.addEventListener("click", sidepanelClose);
            document.body.appendChild(_backdrop);
            this.backdrop = _backdrop;
        },

        // show the backdrop element (that was already created and stored in the object)
        show: function() {
            let _backdrop = this.backdrop;
            _backdrop.classList.add("show", "fadein");
        },

        // hide the backdrop element (that was already created and stored in the object)
        hide: function() {

            // to run when fadeout animation ends. receives event object.
            var whenFadeEnds = function(e) {
                let _backdrop = e.target;
                _backdrop.classList.remove("show");
                // cleanup by removing the listener
                _backdrop.removeEventListener("animationend", whenFadeEnds, false);
            };

            let _backdrop = this.backdrop;
            // removing "fadein" should trigger the default animation to fadeout
            _backdrop.classList.remove("fadein");
            _backdrop.addEventListener("animationend", whenFadeEnds, false);
        }
    };

    // function for when a link in the sidenav is clicked
    // either:
    // the link is an anchor (within the page), or
    // the link is to another page

    function linkClick(e) {

        let target = e.target;

    }


    // CLOSE the sidepanel, normal
    // when link destination is an anchor within the current page
    function sidepanelClose(e) {

        // event function:
        // when hiding/closing is complete, remove the transition duration override so that
        // the fallback, css-defined duration will apply when the sidebar is shown/opened again.
        var whenHideEnds = function(e) {
            e.target.style.transitionDuration = null;
        };

        e.preventDefault();

        if ($sidepanel.hasClass("show")) {
            sidepanelHideManually();
        };

        sidepanelBackdrop.hide();

        // jquery event listener to run once on the Bootstrap4 "hidden" completion event
        $sidepanel.one("hidden.bs.collapse", whenHideEnds);

        // remove the listener for key up
        document.removeEventListener("keyup", sidepanelKeyHandle, false);

        // remove a style class from the document page
        $(document.body).removeClass("sidenav-open");
    }

    // CLOSE the sidepanel, when page is changing
    // close the sidenav with fast transition duration
    // then go to link destination
    function sidepanelClosePage(e) {

        // event function
        var whenHideTransitionEnds = function(destination) {
            window.location = destination;
        };

        e.preventDefault();

        // manually change close duration to fast speed. use native DOM element from jquery object
        $sidepanel[0].style.transitionDuration = sidenavDurationHideFast;

        // jquery event listener to run once on the BS4 "hidden" completion event
        $sidepanel.one("hidden.bs.collapse", whenHideTransitionEnds(e.target.href));
        sidepanelBackdrop.hide();
        sidepanelHideManually();
    }

    // do when the sidepanel OPENS
    function sidepanelOpen(e) {

        // event function:
        // when the sidebar opening is completed, manually change the duration of transition
        // so that closing is a different duration.
        // this is overriding the default BS4 behavior, where duration is set by the css .collapsing class.
        // presumes event is on the sidenav element
        var whenShowEnds = function(e) {
            e.target.style.transitionDuration = sidenavDurationHide;
        };

        // initiate the showing
        sidepanelBackdrop.show();

        // jquery event listener to run once on the BS4 "shown" completion event
        $sidepanel.one("shown.bs.collapse", whenShowEnds);

        // when sidepanel is open, set keyup event handler to catch ESC key and close sidepanel if pressed
        document.addEventListener("keyup", sidepanelKeyHandle, false);

        // add a style class to the document page.
        // optional, for use in enabling any specific styles
        $(document.body).addClass("sidenav-open");

        // if on page where sidenav links are anchor links, then links should just go to the anchor and close the sidebar.
        // if on page where sidenav links are to another page, then links should close the navbar and then go to the link destination
        let pageID = "anchorLinkPage";
        let callback = pageID === "anchorLinkPage" ? sidepanelClose : sidepanelClosePage;

        // apply a click event handler to each of the links in the sidebar
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
        sidenavDurationShow = getComputedStyle($sidepanel[0]).getPropertyValue("--sidenavDurationShow");
        sidenavDurationHide = getComputedStyle($sidepanel[0]).getPropertyValue("--sidenavDurationHide");
        sidenavDurationHideFast = getComputedStyle($sidepanel[0]).getPropertyValue("--sidenavDurationHideFast");

        // add event listener for collapse event
        // show.bs.collapse: This event fires immediately when the show instance method is called.
        // use jquery event because BS4 uses jquery-land events.
        $sidepanel.on("show.bs.collapse", sidepanelOpen);

        // select the close button element, and add event so that sidepnel closes when clicked
        sidepanelCloseButton = document.querySelector("#sideNav .sidenav-close");
        // set event on the close button so that click will close the sidenav
        sidepanelCloseButton.addEventListener("click", sidepanelClose, false);

        // create and insert the backdrop element so it is ready to go
        sidepanelBackdrop.create();
    }

    // select and cache the sidepanel and close icon.
    // use jquery event because BS4 uses jquery-land events, and the events are in BS4 jquery-land
    $sidepanel = $("#sideNav");

    // check if sidepanel exists on the page. if yes, then initialize
    if ($sidepanel.length) {
        document.addEventListener("DOMContentLoaded", init, false);
    };

})();