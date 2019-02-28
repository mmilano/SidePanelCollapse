/*! **********
 * Horizontal Sliding Sidebar v1.1
 * A Bootstrap 4-based sidebar using the "collapse" component to collapse horizontally instead of the default vertical),
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
// backdrop color: light or dark


// UMD (from the UMD template)
(function (window, SidePanelCollapse) {
    if (typeof define === "function" && define.amd) {
        // AMD
        define([], SidePanelCollapse);
    } else if (typeof module === "object" && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = SidePanelCollapse();
    } else {
        // Browser global (root is window)
        window.SidePanelCollapse = SidePanelCollapse();
    }
} (typeof self !== "undefined" ? self : this, function() {
    "use strict";

    // module globals
    var $sidepanel, sidepanelCloseButton;
    var settings = {};

    // simple method for reconciling/extending objects
    function extend(a, b) {
        for (var p in b) {
            if (b.hasOwnProperty(p)) {
                a[p] = b[p];
            }
        }
        return a;
    }

    // module default values
    // includes the access of the css variable values as module is evaluated (for slightly more optimal performance)
    //
    // extract and update the css transition values
    // doing this so that the duration values do not have to be repeated in the javascript,
    // and there is only one declaration (e.g. if the defaults are changed).
    // if these are defined as js values instead, the durations need to be in seconds (css transition format)
    let styles = getComputedStyle(document.querySelector(".sidepanel"));

    var defaults = {

        // css selectors:
        // default selectors for the sidepanel DOM elements
        sidepanelElement: "#sidePanel",  // top-level of the sidepanel
        sidepanelCloseElement: ".sidepanel-close",  // the close button, containing the close icon, visible when the sidepanel is displayed

        // css transition-durations:
        // default values for the sidepanel transition timings
        // in css transition-duration format. e.g.:
        //     durationShow: "1.65s",  // leisurely opening
        //     durationHide: "0.31s",   // quick to close
        //     durationHideFast: "0.11s",  // very quick to close

        durationShow: styles.getPropertyValue("--sidepanelDurationShow"),
        durationHide: styles.getPropertyValue("--sidepanelDurationHide"),
        durationHideFast: styles.getPropertyValue("--sidepanelDurationHideFast"),

        // boolean: whether or not a backdrop, or overlay, should display behind the sidepanel
        backdropEnabled: true,

        // HTML class attribute:
        // which color style of backdrop to use: "dark", or "light".
        // corresponds to the css styles (e.g. "light" -> ".light")
        backdropStyle: "light",

        // HTML class attribute:
        // class that is added to the document's <body> element when sidepanel shows, removed when it hides.
        // this is a convenience - for use in enabling any specific styles that should apply when sidepanel is open.
        sidePanelIsOpenClass: "sidepanel-shown",
    };

    // validate the configuration settings at once.
    // only validating the key selectors required for initialization of the sidepanel
    function validateSettings(_settings) {

        let isValid = true;  // presume true until proven otherwise

        // sidepanel
        // check if sidepanel exists in the page. (check length because this is a jquery selector/object).
        let _$sidepanel = $(_settings.sidepanelElement);  // convenience shorthand
        if (!_$sidepanel.length) {
            // no sidepanel ;(
            console.error("No sidepanel element could be found with the selector \""+ _settings.sidepanelElement + "\"\.");
            isValid = false;
        }

        // sidepanel close button
        // (try to) find the close button element.
        // note: assumes there is only one .sidepanel and only one close button that is within the sidepanel structure
        let _closeButton = _$sidepanel[0].querySelector(_settings.sidepanelCloseElement);
        if (!_closeButton) {
            // no close button found ;(
            console.error("No close button could be found with the selector \""+ _settings.sidepanelCloseElement + "\"\.");
            console.warn("This probably isn't what is intended‽");
            isValid = false;
        }

        return isValid;
    }


    // make one single set of settings from defaults and any options passed in on construction
    function defineSettings(defaults, options) {

        // first: start settings{} with the defaults
        let _settings = extend({}, defaults);

        // reconcile with any provided options that will supercede/overwrite defaults
        _settings = extend(_settings, options);

        // special flag for the durationShow setting because durationShow is a special case.
        // see constructor.
        if (options !== undefined && options.durationShow !== undefined) {
            _settings.durationShowCustom = true;
        }

        return _settings;
    }

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

    function linksAddListener(_$sidepanel, handler) {
        // apply a 'click' event handler to each of the links in the sidepanel
        let sidelinks = e.currentTarget.getElementsByTagName("a");
        let ln = sidelinks.length;
        for (var i = 0; i < ln; i++) {
            sidelinks[i].addEventListener("click", linkClick, false);
        };
    }

    function linksRemoveListener(_$sidepanel, handler) {
        // remove listeners on the each of the links in the sidepanel
        let sidelinks = e.currentTarget.getElementsByTagName("a");
        let ln = sidelinks.length;
        for (var i = 0; i < ln; i++) {
            sidelinks[i].removeEventListener("click", linkClick, false);
        };
    }

    // OPEN the sidepanel
    SidePanelCollapse.prototype.sidepanelOpen = function(e) {

        // event method:
        // return a function with closure as the event handler.
        // when the sidebar opening is completed, manually change the duration of transition
        // so that closing uses a custom duration.
        // this is overriding the default Bootstrap behavior, where duration is set by the css .collapsing class.
        // requires that event is on the sidenav DOM element itself.
        function whenTransitionEnds(duration) {
            let eventEnds = function (e) {
                e.target.style.transitionDuration = duration;
            };

            return eventEnds;
        }

        let _this = this;  // convenience shorthand
        let _backdrop = this.backdrop;  // convenience shorthand

        // initiate the showing if setting is truthy
        if (_backdrop) {
            _backdrop.show();
        }

        // jquery event listener to run once on the Bootstrap "is shown" event
        _this.$sidepanel.one("shown.bs.collapse", whenTransitionEnds(_this.settings.durationHide));

        // TODO
        // keyup should not try to close until the transition ends, otherwise if esc is pressed during transition, it will mess things up
        // when sidepanel is open, set keyup event handler - to catch ESC key and close sidepanel if pressed
        document.addEventListener("keyup", _this.handleKeyup.bind(_this), false);

        // add a style class to the document <body>.
        // optional - for use in enabling any specific styles
        document.body.classList.add(_this.settings.sidePanelIsOpenClass);

        // manage links in the sidepanel:
        // if sidepanel links are anchor links, then clicking link should just go to the anchor and close the sidebar.
        // if sidepanel links are to another page, then clicking link should close the navbar (more quickly) and then go to the link destination

        // TODO: how to determine if links are in-page vs to-another-page?
        // options...

        // go by page id?

        let linkClickCallback =  _this.sidepanelCloseToLink.bind(_this);

        // find all the anchor links in the sidepanel.
        // convert the jauery node to HTML node
        let sidelinks = _this.$sidepanel[0].getElementsByTagName("a");
        let ln = sidelinks.length;
        for (var i = 0; i < ln; i++) {
            sidelinks[i].addEventListener("click", linkClickCallback, false);
        };
    };

    // CLOSE the sidepanel - case: normal.
    // when link destination is an anchor within the current page.
    // presumes: invoked as event callback, with .bind() to give access the main sidepanel object
    SidePanelCollapse.prototype.sidepanelClose = function(e) {

        console.log ("close normal:", e);
        debugger;

        // event method:
        // when hiding/closing is complete, remove the transition duration override so that
        // the fallback, css-defined duration, will apply when the sidebar is shown/opened again.
        // presumes event is on the sidenav DOM element itself.
        function whenTransitionEnds(e) {
            console.log ("close normal: ended\n");
            e.target.style.transitionDuration = null;
        }

        e.preventDefault();

        let _this = this;  // convenience shorthand
        let _backdrop = this.backdrop;  // convenience shorthand

        // set a jquery event listener to run once on the Bootstrap "is hidden" event,
        // then initiate the hiding
        _this.$sidepanel.one("hidden.bs.collapse", whenTransitionEnds);
        if (_this.$sidepanel.hasClass("show")) {
            _this.hideManually();
        }
        if (_backdrop) {
            _backdrop.hide();
        }

        // cleanup: remove the keypress listener
        document.removeEventListener("keyup", _this.handleKeyup, false);

        // cleanup: remove class from the document
        document.body.classList.remove(_this.settings.sidePanelIsOpenClass);
    };

    // CLOSE the sidepanel - case: extra-fast.
    // when page is changing because sidepanel link leads to a new page,
    // close the sidenav with fast transition duration,
    // then go to link destination.
    // presumes: invoked as event callback, with .bind() to give access the main sidepanel object
    SidePanelCollapse.prototype.sidepanelCloseToLink = function(e) {

        console.log ("sidepanelCloseToLink");
        // event method:
        // send page to link destination
        function whenTransitionEnds(destination) {
            console.log ("close to link: ended");
            // window.location = destination;
        }

        e.preventDefault();

        let _this = this;  // convenience shorthand
        let _backdrop = this.backdrop;  // convenience shorthand

        if (_backdrop) {
            _backdrop.hide();
        }

        // manually change close duration to fast speed. use native DOM element from jquery object
        _this.$sidepanel[0].style.transitionDuration = _this.settings.durationHideFast;
        // set a jquery event listener to run once on the Bootstrap "is hidden" event,
        _this.$sidepanel.on("hidden.bs.collapse", whenTransitionEnds(e.target.href));
        // then initiate the hiding
        _this.hideManually();

        // cleanup: remove the keypress listener
        document.removeEventListener("keyup", _this.handleKeyup, false);
        // cleanup: remove class from the document
        document.body.classList.remove(_this.settings.sidePanelIsOpenClass);
    };


    // *****
    // Backdrop
    // creates and handles the backdrop/overlay that is displayed when the sidepanel is open
    //
    // @param: provide backdrop with access to the parent sidepanel object that is created...
    function Backdrop(_SidePanel) {

        // placeholder for the parent SidePanel object
        var SidePanel = null;

        // placeholder for the backdrop DOM element that will be created and assigned
        var backdrop = null;

        // create the backdrop HTML element
        function create(style) {
            let el = document.createElement("div");
            el.className = "backdrop" + " " + style;
            return el;
        }

        // insert the backdrop HTML element into the document DOM at bottom
        function insert(el) {
            document.body.appendChild(el);
        }

        // construction:
        // create the backdrop DOM element, cache it in the backdrop property,
        // add event to close when clicked,
        // and finally insert it into the document DOM
        this.SidePanel = _SidePanel;

        let backdropStyle = this.SidePanel.settings.backdropStyle;
        this.backdrop = create(backdropStyle);
        // bind the event function to the parent SidePanel object
        let functionToClose = this.SidePanel.sidepanelClose.bind(this.SidePanel);
        this.backdrop.addEventListener("click", functionToClose, true);
        insert(this.backdrop);
    };

    // show the backdrop element (that was already created and stored in the object)
    Backdrop.prototype.show = function() {
        let _backdrop = this.backdrop;
        _backdrop.classList.add("show", "fadein");
    };

    // hide the backdrop element
    Backdrop.prototype.hide = function() {

        // method to run when fadeout animation ends - cleans up, and hides the backdrop.
        // because event is on backdrop, event.target is the backdrop. uses backdrop from there for simplicity
        function whenAnimationEnds(e) {
            let _backdrop = e.target;
            _backdrop.classList.remove("show");
            // note: if eventlistener {once: true} is not available (browser support), then eventListener can be removed manually, e.g.:
            // _backdrop.removeEventListener("animationend", whenAnimationEnds, false);
        }

        let _backdrop = this.backdrop;
        // when the backdrop's animationend event fires, call method. only once, since the listener is added again when it displays again.
        _backdrop.addEventListener("animationend", whenAnimationEnds, {once: true}, false);
        // removing "fadein" enables and activates the default animation to fadeout
        _backdrop.classList.remove("fadein");
    };


    // constructor
    function SidePanelCollapse(options) {

        let _settings = this.settings = defineSettings(defaults, options);

        // durationShow is a special case, because it is the one duration value that is initially in the css rule
        // so if the configuration options have a custom value, the css variable needs to be updated
        if (_settings.durationShowCustom) {
            document.querySelector(".sidepanel").style.setProperty("--sidepanelDurationShow", _settings.durationShow);
        }

        // initialization of sidepanel
        // try to select and cache the sidepanel element
        let _$sidepanel = this.$sidepanel = $(_settings.sidepanelElement);  // convenience shorthand

        // check if sidepanel exists on the page. (check length because this is a jquery selector/object). if yes, then initialize
        if (_$sidepanel.length) {

            // sidepanel exists!
            // add event listener for Bootstrap collapse "show" event
            // show.bs.collapse: This event fires immediately when the show instance method is called.
            // use jquery event (and not regular javascript) because Bootstrap uses jquery-land events.
            _$sidepanel.on("show.bs.collapse", this.sidepanelOpen.bind(this));

            // (try to) select and cache the close button element.
            // note: assumes there is only one .sidepanel and only one close button that is within the sidepanel structure
            this.sidepanelCloseButton = _$sidepanel[0].querySelector(_settings.sidepanelCloseElement);
            if (this.sidepanelCloseButton) {
                this.sidepanelCloseButton.addEventListener("click", this.sidepanelClose.bind(this), false);
            } else {
                // no close button found ;(
                console.error("No close button could be found with the selector \""+ _settings.sidepanelCloseElement + "\"\.");
                console.warn("This probably isn't what is intended‽");
            }

            // if enabled, create and insert the backdrop element so it is ready to go
            this.backdrop = _settings.backdropEnabled ? new Backdrop(this) : false;

        } else {
            // no sidepanel ;(
            console.error("No sidepanel element could be found with the selector \""+ _settings.sidepanelElement + "\"\.");
            console.warn("Sidepanel was not created.");
        };

    };

    return SidePanelCollapse;
}));