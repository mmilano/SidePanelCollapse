/*! **********
 * SidePanelCollapse v1.3.2
 * A Bootstrap 4-based sidebar augmenting the "collapse" component to collapse horizontally,
 * and allow variable duration timings for the transitions
 *
 * Michel Milano
 * MIT License
 */

/* jshint latedef: nofunc */
/* globals define, self, SidePanel */

// UMD template
(function (window, SidePanelCollapse) {
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

    /**
     * convenience shorthand
     * @const
     */
    const _proto = SidePanelCollapse.prototype;

    /**
     * default selector for creation via data attribute
     * @const
     */
    const data_selector = "[data-sidepanel-collapse]";

    /**
     * default value
     * check and cache if there is no sidePanel in the page so that error is not thrown
     * @const
     */
    const el = document.querySelector(".sidePanel");

     /**
     * default value
     * access the css variable values as module is instantiated
     * @const
     */
    const styles = el ? getComputedStyle(el) : "";

    /**
    * sidePanel default settings
    * @const
    * @property {string} sidePanelElement - top-level element of the side-panel. CSS format
    * @property {string} sidePanelCloseElement - close button element. CSS format
    * @property {string} sidePanelIsOpenClass - class to apply when panel is open. CSS format
    * @property {string} durationShow - duration for the opening transition. CSS format
    * @property {string} durationHide - duration for the standard closing transition.. CSS format
    * @property {string} durationHideFast - duration for FAST closing transition. CSS format
    * @property {boolean} backdrop - whether or not backdrop is to be used
    * @property {string} backdropStyleClass - Which style of backdrop to use, corresponding to a CSS class style. Built-in classes are "light" or "dark".
    * @property {boolean} handleLinks - whether or not links are to be processed
    */

    const defaults = {
        // css selectors:
        // default selectors for the sidePanel DOM elements
        sidePanelElement: "#sidePanel", // top-level of the side-panel element in the DOM. CSS format
        sidePanelCloseElement: ".sidePanel-close", // the close button, containing the close icon, visible when the sidePanel is displayed. CSS format.

        // HTML class attribute:
        // class that is added to the document's <body> element when sidePanel shows, removed when it hides.
        // this is a convenience - for use in enabling any specific styles that should apply when sidePanel is open.
        sidePanelIsOpenClass: "sidePanel-open", // javascript format

        // extract and update the css transition values:
        // doing this so that the duration values do not have to be repeated in the javascript,
        // and there is only one declaration (e.g. if the defaults are changed).
        // if these are defined as .js values instead, the durations need to be in seconds (css transition format)
        //
        // css transition-durations:
        // default values for the sidePanel transition timings are in css transition-duration format. e.g.:
        //     durationShow: "1.65s",  // leisurely opening
        durationShow: styles.getPropertyValue("--durationShow"),
        durationHide: styles.getPropertyValue("--durationHide"),
        durationHideFast: styles.getPropertyValue("--durationHideFast"),

        // boolean:
        // whether or not a backdrop, or overlay, should display behind the sidePanel
        backdrop: true,

        // HTML class attribute:
        // which color style of backdrop to use: "dark", or "light".
        // corresponds to the css styles (e.g. "light" -> ".light")
        backdropStyleClass: "light",  // javascript format

        // boolean:
        // whether sidePanel should enable special behavior for <a> links in the sidePanel content.
        // currently, the behavior is to intercept the link click, close the sidePanel using the HideFast duration, and then follow the link
        handleLinks: true,
    };

    /**
     * link callback:
     * when a link is clicked,
     * close the panel - fast mode.
     * then, when panel is closed, go to destination of link.
     * @returns {Function} event handler
     */
    function linkHandle() {
        function linkEvent(destination) {
            return function (e) {
                // ...if anything needs to be done with e here...
                window.location = destination;
            };
        }

        // return function. used for the link eventListener
        return function (e) {
            e.preventDefault();
            this.closeType = "fast";
            // create link event handler with closure
            this.$sidePanel.one("hidden.bs.collapse", linkEvent(e.target.href));
            this.close();
        };
    }

    // determine if the sidepanel is currently transitioning or not
    // '.collapsing' is applied to the element by Bootstrap during the transition, removed when finished
    _proto.isCollapsing = function () {
        return this.$sidePanel[0].classList.contains("collapsing");
    };

    // key press handler
    // when the sidenav is displayed (open), ESC will close.
    // expects: invoked as event callback, with .bind(the main sidepanel object) (i.e. .bind(this))
    // (which is done as the default in constructor)
    _proto.handleKey = function (e) {
        let key = e.keyCode;

        switch (key) {
            case 27: // 'esc'
                this.close(e);
                break;
        }
    };

    // manually activate the 'show' action
    _proto.show = function () {
        this.$sidePanel.collapse("show"); // invoke Bootstrap action in jquery land
    };

    // manually activate the 'hide' action
    _proto.hide = function () {
        this.$sidePanel.collapse("hide"); // invoke Bootstrap action in jquery land
    };

    // OPEN the sidepanel
    // expects to be called with this = the sidepanel object (e.g. via .bind(this))
    // (which is done as the default in constructor)
    _proto.open = function (e) {
        // return a function as the event handler
        // of things to do when when the sidebar opening is completed.
        // presumes: event is on the sidepanel DOM element itself.
        function whenTransitionEnds(_this) {
            // no action currently
            // let handler = function (e) {};
            return (() => {});
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
            this.backdrop.show(this.$sidePanel);
        }

        // set keyup event handler - to catch ESC key and close sidePanel if pressed
        document.addEventListener("keyup", this.handleKey);

        // jquery event listener to run ONCE on the Bootstrap "is shown" event
        this.$sidePanel.one("shown.bs.collapse", whenTransitionEnds(this));

        // add a class to the document's <body>.
        // for potential use to enable any styles to apply only when sidepanel is open
        document.body.classList.add(this.settings.sidePanelIsOpenClass);
    };

    // CLOSE the sidepanel
    // usually invoked as event callback
    // expects to be called with this = the sidepanel object (e.g. via .bind(this))
    // (which is done as the default in constructor)
    _proto.close = function (e) {
        // event handler:
        // when hiding/closing is complete, remove the transition duration override so that
        // the fallback, css-defined duration, will apply when the sidebar is shown/opened again.
        // presumes event is on the sidenav DOM element itself.
        const whenTransitionEnds = (e) => {
            e.target.style.transitionDuration = null;
        };

        // check to see if collapsing is in progress.
        // if so, interrupt the normal close process, reroute via event, and exit early,
        // so that when the transition is finished, it will then go and immediately start to close
        if (this.isCollapsing() && !this.closeQueued) {
            // not already queued, so queue up to close immediately when transition has finished, and return out.
            this.closeQueued = true;
            this.closeType = "fast";
            this.$sidePanel.one("shown.bs.collapse", this.close);
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
        this.$sidePanel.one("hidden.bs.collapse", whenTransitionEnds);

        // manually set the duration so that closing transition uses a custom duration.
        // this is overriding the default behavior, where duration is set by the css .collapsing class rule, and the same
        // duration is used for both opening and closing.
        let _duration;
        switch (this.closeType) {
            // case "page":
            // dev todo: future expansion
            /* falls through */
            case "fast":
                _duration = this.settings.durationHideFast;
                this.closeType = "normal"; // reset
                break;
            default:
                // = "normal"
                _duration = this.settings.durationHide;
        }
        // access native DOM element within jquery object
        this.$sidePanel[0].style.transitionDuration = _duration;

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
    // = the backdrop/overlay that is displayed when the sidepanel is open

    /**
     * backdrop: show the backdrop
     * 'this' will be = Backdrop
     */
    Backdrop.prototype.show = function () {
        this.element.classList.add("show", "fadein");
    };

    /**
     * backdrop: hide the backdrop
     * 'this' will be = Backdrop
     */
    Backdrop.prototype.hide = function () {
        /**
         * method to run when fadeout animation ends - cleans up, and hides the backdrop.
         * because event is on backdrop, event.target is the backdrop - uses backdrop from there for simplicity
         * @param {*} e event
         */
        const whenAnimationEnds = (e) => {
            e.target.classList.remove("show");
        };

        // when the backdrop's animationend event fires, call method. only once, since the listener is added again when it displays again.
        this.element.addEventListener("animationend", whenAnimationEnds, {once: true, passive: true});
        // remove ".fadein" to activate the default animation (fadeout)
        this.element.classList.remove("fadein");
    };

    // Backdrop constructor
    // @param: provide backdrop with access to the parent sidePanel object that is created...
    function Backdrop(_sidePanel) {
        // create the backdrop HTML element
        const create = (styleClass) => {
            let el = document.createElement("div");
            el.className = "sidePanel-backdrop" + " " + styleClass;
            return el;
        };

        // construction
        // create the backdrop DOM element and store it
        this.element = create(_sidePanel.settings.backdropStyleClass);

        // add backdrop to the document DOM (at bottom)
        document.body.appendChild(this.element);
    }

    // end Backdrop
    // *****

    /**
     * SidePanel constructor
     * @param {Object} options custom settings that can be passed to the instance
     * @returns
     */
    function SidePanelCollapse(options) {

        /**
         * internal method
         * make one single set of settings from defaults and any options passed in on construction
         * @param {Object} defaults defaults settings
         * @param {*} options any custom settings
         * @returns {Object} settings
         */
        function defineSettings(defaults, options) {
            // start with the defaults
            let settings = Object.assign({}, defaults);
            // reconcile with any provided options that will supercede/overwrite defaults
            Object.assign(settings, options);

            // if backdrop is anything other than "true", it is false
            settings.backdrop = settings.backdrop === true ? true : false;

            // create a flag for the durationShow setting because it is a special case.
            // see SidePanelCollapse constructor.
            settings.durationShowIsCustom = options !== undefined && options.durationShow !== undefined ? true : false;

            return settings;
        }

        /**
         * options passed in can be
         * either
         * empty: use the defaults,
         * or
         * string: the HTML ID of the sidepanel element
         * or
         * object: an object of multiple custom properties to use as override settings
         */

        // if string, then convert it to an object so that settings work
        if (typeof options === "string") {
             // string will be a the element's identifier in javascript format, not css format.
             // construct css format
            options = {sidepanelElement: "#" + options};
        }

        // create settings
        // and cache in temp variable for easier management
        const _settings = (this.settings = defineSettings(defaults, options));

        // (try to) select and store the main sidepanel element
        // as jquery object
        const _$sidePanel = (this.$sidePanel = $(_settings.sidePanelElement));

        // check if sidepanel exists on the page and was selected.
        // if not, exit early.
        // check length because it is a jquery object; element will be [0]
        if (!this.$sidePanel.length) {
            // no sidepanel :(
            this.$sidePanel = false;
            console.error('No SidePanel element could be found with the selector "' + _settings.sidepanelElement + '".');
            console.warn("SidePanel was not created.");
            return false;
        }

        // sidePanel exists!
        //
        // begin: sidePanel initialization

        // the open and close methods will be called as event listeners, and all of them need to access the correct 'this,'
        // which is troublesome with event listeners.
        // so, pre-bind them all up for convenience and sanity as the default
        this.open = this.open.bind(this);
        this.close = this.close.bind(this);
        this.handleKey = this.handleKey.bind(this);

        // durationShow is a special case, because it is the one duration value that is set initially in the css.
        // so if the configuration (options) have a custom value, then the css variable needs to be updated
        if (_settings.durationShowIsCustom) {
            this.$sidePanel[0].style.setProperty("--durationShow", _settings.durationShow);
        }

        // add event listener for Bootstrap collapse "show" event
        // - docs: https://getbootstrap.com/docs/4.6/components/collapse/#events
        // - show.bs.collapse: This event fires immediately when the show instance method is called.
        // uses jquery event (and not regular javascript) because Bootstrap uses jquery-land events.
        this.$sidePanel.on("show.bs.collapse", this.open);

        // (try to) select and cache the close button element.
        // note: assumes there is only one .sidePanel and only one close button within the sidePanel structure
        this.sidePanelCloseButton = _settings.sidePanelCloseElement ? _$sidePanel[0].querySelector(_settings.sidePanelCloseElement) : false;
        if (this.sidePanelCloseButton) {
            // add persistent event listener for action on the close element
            this.sidePanelCloseButton.addEventListener("click", this.close, false);
        } else {
            // no close button found :(
            // the sidepanel will be initialized, but maybe this isn't what is desired?
            console.warn('SidePanel: no close element could be found with the selector "' + _settings.sidePanelCloseElement + '".');
        }

        // if enabled, create the backdrop element and add event listener
        if (_settings.backdrop) {
            this.backdrop = new Backdrop(this);
            this.backdrop.element.addEventListener("click", this.close, true);
        } else {
            this.backdrop = null;
        }

        // flag for which close type, and therefore duration, to use: normal, or fast
        this.closeType = "normal"; // default behavior when closing the sidepanel

        // handle links:
        // find all the links in the sidepanel and add an event on them
        // in order to trap the links and implement custom behavior.
        // note: this.$sidePanel[0] is the native HTML element in the jquery object
        if (_settings.handleLinks) {
            const sidePanelLinks = this.$sidePanel[0].getElementsByTagName("a");
            const ln = sidePanelLinks.length;
            for (let i = 0; i < ln; i++) {
                sidePanelLinks[i].addEventListener("click", linkHandle().bind(this));
            }
        }

        // end: sidepanel initialization
    }

    /**
     * initialize sidepanel 'automatically' based on existence of the data_selector attribute on an element.
     * creates a page global "SidePanel" containing the instance(s) of the SidePanelCollapse object.
     */
    function initOnData() {
        window.SidePanel = [];
        const list = document.querySelectorAll(data_selector);
        list.forEach((element) => {
            SidePanel.push(new SidePanelCollapse(element.id));
        });
    }

    /**
     * on load/parse,
     * either
     * initialze the sidepanel when DOMContentLoaded event is fired,
     * or, if already fired,
     * then initialize right now
     */

    if (document.readyState === "loading") {
        // loading hasn't finished yet
        document.addEventListener("DOMContentLoaded", initOnData);
    } else {
        // already fired
        initOnData();
    }

    return SidePanelCollapse;
}));