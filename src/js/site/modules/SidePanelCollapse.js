/*! **********
 * Horizontal Sliding Sidebar v1.2
 * A Bootstrap 4-based sidebar using the "collapse" component to collapse horizontally 9instead of the default vertical),
 * and allow different transition timing between the expand and the collapse transitions.
 *
 * Michel Milano
 * MIT License
 */

/* jshint latedef: nofunc */

// to invoke...
//
// values to pass in:
// sidepanel: css selector of the sidepanel in the html
// close button: css selector of the close button?
// backdrop color:  light or dark

// durations
// options = {
//     sidepanel: "#sidePanel",
//     close: ".sidepanel-close",
//     }



// UMD (from the UMD template)
(function (root, factory) {

    if (typeof define === "function" && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof module === "object" && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser global (root is window)
        root.returnExports = factory();
    }
} (typeof self !== "undefined" ? self : this, function() {
    "use strict";

    /* jshint validthis: true */


    // simple method for reconciling/extending objects
    function extend(a, b) {
        for (var p in b) {
            if (b.hasOwnProperty(p)) {
                a[p] = b[p];
            }
        }
        return a;
    }


    var defaults = {
        // default css selectors for the sidepanel DOM elements
        sidepanelElement: "#sidePanel",  // top-level of the sidepanel
        sidepanelCloseElement: ".sidepanel-close",  // the close button, containing the close icon, visible when the sidepanel is displayed

        // default values for the sidepanel transition timings
        // in css transition-duration format
        //         durationShow: "0.65s",  // leisurely opening
        //         durationHide: "0.31s",   // quick to close
        //         durationHideFast: "0.11s",  // very fast to close

        get durationShow() {
            return getComputedStyle(document.querySelector(".sidepanel")).getPropertyValue("--sidepanelDurationShow");
        },
        get durationHide() {
            return getComputedStyle(document.querySelector(".sidepanel")).getPropertyValue("--sidepanelDurationHide");
        },
        get durationHideFast() {
            return getComputedStyle(document.querySelector(".sidepanel")).getPropertyValue("--sidepanelDurationHideFast");
        },

        // boolean: whether or not a backdrop, or overlay, should display behind the sidepanel
        backdropEnabled: true,

        // which style of backdrop to use: "dark", or "light", corresponding the css style
        backdropStyle: "light",
        // class that is added to the document <body> when sidepanel shows, removed when it hides.
        // optional - for use in enabling any specific styles that should apply when sidepanel is open.
        sidePanelIsOpenClass: "sidepanel-shown",
    };

    // module globals
    var $sidepanel, sidepanelCloseButton;

//     let durationShow,
//         durationHide,
//         durationHideFast;


    // keypress handler
    // when the sidenav is displayed (open), ESC will close
    SidePanelCollapse.prototype.handleKeyup = function(e) {
        let keyID = (window.event) ? event.keyCode : e.keyCode;

        switch(keyID) {
            case 27: // 'esc'
                this.sidepanelClose(e);
                break;
        }
    };

    // manually activate the 'show' action
    SidePanelCollapse.prototype.showManually = function() {
        this.$sidepanel.collapse("show");  // invoke Bootstrap function
    };

    // manually activate the 'hide' action
    SidePanelCollapse.prototype.hideManually = function() {
        this.$sidepanel.collapse("hide");  // invoke Bootstrap function
    };


    function linksAddListener() {
        // apply a 'click' event handler to each of the links in the sidepanel
        let sidelinks = e.currentTarget.getElementsByTagName("a");
        let ln = sidelinks.length;
        for (var i = 0; i < ln; i++) {
            sidelinks[i].addEventListener("click", linkClick, false);
        };
    }

    function linksRemoveListener() {
        // cleanup and listeners on the links in sidepanel
        let sidelinks = e.currentTarget.getElementsByTagName("a");
        let ln = sidelinks.length;
        for (var i = 0; i < ln; i++) {
            sidelinks[i].removeEventListener("click", linkClick, false);
        };
    }

    // CLOSE the sidepanel - case: normal.
    // when link destination is an anchor within the current page
    SidePanelCollapse.prototype.open = function() {

        // event method:
        // when the sidebar opening is completed, manually change the duration of transition
        // so that closing uses a custom duration.
        // this is overriding the default Bootstrap behavior, where duration is set by the css .collapsing class.
        // presumes event is on the sidenav element.
        function whenShowEnds(e) {
            e.target.style.transitionDuration = durationHide;
        }

        // initiate the showing
        sidepanelBackdrop.show();

        // jquery event listener to run once on the Bootstrap "is shown" event
        $sidepanel.one("shown.bs.collapse", whenShowEnds);

        // when sidepanel is open, set keyup event handler - to catch ESC key and close sidepanel if pressed
        document.addEventListener("keyup", handleKeyup, false);

        // add a style class to the document <body>.
        // optional - for use in enabling any specific styles
        document.body.classList.add(defaults.sidePanelIsOpenClass);

        // manage links in the sidepanel:
        // if sidepanel links are anchor links, then clicking link should just go to the anchor and close the sidebar.
        // if sidepanel links are to another page, then clicking link should close the navbar (more quickly) and then go to the link destination
        let pageID = "anchorLinkPage";
        let callback = pageID === "anchorLinkPage" ? sidepanelClose : sidepanelClosePage;

        // apply a 'click' event handler to each of the links in the sidebar
        let sidelinks = e.currentTarget.getElementsByTagName("a");
        let ln = sidelinks.length;
        for (var i = 0; i < ln; i++) {
            sidelinks[i].addEventListener("click", linkClick, false);
        };
    };

    // CLOSE the sidepanel - case: normal.
    // when link destination is an anchor within the current page
    SidePanelCollapse.prototype.closeNormal = function() {

        // event method:
        // when hiding/closing is complete, remove the transition duration override so that
        // the fallback, css-defined duration, will apply when the sidebar is shown/opened again.
        function whenHideEnds(e) {
            e.target.style.transitionDuration = null;
        }

        e.preventDefault();

        if ($sidepanel.hasClass("show")) {
            this.hideManually();
        }

        // jquery event listener to run once on the Bootstrap "is hidden" event
        $sidepanel.one("hidden.bs.collapse", whenHideEnds);
        backdrop.hide();

        // cleanup: remove the keypress listener
        document.removeEventListener("keyup", handleKeyup, false);

        // remove option class from the document
        document.body.classList.remove(sidePanelIsOpenClass);

    };

    // CLOSE the sidepanel - case: extra-fast.
    // when page is changing because sidepanel link leads to a new page,
    // close the sidenav with fast transition duration,
    // then go to link destination
    SidePanelCollapse.prototype.closeToPage = function() {

        // event method:
        // send page to link destination
        function whenHideEnds(destination) {
            window.location = destination;
        }

        e.preventDefault();

        // manually change close duration to fast speed. use native DOM element from jquery object
        $sidepanel[0].style.transitionDuration = durationHideFast;


        this.hideManually();
        // jquery event listener to run once on the Bootstrap "is hidden" event
        $sidepanel.one("hidden.bs.collapse", whenHideEnds(e.target.href));
        backdrop.hide();

    };

    // backdrop
    // sidepanel's backdrop methods
    SidePanelCollapse.prototype.backdrop = {

        // placeholder for the backdrop DOM element that will be created and assigned
        backdrop: null,

        // create the backdrop DOM element, insert it into the DOM, and cache it in the backdrop property
        // add an event listener so that clicking on the backdrop will close the sidepanel
        create: function() {
            let _backdrop = document.createElement("div");
            _backdrop.className = "backdrop light";
            document.body.appendChild(_backdrop);
            _backdrop.addEventListener("click", closeNormal, true);
            this.backdrop = _backdrop;
        },

        // show the backdrop element that was already created and stored in the object
        show: function() {
            let _backdrop = this.backdrop;
            _backdrop.classList.add("show", "fadein");
        },

        // hide the backdrop
        hide: function() {
            // method to run when fadeout animation ends - cleans up, and hides the backdrop.
            // because event is on backdrop, event.target is the backdrop. uses backdrop from there for simplicity
            function whenAnimationEnds(e) {
                let _backdrop = e.target;
                _backdrop.classList.remove("show");
                // if eventlistener {once: true} will not work, then eventlistener can be removed manually
                // _backdrop.removeEventListener("animationend", whenAnimationEnds, false);
            }

            let _backdrop = this.backdrop;
            // when the backdrop's animationend event fires, call method. only once, since the listener is added again when it displays again
            _backdrop.addEventListener("animationend", whenAnimationEnds, {once: true}, false);
            // removing "fadein" enables and activates the default animation to fadeout
            _backdrop.classList.remove("fadein");
        }
    };



    //

    SidePanelCollapse.prototype.settings = {};


    // make one single set of settings from defaults and any options passed in on construction
    function configureSettings(defaults, options) {

        // first: make an object of the settings starting with the defaults
        let _settings = extend({}, defaults);

        // next: extract and update the css transition values
        // doing this so that the duration values do not have to be repeated in the javascript,
        // and there is only one declaration to change.
        // if these are defined as js values instead, the durations need to be in seconds (css transition format)

        let styles = getComputedStyle(document.querySelector(".sidepanel"));
        let _durationShow = styles.getPropertyValue("--sidepanelDurationShow");
        let _durationHide = styles.getPropertyValue("--sidepanelDurationHide");
        let _durationHideFast = styles.getPropertyValue("--sidenpanelDurationHideFast");

        _settings.durationShow = _durationShow;
        _settings.durationHide = _durationHide;
        _settings.durationHideFast = _durationHideFast;

        // last: reconcile with any provided options that will supercede defaults
        _settings = extend(_settings, options);
        debugger;
        return _settings;
    }




    function initializeSidepanel(settings) {
        console.log ("initialization");
        debugger;

        // select and cache the sidepanel element.
        this.$sidepanel = $(settings.sidepanelElement);

        // check if sidepanel exists on the page. if yes, then initialize
        if (this.$sidepanel.length) {
            debugger;
            // extract the duration values from the css variables listed within the .sidepanel rule.
            // doing this so that the duration values do not have to be repeated in the javascript,
            // and there is only one declaration to change.
            // if these are defined as js values instead, the durations need to be in seconds (css transition format)
//             durationShow = getComputedStyle($sidepanel[0]).getPropertyValue("--sidepanelDurationShow");
//             durationHide = getComputedStyle($sidepanel[0]).getPropertyValue("--sidepanelDurationHide");
//             durationHideFast = getComputedStyle($sidepanel[0]).getPropertyValue("--sidenpanelDurationHideFast");

            // add event listener for Boostrap collapse "show" event
            // show.bs.collapse: This event fires immediately when the show instance method is called.
            // use jquery event (and not regular javascript) because Bootstrap uses jquery-land events.
            $sidepanel.on("show.bs.collapse", this.open);

            // select and cache the close button element
            // note: assumes there is only one .sidepanel and only one close button
            sidepanelCloseButton = $sidepanel[0].querySelector(settings.sidepanelCloseElement);

            // set event on the close button so that click will close the sidenav
            sidepanelCloseButton.addEventListener("click", closeNormal, false);

            // create and insert the backdrop element so it is ready to go
            backdrop.create();
        } else {
            console.warn("No sidepanel element could be found with selector \"", sidepanelElement, "\.");
            console.warn("Sidepanel was not created.");
        };

    }

    // constructor
    function SidePanelCollapse(options) {

        console.log ("within SidePanelCollapse:", this);

        this.settings = configureSettings(defaults, options);
        let settings = this.settings;

        console.log ("settings: ", this.settings);
debugger;
        // try to select and cache the sidepanel element
        this.$sidepanel = $(this.settings.sidepanelElement);
        $sidepanel = this.$sidepanel;



        // check if sidepanel exists on the page. if yes, then initialize
        if ($sidepanel.length) {

            // add event listener for Boostrap collapse "show" event
            // show.bs.collapse: This event fires immediately when the show instance method is called.
            // use jquery event (and not regular javascript) because Bootstrap uses jquery-land events.
            $sidepanel.on("show.bs.collapse", this.open);

            // select and cache the close button element
            // note: assumes there is only one .sidepanel and only one close button
            sidepanelCloseButton = $sidepanel[0].querySelector(settings.sidepanelCloseElement);


        } else {
            console.warn("No sidepanel element could be found with selector \"", settings.sidepanelElement, "\.");
            console.warn("Sidepanel was not created.");
        };


debugger;

    };

    return SidePanelCollapse;

}));

