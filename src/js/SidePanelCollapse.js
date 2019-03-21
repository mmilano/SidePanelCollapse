/*! **********
 * SidePanelCollapse v1.0.0
 * A Bootstrap 4-based sidebar augmenting the "collapse" component to collapse horizontally,
 * and allow variable duration timings for the transitions
 *
 * Michel Milano
 * MIT License
 */

/* jshint latedef: nofunc */
/* globals define, self, SidePanel */

// UMD template
(function(window, SidePanelCollapse) {
    if (typeof define === "function" && define.amd) {
        // AMD
        define([], SidePanelCollapse);
    } else if (typeof module === "object" && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports, like Node.
        module.exports = SidePanelCollapse();
    } else {
        // Browser global (root is window)
        window.SidePanelCollapse = SidePanelCollapse();
    }
} (typeof self !== "undefined" ? self : this, function() {
    "use strict";

    var _proto = SidePanelCollapse.prototype;  // convenience shorthand

    var data_selector = "[data-sidepanel-collapse]";  // selector for creation via data attribute

    // make one single set of settings from defaults and any options passed in on construction
    function defineSettings(defaults, options) {

        // start with the defaults
        let _settings = Object.assign({}, defaults);

        // reconcile with any provided options that will supercede/overwrite defaults
        Object.assign(_settings, options);

        // if backdrop is anything other than "true", it is false
        _settings.backdrop = (_settings.backdrop === true) ? true : false;

        // create a flag for the durationShow setting because it is a special case.
        // see SidePanelCollapse constructor.
        _settings.durationShowIsCustom = (options !== undefined && options.durationShow !== undefined) ? true : false;

        return _settings;
    }

    // default values
    // includes the access of the css variable values as module is instantiated
    let styles = getComputedStyle(document.querySelector(".sidepanel"));
    var defaults = {

        // css selectors:
        // default selectors for the sidepanel DOM elements
        sidepanelElement: "#sidePanel",  // top-level of the sidepanel
        sidepanelCloseElement: ".sidePanel-close",  // the close button, containing the close icon, visible when the sidepanel is displayed

        // extract and update the css transition values:
        // doing this so that the duration values do not have to be repeated in the javascript,
        // and there is only one declaration (e.g. if the defaults are changed).
        // if these are defined as .js values instead, the durations need to be in seconds (css transition format)
        //
        // css transition-durations:
        // default values for the sidepanel transition timings are in css transition-duration format. e.g.:
        //     durationShow: "1.65s",  // leisurely opening
        durationShow: styles.getPropertyValue("--durationShow"),
        durationHide: styles.getPropertyValue("--durationHide"),
        durationHideFast: styles.getPropertyValue("--durationHideFast"),

        // HTML class attribute:
        // class that is added to the document's <body> element when sidepanel shows, removed when it hides.
        // this is a convenience - for use in enabling any specific styles that should apply when sidepanel is open.
        sidePanelIsOpenClass: "sidepanel-open",

        // boolean:
        // whether or not a backdrop, or overlay, should display behind the sidepanel
        backdrop: true,

        // HTML class attribute:
        // which color style of backdrop to use: "dark", or "light".
        // corresponds to the css styles (e.g. "light" -> ".light")
        backdropStyleClass: "light",

        // boolean:
        // whether sidepanel should enable special behavior for <a> links in the sidepanel.
        // currently, the behavior is to intercept the link click, close the sidepanel using the HideFast duration, and then follow the link
        handleLinks: true,
    };

    // link callback:
    // when a link is clicked,
    // close the panel - fast mode.
    // then, when panel is closed, go to destination of link.
    function linkHandle() {

        function linkEvent(destination) {
            return function(e) {
                // ...if anything needs to be done with e here...
                window.location = destination;
            };
        }

        // return function with closure. used for the link eventListener
        return function(e) {
            e.preventDefault();
            this.closeType = "fast";
            // create link event handler with closure
            this.$sidepanel.one("hidden.bs.collapse", linkEvent(e.target.href));
            this.close();
        };
    }

    // determine if the sidepanel is currently transitioning or not
    // '.collapsing' is applied to the element by Bootstrap during the transition, removed when finished
    _proto.isCollapsing = function() {
        return this.$sidepanel[0].classList.contains("collapsing");
    };

    // key press handler
    // when the sidenav is displayed (open), ESC will close.
    // expects: invoked as event callback, with .bind(the main sidepanel object) (i.e. .bind(this))
    // (which is done as the default in constructor)
    _proto.handleKey = function(e) {
        let key = e.keyCode;

        switch(key) {
            case 27: // 'esc'
                this.close(e);
                break;
        }
    };

    // manually activate the 'show' action
    _proto.show = function() {
        this.$sidepanel.collapse("show");  // invoke Bootstrap action in jquery land
    };

    // manually activate the 'hide' action
    _proto.hide = function() {
        this.$sidepanel.collapse("hide");  // invoke Bootstrap action in jquery land
    };

    // OPEN the sidepanel
    // expects to be called with this = the sidepanel object (e.g. via .bind(this))
    // (which is done as the default in constructor)
    _proto.open = function(e) {

        // return a function as the event handler
        // of things to do when when the sidebar opening is completed.
        // presumes: event is on the sidepanel DOM element itself.
        function whenTransitionEnds(_this) {
            var handler = function() {};
            //var handler = function(e) {
                // no action currently
            //};
            return handler;
        }

        // if open is invoked via default bootstrap behavior, then .collapse("show") will have been invoked by bootstrap already,
        // and event will exist (e.g. click).
        // if called programmatically, e will not exist, and "show" will need to be called manually.
        // dev todo: there might be a better way to do this
        if (e === undefined) {
            this.show();
        }

        // initiate the showing of backdrop if truthy
        if (this.backdrop) {
            this.backdrop.show(this.$sidepanel);
        }

        // set keyup event handler - to catch ESC key and close sidepanel if pressed
        document.addEventListener("keyup", this.handleKey);

        // jquery event listener to run ONCE on the Bootstrap "is shown" event
        this.$sidepanel.one("shown.bs.collapse", whenTransitionEnds(this));

        // add a class to the document's <body>.
        // for potential use to enable any styles to apply only when sidepanel is open
        document.body.classList.add(this.settings.sidePanelIsOpenClass);
    };

    // CLOSE the sidepanel
    // usually invoked as event callback
    // expects to be called with this = the sidepanel object (e.g. via .bind(this))
    // (which is done as the default in constructor)
    _proto.close = function(e) {

        // event handler:
        // when hiding/closing is complete, remove the transition duration override so that
        // the fallback, css-defined duration, will apply when the sidebar is shown/opened again.
        // presumes event is on the sidenav DOM element itself.
        function whenTransitionEnds(e) {
            e.target.style.transitionDuration = null;
        }

        // check to see if collapsing is in progress.
        // if so, interrupt the normal close process, reroute via event, and exit early,
        // so that when the transition is finished, it will then go and immediately start to close
        if (this.isCollapsing() && !this.closeQueued) {
            // not already queued, so queue up to close immediately when transition has finished, and return out.
            this.closeQueued = true;
            this.closeType = "fast";
            this.$sidepanel.one("shown.bs.collapse", this.close);
            return;
        } else if (this.isCollapsing() && this.closeQueued) {
            // already queued. return early.
            return;
        }

        // start: proceed with closing actions

        // reset queued up flag
        // dev todo: find a less public way of managing this flag
        this.closeQueued = false;

        // if open is invoked via event (e.g. click the button), then event will exist.
        // if called independently, event will not exist.
        if (e !== undefined) {
            e.preventDefault();
        }

        // set a jquery event listener to run ONCE on the Bootstrap "is hidden" event,
        this.$sidepanel.one("hidden.bs.collapse", whenTransitionEnds);

        // manually set the duration so that closing transition uses a custom duration.
        // this is overriding the default behavior, where duration is set by the css .collapsing class rule, and the same
        // duration is used for both opening and closing.
        let _duration;
        switch(this.closeType) {
            // case "page":
                // dev todo: future expansion
                /* falls through */
            case "fast":
                _duration = this.settings.durationHideFast;
                this.closeType = "normal";  // reset
                break;
            default:
                // = "normal"
                _duration = this.settings.durationHide;
        }
        // access native DOM element within jquery object
        this.$sidepanel[0].style.transitionDuration = _duration;

        // initiate the hiding
        this.hide();

        // initiate the hiding of backdrop if truthy
        if (this.backdrop) {
            this.backdrop.hide();
        }

        // cleanup
        document.removeEventListener("keyup", this.handleKey);
        document.body.classList.remove(this.settings.sidePanelIsOpenClass);
    };

    // future home of method to dispose of all the sidepanel.
    // dev note: currently disabled. to be developed.
    //     _proto.dispose = function() {
    //         for (var prop in this) {
    //             this[prop] = null;
    //         }
    //     };


    // *****
    // Backdrop
    // the backdrop/overlay that is displayed when the sidepanel is open

    // show the backdrop
    // 'this' will be = Backdrop
    Backdrop.prototype.show = function() {
        this.element.classList.add("show", "fadein");
    };

    // hide the backdrop
    // 'this' will be = Backdrop
    Backdrop.prototype.hide = function() {

        // method to run when fadeout animation ends - cleans up, and hides the backdrop.
        // because event is on backdrop, event.target is the backdrop - uses backdrop from there for simplicity
        function whenAnimationEnds(e) {
            e.target.classList.remove("show");
            // note: if eventlistener {once: true} is not available (browser support), then eventListener should be removed manually, e.g.:
            // _backdrop.removeEventListener("animationend", whenAnimationEnds, true);
        }

        // when the backdrop's animationend event fires, call method. only once, since the listener is added again when it displays again.
        this.element.addEventListener("animationend", whenAnimationEnds, {once: true, passive: true});
        // remove ".fadein" to activate the default animation (fadeout)
        this.element.classList.remove("fadein");
    };

    // Backdrop constructor
    // @param: provide backdrop with access to the parent sidepanel object that is created...
    function Backdrop(_sidepanel) {

        // create the backdrop HTML element
        function create(style) {
            let el = document.createElement("div");
            el.className = "backdrop" + " " + style;
            return el;
        }

        // insert the element into the document DOM (at bottom)
        function insert(el) {
            document.body.appendChild(el);
        }

        // construction
        // create the backdrop DOM element and store it
        this.element = create(_sidepanel.settings.backdropStyleClass);

        // add backdrop to the page DOM
        insert(this.element);
    }

    // end Backdrop
    // *****

    // SidePanel constructor
    function SidePanelCollapse(options) {

        let _settings = this.settings = defineSettings(defaults, options);

        // (try to) select and store the main sidepanel element as jquery object
        let _$sidepanel = this.$sidepanel = $(_settings.sidepanelElement);

        // check if sidepanel exists on the page;
        // if not, exit early.
        // check length because this is a jquery object.
        if (!this.$sidepanel.length) {
            // no sidepanel :(
            this.$sidepanel = false;
            console.error("No SidePanel element could be found with the selector \""+ _settings.sidepanelElement + "\".");
            console.warn("SidePanel was not created.");
            return false;
        }

        // sidepanel exists!
        //
        // begin: sidepanel initialization

        // the open and close methods will be called as event listeners, and all of them need to access the correct 'this,'
        // which is troublesome with event listeners.
        // so, pre-bind them all up for convenience and sanity as the default
        this.open = this.open.bind(this);
        this.close = this.close.bind(this);
        this.handleKey = this.handleKey.bind(this);

        // durationShow is a special case, because it is the one duration value that is set initially in the css.
        // so if the configuration (options) have a custom value, then the css variable needs to be updated
        if (_settings.durationShowIsCustom) {
            this.$sidepanel[0].style.setProperty("--durationShow", _settings.durationShow);
        }

        // add event listener for Bootstrap collapse "show" event
        // - docs: https://getbootstrap.com/docs/4.3/components/collapse/#events
        // - show.bs.collapse: This event fires immediately when the show instance method is called.
        // uses jquery event (and not regular javascript) because Bootstrap uses jquery-land events.
        this.$sidepanel.on("show.bs.collapse", this.open);

        // (try to) select and cache the close button element.
        // note: assumes there is only one .sidepanel and only one close button within the sidepanel structure
        this.sidepanelCloseButton = _settings.sidepanelCloseElement ? _$sidepanel[0].querySelector(_settings.sidepanelCloseElement) : false;
        if (this.sidepanelCloseButton) {
            // add persistent event listener for action on the close element
            this.sidepanelCloseButton.addEventListener("click", this.close, false);
        } else {
            // no close button found :(
            // the sidepanel will be initialized, but maybe this isn't what is desired?
            console.warn("SidePanel: no close button could be found with the selector \""+ _settings.sidepanelCloseElement + "\".");
        }

        // if enabled, create the backdrop element and add event listener
        if (_settings.backdrop) {
            this.backdrop = new Backdrop(this);
            this.backdrop.element.addEventListener("click", this.close, true);
        } else {
            this.backdrop = null;
        }

        // flag for which close type, and therefore duration, to use: normal, or fast
        // dev todo: closeType could be kept private
        this.closeType = "normal";  // default behavior when closing the sidepanel

        // handle links:
        // find all the links in the sidepanel and add an event on them
        // in order to trap the links and implement custom behavior
        if (_settings.handleLinks) {
            let sidepanelLinks = this.$sidepanel[0].getElementsByTagName("a"), ln = sidepanelLinks.length;
            for (let i = 0; i < ln; i++) {
                sidepanelLinks[i].addEventListener("click", linkHandle().bind(this));
            };
        }

        // end: sidepanel initialization
    }

    // initialize any elements 'automatically' based on existence of the data_selector attribute on an element.
    // will create a page global "SidePanel" containing the instance(s) of the SidePanelCollapse object.
    // presumes just one, which will be SidePanel[0], but who knows - maybe there can be multiple in the future.
    function initOnData() {
        window.SidePanel = [];
        let list = document.querySelectorAll(data_selector);
        list.forEach(function(element) {
            SidePanel.push(new SidePanelCollapse(element.id));
        });
    }

    if (document.readyState === "loading") {  // loading hasn't finished yet
        document.addEventListener("DOMContentLoaded", initOnData);
    } else {  // already fired
        initOnData();
    }

    return SidePanelCollapse;
}));