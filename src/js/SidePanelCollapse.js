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
(function(window, SidePanelCollapse) {
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

    var _proto = SidePanelCollapse.prototype;  // convenience shorthand

    // funciton to reconcile/extend two objects
    function extend(a, b) {
        for (var p in b) {
            if (b.hasOwnProperty(p)) {
                a[p] = b[p];
            }
        }
        return a;
    }

    // make one single set of settings from defaults and any options passed in on construction
    function defineSettings(defaults, options) {

        // first: start settings{} with the defaults
        let _settings = extend({}, defaults);

        // reconcile with any provided options that will supercede/overwrite defaults
        _settings = extend(_settings, options);

        // if backdropEnabled is anything other than "true", it is false
        _settings.backdropEnabled = (_settings.backdropEnabled === true) ? true : false;

        // create a flag for the durationShow setting because durationShow is a special case.
        // see SidePanelCollapse constructor.
        _settings.durationShowCustom = (options !== undefined && options.durationShow !== undefined) ? true : false;

        return _settings;
    }

    // module default values
    // includes the access of the css variable values as module is created (for slightly better performance)
    //
    // extract and update the css transition values:
    // doing this so that the duration values do not have to be repeated in the javascript,
    // and there is only one declaration (e.g. if the defaults are changed).
    // if these are defined as .js values instead, the durations need to be in seconds (css transition format)
    let styles = getComputedStyle(document.querySelector(".sidepanel"));
    var defaults = {

        // css selectors:
        // default selectors for the sidepanel DOM elements
        sidepanelElement: "#sidePanel",  // top-level of the sidepanel
        sidepanelCloseElement: ".sidePanel-close",  // the close button, containing the close icon, visible when the sidepanel is displayed

        // css transition-durations:
        // default values for the sidepanel transition timings
        // in css transition-duration format. e.g.:
        //     durationShow: "1.65s",  // leisurely opening

        durationShow: styles.getPropertyValue("--durationShow"),
        durationHide: styles.getPropertyValue("--durationHide"),
        durationHideFast: styles.getPropertyValue("--durationHideFast"),

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

        // which side of the window is the sidepanel on.
        // currently the only choice is "right"
        side: "right"
    };


    // determine if the sidepanel is currently transitioning or not
    // '.collapsing' is applied to the element by Bootstrap during the transition, removed when finished
    _proto.isCollapsing = function() {
        return this.$sidepanel[0].classList.contains("collapsing");
    };


    // keypress handler
    // when the sidenav is displayed (open), ESC will close.
    // expects: invoked as event callback, with .bind(the main sidepanel object) (i.e. .bind(this))
    _proto.handleKey = function(e) {
        let key = e.keyCode;

        // console.log ("key handler:", key);

        switch(key) {
            case 27: // 'esc'
                this.close(e);
                break;
        }
    };

//     function linksAddListener(_$sidepanel, handler) {
//         // apply a 'click' event handler to each of the links in the sidepanel
//         let sidelinks = e.currentTarget.getElementsByTagName("a");
//         let ln = sidelinks.length;
//         for (var i = 0; i < ln; i++) {
//             sidelinks[i].addEventListener("click", linkClick, false);
//         };
//     }
//
//     function linksRemoveListener(_$sidepanel, handler) {
//         // remove listeners on the each of the links in the sidepanel
//         let sidelinks = e.currentTarget.getElementsByTagName("a");
//         let ln = sidelinks.length;
//         for (var i = 0; i < ln; i++) {
//             sidelinks[i].removeEventListener("click", linkClick, false);
//         };
//     }

    // manually activate the 'show' action
    _proto.show = function() {
        console.log (">>> call: show manually");
        this.$sidepanel.collapse("show");  // invoke Bootstrap function

    };

    // manually activate the 'hide' action
    _proto.hide = function() {
        console.log(">>> call: hide manually");
        this.$sidepanel.collapse("hide");  // invoke Bootstrap function
    };


    // OPEN the sidepanel
    // expects to be called with this = the sidepanel object (e.g. via bind(), which is set as the default)
    _proto.open = function(e) {

        console.log ("open: start:", e);

        // return a function as the event listener.
        // when the sidebar opening is completed,
        // manually change the duration of transition so that closing uses a custom duration.
        // this is overriding the default Bootstrap behavior, where duration is set by the css .collapsing class rule, and the same
        // duration is used for both opening and closing.
        // requires: event is on the sidepanel DOM element itself.
        function whenTransitionEnds(_this) {
            // var duration = _this.settings.durationHide;
            var listener = function(e) {
                console.log ("transition end", this);
                // when sidepanel is open, set keyup event handler - to catch ESC key and close sidepanel if pressed
                // e.target.style.transitionDuration = duration;
            };
            return listener;
        }

        // if open is invoked via default bootstrap behavior, then event will exist (e.g. click), and .collapse("show") will have been
        // invoked by bootstrap already.
        // if called independently, e will not exist, and "show" will need to be called manually.
        if (e === undefined) {
            this.show();
        }

        // initiate the showing of backdrop if backdrop is truthy
        if (this.backdrop) {
            this.backdrop.show();
        }

        // set keyup event handler - to catch ESC key and close sidepanel if pressed
        document.addEventListener("keyup", this.handleKey);

        // jquery event listener to run ONCE on the Bootstrap "is shown" event
        this.$sidepanel.one("shown.bs.collapse", whenTransitionEnds(this));

        // add a class to the document's <body>.
        // for convenience - use to enable any styles to apply only when sidepanel is open
        document.body.classList.add(this.settings.sidePanelIsOpenClass);
        console.log ("open: body class add");

        // manage links in the sidepanel:
        // if sidepanel links are anchor links, then clicking link should just go to the anchor and close the sidebar.
        // if sidepanel links are to another page, then clicking link should close the navbar (more quickly) and then go to the link destination

        // TODO: how to determine if links are in-page vs to-another-page?
        // options...

        // go by page id?

        // let linkClickCallback =  _this.closeFast.bind(_this);

        // find all the anchor links in the sidepanel.
        // convert the jauery node to HTML node

        function callback(e) {
            if (e.target && e.target.nodeName === "A") {
                console.log("item ", e.target.textContent, "was clicked");
                console.log("currenttarget: ", e.currentTarget);
            }
            e.preventDefault();
        }

        let sidenavLinks = this.$sidepanel[0].getElementsByTagName("a");
        let ln = sidenavLinks.length;
        for (var i = 0; i < ln; i++) {
            sidenavLinks[i].addEventListener("click", callback, false);
        };
    };


    // cleanup actions to do when the panel closes
//     function closeCleanup(_this) {
//         document.removeEventListener("keyup", _this.handleKey);
//         document.body.classList.remove(_this.settings.sidePanelIsOpenClass);
//     }


    // CLOSE the sidepanel - case: normal.
    // expects: invoked as event callback, with .bind(this) to give access to the main sidepanel object
    _proto.close = function(e) {
        // console.log ("close: start:", this.closeBehavior);

        // event handler:
        // when hiding/closing is complete, remove the transition duration override so that
        // the fallback, css-defined duration, will apply when the sidebar is shown/opened again.
        // presumes event is on the sidenav DOM element itself.
        function whenTransitionEnds(e) {
            // console.log ("close transition: ended", e);
            e.target.style.transitionDuration = null;
        }

        // check to see if collapsing is still in progress.
        // if so, stop the normal close process, and reroute via event
        // so that when the transition is finished, it will then go and close immediately
        if (this.isCollapsing() && !this.closeQueued) {
            // queue up to close immediately
            this.closeQueued = true;
            this.closeBehavior = "fast";
            this.$sidepanel.one("shown.bs.collapse", this.close);
            return;
        } else if (this.isCollapsing() && this.closeQueued) {
            // already queued
            return;
        }

        // start: proceed with closing actions
        this.closeQueued = false;

        // if open is invoked via event (e.g. click the button), then event will exist.
        // if called independently, event will not exist.
        if (e !== undefined) {
            e.preventDefault();
        }

        // set a jquery event listener to run ONCE on the Bootstrap "is hidden" event,
        this.$sidepanel.one("hidden.bs.collapse", whenTransitionEnds);

        // set duration for closing transition.
        let duration;
        switch(this.closeBehavior) {
            case "page":
                /* falls through */
            case "fast":
                duration = this.settings.durationHideFast;
                this.closeBehavior = "normal";  // reset
                break;
            default:
                duration = this.settings.durationHide;
        }
        // access native DOM element within jquery object.
        this.$sidepanel[0].style.transitionDuration = duration;
        console.log ("duration: ", duration);

        // initiate the hiding
        this.hide();

        // initiate the hiding of backdrop if backdrop is truthy
        if (this.backdrop) {
            this.backdrop.hide();
        }

        // cleanup
        document.removeEventListener("keyup", this.handleKey);
        document.body.classList.remove(this.settings.sidePanelIsOpenClass);

        console.log ("close: done.");
    };

    // CLOSE the sidepanel - case: extra-fast!!
    // close the sidenav with fast transition duration.
    // expects: invoked as event callback, with .bind(this) to give access to the main sidepanel object
//     _proto.closeFast = function(e) {
//
//
//         // event handler:
//         // when hiding/closing is complete, remove the transition duration override
//         // send page to link destination
//         function transitionEnds(e) {
//             console.log ("close Fast transition ended *****", e);
//             e.target.style.transitionDuration = null;
//             // window.location = e.target.href;
//         }
//
//         // if open is invoked via event (e.g. click link), then event will exist.
//         // if called independently, e will not exist
//         if (e !== undefined) {
//             e.preventDefault();
//         }
//
//         // set a jquery event listener to run once on the Bootstrap "is hidden" event,
//         this.$sidepanel.one("hidden.bs.collapse", transitionEnds);
//
//         // because this is close 'fast', change close duration to fast speed. use native DOM element within jquery object
//         this.$sidepanel[0].style.transitionDuration = this.settings.durationHideFast;
//
//         // initiate the closing
//         this.hide();
//
//         // initiate the hiding of backdrop if backdrop is truthy
//         if (this.backdrop) {
//             this.backdrop.hide();
//         }
//
//         // cleanup
//
//         console.log ("closeFAST: done.");
//     };


    // *****
    // Backdrop
    // the backdrop/overlay that is displayed when the sidepanel is open
    //
    // show the backdrop
    Backdrop.prototype.show = function() {
        let _element = this.element;
        _element.classList.add("show", "fadein");
    };

    // hide the backdrop
    Backdrop.prototype.hide = function() {
        console.log ("call: backdrop hide");

        // method to run when fadeout animation ends - cleans up, and hides the backdrop.
        // because event is on backdrop, event.target is the backdrop - uses backdrop from there for simplicity
        function whenAnimationEnds(e) {
            e.target.classList.remove("show");
            // note: if eventlistener {once: true} is not available (browser support), then eventListener can be removed manually, e.g.:
            // _backdrop.removeEventListener("animationend", whenAnimationEnds, true);
        }

        let _element = this.element;
        // when the backdrop's animationend event fires, call method. only once, since the listener is added again when it displays again.
        _element.addEventListener("animationend", whenAnimationEnds, {once: true, passive: true, capture: true});
        // remove ".fadein" to activate the default animation (fadeout)
        _element.classList.remove("fadein");
    };

    // Backdrop object constructor
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
        // this.SidePanel = _sidepanel;  // store reference to the SidePanel 'parent'

        // create the backdrop DOM element and store it
        this.element = create(_sidepanel.settings.backdropStyle);

        // add backdrop to the page DOM
        insert(this.element);
    };

    // end Backdrop
    // *****

    // SidePanel constructor
    function SidePanelCollapse(options) {

        let _settings = this.settings = defineSettings(defaults, options);  // convenience shorthand

        // initialization of sidepanel
        // (try to) select and cache the main sidepanel element
        let _$sidepanel = this.$sidepanel = $(_settings.sidepanelElement);  // convenience shorthand

        // check if sidepanel exists on the page;
        // check length because this is a jquery object.
        if (this.$sidepanel.length) {

            // sidepanel exists!

            // the open and close methods will be called as event listeners, and all of them need to access the correct 'this,'
            // which is troublesome with event listeners.
            // so, pre-bind them all up for convenience and sanity as the default
            this.open = this.open.bind(this);
            this.close = this.close.bind(this);
            // this.closeFast = this.closeFast.bind(this);
            this.handleKey = this.handleKey.bind(this);

            // durationShow is a special case, because it is the one duration value that is set initially in the css.
            // so if the configuration (options) have a custom value, then the css variable needs to be updated
            if (_settings.durationShowCustom) {
                this.$sidepanel[0].style.setProperty("--durationShow", _settings.durationShow);
            }

            // add event listener for Bootstrap collapse "show" event
            // - docs: https://getbootstrap.com/docs/4.3/components/collapse/#events
            // - show.bs.collapse: This event fires immediately when the show instance method is called.
            // uses jquery event (and not regular javascript) because Bootstrap uses jquery-land events.
            this.$sidepanel.on("show.bs.collapse", this.open);

            // (try to) select and cache the close button element.
            // note: assumes there is only one .sidepanel and only one close button within the sidepanel structure
            this.sidepanelCloseButton = _$sidepanel[0].querySelector(_settings.sidepanelCloseElement);
            if (this.sidepanelCloseButton) {
                // add event listener for action on the close element
                this.sidepanelCloseButton.addEventListener("click", this.close, false);
            } else {
                // no close button found :(
                // the sidepanel will be initialized, but it won't close.
                console.warn("SidePanel: no close button could be found with the selector \""+ _settings.sidepanelCloseElement + "\".");
            }

            // if enabled, create the backdrop element and add event listener
            if (_settings.backdropEnabled) {
                this.backdrop = new Backdrop(this);
                this.backdrop.element.addEventListener("click", this.close, true);
            }

            this.closeBehavior = "normal";  // default behavior when closing the sidepanel

            console.log ("sidepanel initialization: end");
        } else {
            // no sidepanel :(
            this.$sidepanel = false;
            console.error("No SidePanel element could be found with the selector \""+ _settings.sidepanelElement + "\".");
            console.warn("SidePanel was not created.");
        };
    };

    return SidePanelCollapse;
}));