# SidePanelCollapse

SidePanelCollapse is a javascript and CSS package that works with Bootstrap 4 to make a vertical element open and close horizontally, with added features to create a more nuanced user experience.

* [Introduction](#introduction)
* [Installing](#installing-sidepanelcollapse)
* [Using](#using-sidepanelcollapse)
* [Configuring](#configuration-options)
* [How It Behaves](#the-behavior-of-sidepanelcollapse)
* [The Demos](#the-demos)
* [Building From Source](#building-from-source)
* [Miscellaneous](#miscellaneous)
* [License](#license)





# Introduction

The [Bootstrap Collapse][BS-collapse] component is typically used to show and hide content in a vertical manner, collapsing up and down.

While developing a site, I wanted to add a vertical, full-window navigation sidebar. I was already using Bootstrap, so I thought that maybe I could use the existing component to make the navigation bar instead of adding another code package to the project or writing something new. (Though, what I ended up writing is this packages, so maybe this became a rabbit hole...)

Initial experiments did not work. But it turns out that it *is* possible.

Bootstrap 4 can be used to make an element "collapse" horizontally.


## The Hook

The important behavior from Bootstrap (4.6x) is this code fragment:

```javascript

_proto._getDimension = function _getDimension() {
    var hasWidth = $__default["default"](this._element).hasClass(DIMENSION_WIDTH);
    return hasWidth ? DIMENSION_WIDTH : DIMENSION_HEIGHT;
};

```
([Bootstrap.js/collapse source][BS-source-width])

Vertical/height collapse is the default behavior, but Bootstrap will check if the collapsing element has a `width` class.
If so, then the width, not height, "collapses" between 0 and the width value. It transforms horizontally instead of vertically.


## SidePanelCollapse Goes Sideways

SidePanelCollapse starts from this latent possibility and augments the normal behavior of Bootstrap collapse to manage an element that opens and closes horizontally.
Then, going beyond simple horizontal movement, the library provides additional functionality to make the user experience better (admittedly, an opinionated better).

### Features:

* Different and customizable durations for the open and close transitions applied to the side panel element.
* Optimized closing behavior when a link is clicked.
* A backdrop that overlays the page when the side panel is open.
* Option for a custom "close" button that is separate from the button that opens the side panel.
* Allows closing the side panel with a button, a tap on the backdrop, or the ESC key.


## Wot's All This, Then?

**The SidePanelCollapse library is itself just two files, one javascript and one CSS. The package's source code is in `src/` and the pre-built files are in `dist/`.**

So what are all these other files?

Everything in the `/src_demo` directory is for the demonstration examples that can be [built and viewed](#the-demos). These demos are derived from an existing site that is built around a static page generation system using (a custom forked version of) [Panini][Panini].

In addition to the handlebars partials, there are custom (handlebars) helpers (for example, `page-toc.js` generatively creates the page's table of contents when the page is built), demo-specific javascript modules, and supporting files.
The data-driven pages and things like the "gallery" on the advanced demo's index/homepage are also from the other site.

(If you are curious, that other site is at [stochasticnotions.com][stochasticnotions].)

I crafted this library in order to fill a need that I had on my own project, and then evolved it to be a stand-alone package. During that process, I have tried to distill everything down to greater simplicity, and have cut down the source code. But I might have missed some vestigial artifacts. If some aspect seems internally inexplicable, that is probably the reason why.

Contact me if you have questions.



# Installing SidePanelCollapse


## Installation Options

Two options are available to install and use SidePanelCollapse in your own project:
1. using external linked files
1. incorporating the source into your build process

### Option 1: External Linked Files

This is the simplest way of using SidePanelCollapse: the javascript and CSS files are added to the HTML page(s) as external resources.

 ```html
 <!DOCTYPE html>
 <head>
    <link href="path/to/SidePanelCollapse.min.css" rel="stylesheet"/>
</head>
<body>
    ...
    <script src="path/to/SidePanelCollapse.min.js" async></script>
</body>
```

1. Clone the repository, or download and unzip.
1. Copy the pre-built `/dist` SidePanelCollapse files to an appropriate location in your own project. You can choose to use either the minified or regular versions. If you also want the source maps, copy those as well (maintain the `/map` directory structure so that the browser can find the map files).
1. Add the `<link>` and `<script>` tags to your HTML document.

The [Simple Demo](#the-simple-demo) uses this method.

### Option 2: Incorporate Into an Existing Build Process

If your own project already has a (e.g. snode.js-based) build process, already compiles, transpiles, and processes javascript, and it is using SCSS, then the SidePanelCollapse source files might be right for you.

The [Advanced Demo](#the-advanced-demo) uses this method.

1. Clone the repository, or download and unzip.
1. Copy all of the `/src` SidePanelCollapse javascript and SCSS files to the appropriate location in your own project. Those files are:

 ```shell
src/
    scss/
        sidePanelCollapse.scss
        sidePanelCollapse/
            _sidePanelCollapse.scss
        vendor/
            _bootstrap.scss
    js/
        SidePanelCollapse.js
```

3. SidePanelCollapse's SCSS references a few Bootstrap variables, and so the Bootstrap source scss needs to be available (by default, in `node-modules/`). If Bootstrap 4 is not already in your project's dependencies, add it. E.g.:

```shell
> npm install --save-dev bootstrap@4
```

4. Add the appropriate directives to include or require the source files into your own source.
    - For SCSS, this is an SCSS import.
    - For javascript, this will be whatever method you are already using (e.g. `require`).
```scss
// scss
@import "sidePanelCollapse";
```
```js
/* javascript */
SidePanelCollapse = require("SidePanelCollapse");
```





# Using SidePanelCollapse


## Requirements

Minimum requirements to use SidePanelCollapse on a site.

### Tech Requirements

* [Bootstrap 4.x][Bootstrap-home]. The library was developed with version 4.6.2.
* [jQuery 3.x][jQuery-home]. Developed with version 3.7x, slim build. Bootstrap4.x itself requires jQuery, so this library should already be part of the site.


There are additional requirements to build/view the demos or work with the source code:
* [Node](https://nodejs.org/), v16+.
* npm

### Browser Support

A recent model browser.
* Chrome, Firefox, Safari, Edge. Some mobile versions, too.
* IE? not so much.

See note regarding [browser targets](#about-the-production-builds).

### HTML Page Requirements

To begin with, you should have an element in your web page – the "side panel" – containing content that you want to show and hide, side to side.

* The top level of the side panel must have a unique CSS selector. The default is `#sidePanel`.
* The side panel HTML element itself must have the `width` and `sidePanel` classes.

```html
<div class="sidePanel width mysidenav collapse" id="sidePanel">
    ...
</div>
```

* The side panel HTML element must first be set up as a valid, functioning Bootstrap collapse component, including a functioning Bootstrap button configured to open the collapse element.

```html
<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#sidePanel" aria-controls="sidePanel" aria-expanded="false" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon"></span>
</button>
```

See the [Bootstrap Collapse documentation][BS-collapse] for details of the collapse component requirements.

* There should be an HTML button element that will close the panel when clicked. This complements the Bootstrap button element for opening a collapse-able element. Having a close button isn't exactly a technical requirement, but a user-centered design requirement.
* The side panel must be initialized by SidePanelCollapse before it will function correctly. Either passively via a data-attribute or manually via javascript.

Once the page has loaded, the side panel must be instantiated and initialized by SidePanelCollapse before it will function correctly.


### Visual Design Requirements

SidePanelCollapse only manages the interactions of the side panel.
It makes absolutely no claims on the visual design of the side panel element.
All visual styling must be done separately. It can be any color, practically any size, and can have most any content. You should be able to make it work with just about any design of your own. Take a look at [the Demos](#the-demos) for ideas.

There are visual style rules on the backdrop element, however, defining the colors of the "light" and "dark" versions.



## Initialization

Initialization can happen 'automatically' on page load by putting a data attribute on your side panel HTML element, or it can be done programmatically with a javascript function constructor.

Either of these methods is available to you no matter how you have incorporated the library into your own project. You can use linked files and then invoke it manually, or you can integrate it into your build process and use a data attribute. **But only initialize once.**

### Via Data Attribute

Add the boolean attribute `data-sidepanel-collapse` on the side panel HTML element to have the side panel activated automatically when the page loads.

Data attribute activation will use the default settings. Custom configurations are only available via javascript initialization.

```html
<div class="sidePanel sidenav width collapse" id="sidePanel" data-sidepanel-collapse>
    ...
</div>
```

### Via Javascript

Activate SidePanelCollapse manually by creating a new SidePanelCollapse instance with the constructor.

```js
yourSidePanel = new SidePanelCollapse(options);
```

Setting custom configuration options is, well...optional, and only available via javascript initialization. [Configuration Options](#configuration-options) describes the available choices in detail.





# Configuration Options

SidePanelCollapse can be initialized via javascript with custom settings using a javascript properties object. Use only what you need - any values not specified will use the defaults.

```js
let options = {
    durationShow: "3s",
    durationHide: "2s",
    backdropStyle: "dark",
};
sidePanel = new SidePanelCollapse(options);
```


| Name | Type | Default  | Description |
| ---- | --------------- | ------------- | ----------- |
| `sidePanelElement`      | CSS ID selector | `#sidePanel` | CSS ID selector for the top-level of the side panel. |
| `sidePanelCloseElement` | CSS CLASS selector, or `false` | `.sidePanel-close` | CSS selector for the close button that should close the panel. If `false`, no closing button will be used by the library. |
| `sidePanelIsOpenClass`  | CSS CLASS name | `sidePanel-open` | CSS class that is added to the document `<body>` when the sidePanelElement shows, removed when it hides. |
| `durationShow`          | CSS transition-duration | `1.1s` | Duration for the opening transition.
| `durationHide`          | CSS transition-duration | `0.35s` | Duration for the standard closing transition.
| `durationHideFast`          | CSS transition-duration | `0.13s` | Duration for  _FAST_ closing transition.
| `backdrop`              | boolean | `true` | Whether or not a backdrop (i.e. overlay) should display behind the open panel. |
| `backdropStyleClass`         | CSS CLASS name | `light` |  Which style of backdrop to use, corresponding to a CSS class style. Built-in classes are "light" or "dark". |
| `handleLinks`         | boolean | `true `| Whether or not `<a>` html links in the side panel should be handled in a special manner by the library.  |


⚠️**Caveat Developer**:
During initialization, if the `sidePanelElement` HTML element cannot be found in the document, a browser console alert will display and the SidePanelCollapse will not be created. Otherwise, it will be created – whether or not the custom values are valid.

Any custom settings should be manually verified and validated for the context. For example, the durations are required to be valid CSS transition-duration values. If they are not, there may not be any overt indication that something is awry, but the side panel will not function correctly.


## `sidePanelElement`

This selects the panel HTML element itself. Its value must be a valid unique CSS ID selector for the top level of the side panel DOM element in the HTML page. As a test, if `document.getElementById()` returns the right element and only one element, then it should work correctly.


## `sidePanelCloseElement`

The side panel closing button. It must be a valid unique CSS selector for close button DOM element in the HTML page. As a test, if `document.querySelector()` returns the right element and only one element, then it should  work.

If you do not want to use a close button, set boolean `false` and the library will not look for a close button. If the CSS selector cannot be found in the DOM, the internal value will also be `false`.


## `sidePanelIsOpenClass`

When the side panel opens, the CSS class name specified by `sidePanelIsOpenClass` is added to the document's `<body>` tag and then removed when it hides. This provides a convenient cascade to enable styles that should apply only when the panel is open.

```scss
// turn all <p> chartreuse when sidebar is open
.sidePanel-open p {
    background-color: #AAFF11;
}
```


## Durations

SidePanelCollapse implements different durations for normal open and close transitions, and has a third duration for closing very fast.

See [Timing and the User Experience](#timing-and-the-user-experience) for thoughts about the SidePanelCollapse has been designed with regard to the transition durations.

### `durationShow`

The panel opens using the duration value `durationShow`. The default value chosen is felt to be a good balance between two qualities: fast enough to be prompt and attentive, but not too fast that it feels pugnacious.

### `durationHide`

**Closing Normally:**
When the side panel is closed using the close button, clicking the backdrop, or using the keyboard, the closing duration is the value `durationHide`.

The default hide duration is chosen to be fast enough to get out of the way expediently without being too fast for the situation.

### `durationHideFast`

**Closing Very Fast:** In specific circumstances, SidePanelCollapse closes the panel using the `durationHideFast` duration. The default very fast duration is about 1/3 of the standard closing duration.


## `backdrop` & `backdropStyleClass`

When `backdrop` is true, opening the panel will be accompanied by a translucent overlay that displays behind the side panel and above the main page content.

The visual style of the backdrop is set by the `backdropStyleClass` value. Included in the library are two  styles: `light`, the default, is a diaphanous #FFF; `dark` is a shadowy #000.

You can specify a custom style by defining a rule in your project's SCSS and providing the selector as a string (without the leading dot). It must be a class and cannot be an id.

For example, these SCSS and JS configuration options...
```scss
.brightSpring {
    background-color: rgba(#AAFF11, 0.57);
}
```
```js
const options = {
    backdropStyleClass: "brightSpring",
};
```
...results in this HTML element:
```html
<div class="backdrop brightSpring"></div>
```

## `handleLinks`

The `handleLinks` option is a boolean value that determines if SidePanelCollapse will attempt to alter the default behavior of links in the side panel element.

When `handleLinks` is true, SidePanelCollapse will attempt to parse the content of the element. Any links found - technically defined as `<a>` tags that are descendants of `sidePanelElement` – will be given a custom event handler. When clicked, the side panel will be closed "fast" and then the page will be sent to the link destination.

When `false`, link-handling is disabled and nothing changes.

See [Closing The Side Panel: Clicking A Link](#clicking-a-link) for more explanation.





# The Behavior of SidePanelCollapse

It opens and it closes. Look more closely, and there is more to it than just that.


## Opening and Closing Durations

Normal Bootstrap collapse behavior is to use a single duration for opening and closing. SidePanelCollapse's founding reason for existence and main feature is to override this behavior and implement different durations in different scenarios. This creates a better end-user experience. How so?

### Timing and the User Experience

When interacting with an element like a side navigation bar, a person has a certain psychological tolerance for the total time it takes the page to respond to their request to show the side panel. This person (here, the paradigmatic "user") actively chooses to open the side panel and when they do that, their attention shifts to the results of the action. So the behavior of the panel becomes their primary focus – it is in their mental spotlight. If the response is too slow, dissatisfaction blooms. Too fast, and it feels aggressive.

On the flip side, response time tolerance decreases significantly when closing the element.

On acting to close the panel, mental focus shifts back to the page itself, whether it is a task-based application or textual content. Once the focus is on the main page, the side navigation becomes "background" and it needs to disappear. Closing quickly is what the person wants. If it closes too slowly, it does not fulfill expectations and intrudes negatively on focus. But too quickly and it also creates an unconscious negative impression of being a behavior that is not purposeful and a detail that was left unmanaged.


## Opening the Side Panel

The side panel opens when the open button is clicked. If backdrop is enabled, then the backdrop will animate in to screen off the content in the page behind the panel.

Note that some default Bootstrap components (fixed navbar, modals, popover, tooltips) will remain above the backdrop, including the navbar component. This is by design and is due to basing the SidePanelCollapse z-index values on Bootstrap's `$zindex-fixed` variable.

### The Irrevocable Opening

Bootstrap's collapse functionality underlies the open and close transitions.

Consequently, this means that the open and close behavior is fundamentally dependent on how Bootstrap behaves. And in Bootstrap, once the open transition has been started, it cannot be stopped. It is irrevocable. Any programmatic attempt to interrupt the transition in progress, or to cancel it once it has started, will be ignored. Once the opening transition has begun, it cannot be closed until it has finished opening.

This is a bootstrap  ~~limitation~~ [condition][BS-javascript].

From the user experience perspective this is not ideal. It is a reasonable and likely possibility that a person will initiate opening the side panel and then immediately want to (or at least try to) close the panel.

#### Queued

To account for uninterruptibility, SidePanelCollapse makes the design decision that if an action to close the panel is made while it is opening (e.g. ESC key), the closing command will be queued **once**. Then, when the open transition has completed, it will immediately be closed very quickly (`durationHideFast`).

Queuing is only done for actions while the panel is opening, and not for actions when it is closing. Irrevocability is also true of the closing transition. But since closing has different user expectations, it generally will not be an issue.


## Closing the Side Panel

Once it is open, there are four regulated ways to close the side panel:
1. A close button
1. The ESCAPE key
1. Clicking the backdrop
1. Clicking a link (in the side panel)

The first three of these are mostly straightforward. The fourth is not.

### A Close Button

SidePanelCollapse allows for a close `<button>` element within the vertical panel or on the page. For example, in the demos, this is the glyph "X" in the side header bar.

The default CSS selector for the close button is `.sidePanel-close`. Give the option `sidePanelCloseElement` a custom CSS selector on initialization to target a differently-named closing element that adheres to the Bootstrap collapse `.navbar-toggler` requirements. Or it can be given a value of `false`. In that case, no separate close button will be initialized by the library, and the other closing methods can be relied upon.

Clicking the close button will close the side panel at the normal duration speed.

**Caution**: The toggle button used to first open the side panel will close the panel when clicked (if it is visible and not covered). Activating it calls directly to bootstrap.js. However, when it closes, it will not clean up the page properly. Notably, the backdrop will remain. This is something to change in [a future iteration](#roadmap).

### The Escape Key

Pressing the "ESC" key will close at the normal duration speed.

### Clicking the Backdrop

The panel will also close – at normal duration – if the backdrop is clicked. This covers clicking anywhere in the page window other than within the side panel element itself.

### Clicking a Link

Clicking a link in the side panel will also close the panel, but not like the other three behaviors. Special behavior in SidePanelCollapse is available for links.

When the `handleLinks` behavior is enabled, SidePanelCollapse will add an interstitial behavior to HTML links that are in the side panel element (see the [handlelinks options](#handlelinks) for technical details). When one of these links is clicked, the following sequence occurs:
1. The default link action is blocked.
1. The panel is closed using the "fast" duration setting.
1. When the close transition is complete, then the browser is sent to the `href` destination of the link.

The setting `handleLinks: false` disables this behavior. You might do this if, for example, your project is an application and the sidebar is not for navigation but options for an item selected in the main page.

SidePanelCollapse was designed and built originally for a static HTML site. Therefore, many of the methods and behaviors are written with that context, and not, for example, a more dynamic site like an application where the links may have complex behaviors connected to them. Nonetheless, it should be possible to adapt to more complex contexts. Let me know if you find success or encounter issues.


### Links and the User Experience

The design intent behind managed links is to provide a subtly (more) sophisticated user experience.

If `handleLinks` is disabled, link actions will happen in the usual unmodified manner of links – immediately. Typically this means that the browser will leave the current page as-is and begin to load the link's destination URL. In the browser window, the side panel will remain open until the new destination page begins to render, and the window will "jump cut" to the new page.

When links are handled (`handleLinks = true`, the default), the side panel will first close itself expediently and neatly before starting off to the new destination. This is a subtle communication to the end-user that the current page is exiting gracefully and helps engender trust.


# The Demos

There are two demo sites included in the source code to showcase using the library in different ways: simple, and advanced.

**The demos are intended to be a source of ideas and inspirations, not canon.** They are only example designs that use SidePanelCollapse, and are starting points for your own implementation.


## Building the Demos

To view the working demo sites, you first need to build the demos from the source. And to build the demos, you need to have `node` and `npm`.

Begin by getting a copy of the project source locally.

1. Clone the repository, or download and unzip.
1. Open a terminal to the root of the project directory.
1. From the root, the command `npm install` will initiate the installation of all the necessary dependencies, including `gulp`. This may take a few moments.

```shell
> cd SidePanelCollapse
> npm install
```

4. When the install has completed successfully, `gulp demo` will build all of the files and start a local node-based web server to serve the web pages.

    When the gulp tasks run, and if no errors occur, there will be a message about the web server somewhere in the stream of status messages displayed. It will be like the one below, but your listed IP address may be different (or not displayed at all).

```shell
> gulp demo

[11:11:51] Starting 'demo'...
...

Web server is running.
Connect to:  localhost:9191
Connect to:  192.168.1.42:9191

...
[11:12:13] Finished 'demo' after 456 ms
```

5. Now, open one of the "connect to:" addresses (they point to the same location) in your recent-model browser of choice, and a demo will display.

The `demo` task does not update any files for changes. For that you need to use the `dev` task; see [Building For Development](#building-for-development).


## The Simple Demo

Simple demo is a single page that exemplifies the most minimal method of using the SidePanelCollapse library in a website: linked files, no javascript, and the default settings.

### Inclusion: External Resources

The side panel library is included into the page as linked files, separate from the other CSS and javascript files.


### Initialization: Via Data Attribute

The side panel is activated for Bootstrap's collapse via data attributes, and then initialized by SidePanelCollapse using the data attribute option.

### Configuration: Defaults

All of the default SidePanelCollapse settings are used for configuration.


## The Advanced Demo

The "advanced demo" (for want of a more clever name) is a more involved example of using SidePanelCollapse. It has a top-level home page and a couple of mock interior pages. Although these are all individual page files, the site is structured as a kind of conceptual single page application in that all of the pages rely on a single common javascript file with a simplistic routing mechanism to run different functions depending on the page.

In the advanced demo, SidePanelCollapse is incorporated into the site's source, is initialized programmatically, and has custom configuration settings.

### Inclusion: Integrated

The SCSS and javascript sources are incorporated into the site's build process, and become part of the final .css and .js files respectively.

The SCSS is included by an `import` directive in `site.scss`, and `gulp` tasks compile the composite CSS file.

```scss
@import "sidePanelCollapse";
```

For the javascript, the site's standalone script requires `SidePanelCollapse.js`, and an aggregate javascript is assembled by a `browserify` task.

```js
window.SidePanelCollapse = require("SidePanelCollapse");
```

### Initialization: Via Javascript

SidePanelCollapse is instantiated and initialized differently for each page. Currently, the site script distinguishes between the index page and the interior pages.

### Configuration: Custom

Configuration settings differ for the home page and the interior pages. This isn't necessary to do, and might even be a poor user experience practice for a site, but is done here to illustrate the possibility.





# Building From Source


The library's source code is, I think, commented generously with notes written to explain most of the code behaviors. Look in there for details.


## Building For Development

1. Clone the repository
1. Open a terminal to the root of the project directory.
1. From the root, `npm install` will initiate installation of all the necessary dependencies, including `gulp`.

```shell
> git clone https://github.com/mmilano/SidePanelCollapse
> cd SidePanelCollapse
> npm install
```

4. When the install has completed successfully, `gulp dev` will build all of the project files, watch for changes, and start a local node-based web server for the example pages.

```shell
> gulp dev

[11:11:51] Starting 'dev'...
...

Web server is running.
Connect to:  localhost:9191
Connect to:  192.168.1.42:9191

...
```

Open one of the "Connect to:" addresses in your recent-model browser to view the example sites if you want to use them for testing changes.


## Building Just The Library

If all you want is a new build of library files, there is a (gulp) task for that. Assuming everything is already installed (per [Building For Development](#building-for-development)), open a terminal to the root of the project directory and run the `production` task.

```shell
> gulp production
Starting 'production'...

```

Production builds of the library (the .js and .css files) get saved into the project's `/dist` directory, in both minified and verbose (aka normal) versions. Source maps are created in the respective `/map` directories.


### About the Production Builds

#### Browser Targets

The CSS and javascript is compiled or transpiled to a browser target = `["> 0.3%"]` and `not dead.` If you need a different target range, this value can be changed (in the `package.json` file) and the files rebuilt to the new target. Be cognizant that increasing the range will probably increase the final file size as a result of added polyfills.





# Miscellaneous


## Questions
If you have any questions, ideas, or problems, feel free to open a new issue.


### Recognitions

#### Pioneers

There are other examples in the wild demonstrating a Bootstrap horizontal collapse that I may have read when  trying to work out how to make things go sideways. To the original authors of those: thank you for your inspiration.

#### Attributions

* The FPO text on the examples pages was caffeinated-ly generated by [Coffee Ipsum][CoffeeIpsum].
* Iconography in the demo open graph image by Jacob Halton from the [Noun Project][TheNounProject].





# License

SidePanelCollapse is released under the MIT license.


[Bootstrap-home]: https://getbootstrap.com/
[BS-collapse]: https://getbootstrap.com/docs/4.6/components/collapse/

[BS-source-width]: https://github.com/twbs/bootstrap/blob/349a373ff62bf530135ad95d7d1d3f1be6abbf22/js/dist/collapse.js#L276

[BS-javascript]: https://getbootstrap.com/docs/4.3/getting-started/javascript/#asynchronous-functions-and-transitions
[jQuery-home]: https://jquery.com/
[Panini]: https://github.com/zurb/panini
[CoffeeIpsum]: https://coffeeipsum.com/
[TheNounProject]: https://thenounproject.com
[stochasticnotions]: https://www.stochasticnotions.com/?pk_source=github
