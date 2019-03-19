# SidePanelCollapse

SidePanelCollapse is a javascript and CSS package that extends Bootstrap 4 to make a vertical navigation bar open and close with added features to create a more nuanced user experience. 

* [Introduction](#introduction)
* [Installing](#installing-sidepanelcollapse)
* [Using](#using-sidepanelcollapse)
* [The Demos](#the-demos)
* [Building From Source](#building-from-source)
* [Miscellaneous](#miscellaneous)



# Introduction

The [Bootstrap Collapse][BS-collapse] component is typically used to show and hide content in a vertical manner, collapsing up and down.

While developing a project site, I wanted to add a vertical full-window navigation sidebar. I was already using Bootstrap, so I thought that maybe I could use the existing component to make the navigation bar instead of adding another code package to the project or writing something new. (Of course, what I ended up writing is this library, so maybe this became a rabbit hole...)

Initial experiments did not work. But – it turns out that it is possible.

Bootstrap 4 can be used to make an element collapse horizontally.


## The Hook

The relevant code from Bootstrap is this fragment:

```javascript
_proto._getDimension = function _getDimension() {
    var hasWidth = $(this._element).hasClass(Dimension.WIDTH);
    return hasWidth ? Dimension.WIDTH : Dimension.HEIGHT;
};
```
([Bootstrap.js/collapse source][BS-source-width])

Vertical/height collapse is the default behavior, but Bootstrap will check if the collapsing element has a `width` class. If so, then the width, not height, collapses between 0 and its width value. It transforms horizontally, not vertically.


## SidePanelCollapse Goes Sideways

SidePanelCollapse starts from this buried possibility and augments the normal behavior of Bootstrap collapse to manage an element that opens and closes horizontally. Then, going beyond simple horizontal movement, the library provides additional functionality to make the user experience better.

### Features:
* Different and customizable durations for the open and close transitions.
* Optimized closing behavior when a link in the side panel is clicked.
* A backdrop that overlays the page when the side panel is open.
* Option for a custom "close" button that is separate from the button that opens the side panel.
* Allows the end-user to close the side panel with a button, a tap on the backdrop, or with the ESC key.


## Wot's All This, Then?

**The SidePanelCollapse library is itself just two files, one javascript and one CSS. The package's source code is in `src/` and the pre-built files are in `dist/`.**

So what are all these other files in this project?

Everything in the `/src_demo` directory is for the demonstration examples that can be built and viewed. These demos are derived from a larger site I developed which is built around a custom static page generation system using [Panini][Panini]/handlebars.js. 

In addition to the handlebars partials, there are custom handlebars helpers (for example, `page-toc.js` generatively creates the page's table of contents when the page is built), site-specific javascript modules, and supporting files. The data-driven pages and things like the "gallery" on the advanced demo's index/homepage are also a part of the larger site.

If you are interested, that other site is at [stochasticnotions.com][stochasticnotions].

I have tried to distill everything down to greater simplicity, and have cut down the source code considerably. But I might have missed some artifacts. If some aspect of the demo projects seems internally inexplicable, that is probably the reason why.

Feel free to contact me if you have questions.



# Installing SidePanelCollapse

## Installation Options

Two options are available to install SidePanelCollapse into your own project. 

### Option A: External Linked Files

This is the simplest way of using SidePanelCollapse: the javascript and CSS files are added to the HTML page(s) as external resources.

 ```html
 <!DOCTYPE html>
 <head>
    <link href="path/to/sidePanelCollapse.min.css" rel="stylesheet"/>
</head>
<body>
    ...
    <script src="path/to/SidePanelCollapse.min.js" async></script>
</body>
```


1. Clone the repository, or download and unzip.
1. Copy the pre-built `/dist` sidePanelCollapse files to an appropriate location in your own project. You can choose to use either the minified or regular versions. If you also want the source maps, copy those as well (maintain the `/map` directory structure so that the browser can find the map files).
1. Add the `<link>` and `<script>` tags to your HTML document.

The [Simple Demo](#the-simple-demo) uses this option.


### Option B: Incorporate Into an Existing Build Process

If your own project already has a node.js-based build process, already compiles, transpiles, and processes javascript and it is using SCSS, then the SidePanelCollapse source files can be incorporated into your project.

1. Clone the repository, or download and unzip.
1. Copy all of the `/src` sidePanelCollapse javascript and SCSS files to a location in your own project. Those files are:
 ```sh
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

3. SidePanelCollapse's SCSS references one or two Bootstrap variables, and so the Bootstrap source scss needs to be available (in `node-modules/`). If Bootstrap 4 is not already in your project's dependencies, add it. E.g.:
```sh
> npm install --save-dev bootstrap
```
4. You will need to add the appropriate directives to include or require the source files into your own source.
    - For SCSS, this is an SCSS import. 
    - For javascript, this will be whatever method you are already using (e.g. `require` or `import`).
```scss
// scss
@import "sidePanelCollapse";
```
```js
/* javascript */
SidePanelCollapse = require("SidePanelCollapse");
```
The [Advanced Demo](#the-advanced-demo) uses this method.


# Using SidePanelCollapse

## Requirements

Minimum requirements to use SidePanelCollapse on a site.

### Tech Requirements

* [Bootstrap 4.x][Bootstrap-home]. The library was developed with version 4.3.1, but it may work with earlier 4.x versions.
* [jQuery 3.x][jQuery-home]. Developed with version 3.3.1, slim build. Bootstrap itself requires jQuery, so this library should already be part of the site. 
* A recent model browser. Chrome 51+, Firefox 50+, Safari 11+. Not really IE. See note [about the production builds](#about-the-production-builds).

There are additional requirements to build/view the demos or work with the source code:
* [Node](https://nodejs.org/), v8+.
* npm. Which is generally installed with node


### HTML Page Requirements

In order to work, the side panel HTML element must first be set up as a valid, functioning Bootstrap collapse component. 

The side panel HTML element itself must have the `width` class.

```html
<div class="sidepanel width collapse" id="sidePanel">
    ...
</div>
```

There should also be a functioning Bootstrap button configured to open the collapse element.

```html
<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#sidePanel" aria-controls="sidePanel" aria-expanded="false" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon"></span>
</button>
```

See the [Bootstrap Collapse documentation][BS-collapse] for details of the fundamental collapse component requirements. 


To begin with, you should have an element in your web page – the "side panel" – containing some content that you want to show and hide side to side.

* The top level of the side panel must have a unique css selector. The default is `#sidePanel`.
* The side panel must be initialized by SidePanelCollapse before it will function correctly. Either passively via a data-attribute or manually via javascript.
* There should be an HTML button element that will close the panel when clicked. This complements the Bootstrap button element for opening a collapse-able element. Having a close button isn't exactly a technical requirement, but a user-centered design requirement.

Once the page has loaded, SidePanelCollapse will need to be instantiated and initialized.


## Initialization

Initialization can happen 'automatically' on page load by putting a data atrribute on your side panel element, or it can be done programmatically with a javascript function constructor.

Either of these methods is available to you no matter how you have incorporated the library into your own project. You can use linked files and then invoke it manually, or you can integrate it into your build process and use a data attribute. Mix and match. **Use only one method.**


### Via Data Attribute

Add the boolean attribute `data-sidepanel-collapse` on the side panel HTML element to have the side panel activated automatically when the page loads.

Data attribute activation will use the default settings. Custom configurations are only available via javascript initialization.

```html
<div class="sidepanel sidenav width collapse" id="sidePanel" data-sidepanel-collapse>
    ...
</div>
```

### Via Javascript

Activate SidePanelCollapse manually by creating a new SidePanelCollapse instance with the constructor.

```js
sidepanel = new SidePanelCollapse(options);
```

Setting custom configuration options is only available via javascript initialization. See [Configuration Options](#configuration-options) for details.




# Configuration Options

If you want, SidePanelCollapse can be initialized via javascript with custom options. Any values not specified will use the default value.

```js
var options = {
    durationShow: "3s",
    durationHide: "2s",
    backdropStyle: "dark",
};
sidepanel = new SidePanelCollapse(options);
```


| Name | Possible Values | Default Value | Description |
| ---- | --------------- | ------------- | ----------- |
| `sidepanelElement`      | CSS selector | `#sidePanel` | CSS selector for the top-level of the side panel. |
| `sidepanelCloseElement` | CSS selector or `false` | `.sidePanel-close` | CSS selector for the close button that should close the sidepanel. If `false`, no closing button will be used by the library. |
| `durationShow`          | CSS transition-duration | `1.1s` | Duration for the opening transition.
| `durationHide`          | CSS transition-duration | `0.35s` | Duration for the standard closing transition.
| `durationHideFast`          | CSS transition-duration | `0.13s` | Duration for  _FAST_ closing transition.
| `backdrop`              | boolean | `true` | Whether or not a backdrop (i.e. overlay) should display behind the open sidepanel. |
| `backdropStyleClass`         | CSS class name | `light` |  Which style of backdrop to use, corresponding to a CSS style. Built-in options are "light" or "dark". |
| `sidePanelIsOpenClass`  | CSS class name | `sidepanel-open` | CSS class that is added to the document `<body>` when sidepanel shows, removed when it hides. |
| `handleLinks`         | boolean | `true `| Whether or not links in the side panel should be handled in a special manner by the library.  |


⚠️**Caveat Developer**: 
During initialization, if the `sidepanelElement` HTML element cannot be found in the document, a browser console alert will display and the SidePanelCollapse will not be created. Otherwise, it will be created – whether or not the custom values are valid.

Any custom settings should be manually verified and validated for the context. For example, the durations are required to be valid CSS transition-duration values. If they are not, there may not be any overt indication that something is awry, but the side panel will not function correctly.


## sidepanelElement

This selects the the side panel element itself. Its value must be a valid unique CSS selector for the top level of the side panel DOM element in the HTML page. As a test, if `document.querySelector()` returns the right element and only one element, then it should work correctly.


## sidepanelCloseElement

The side panel closing button. It must be a valid unique CSS selector for close button DOM element in the HTML page. As a test, if `document.querySelector()` returns the right element and only one element, then it should be valid.

If you do not want to use a close button, set `false` and the library will not look for a close button. If the CSS selector cannot be found in the DOM, the internal value will also be `false`.


## Durations

SidePanelCollapse implements different durations for regular open and transitions, and has another duration for closing very fast.

See [Timing and the User Experience](#timing-and-the-user-experience) for thoughts about how SidePanelCollapse has been designed.


### durationShow

The panel opens using the duration value `durationShow`. The default value chosen is felt to be a good balance between two qualities: fast enough to be prompt and attentive, but not too fast that it feels pugnacious.


### durationHide

**Closing Normally:**
When the side panel is closed using the close button, clicking the backdrop, or using the keyboard, the closing duration is the value `durationHide`. 

The default hide duration is chosen to be fast enough to get out of the way expediently without being too fast for the situation.


### durationHideFast

**Closing Very Fast:** In certain situations, SidePanelCollapse closes the panel using the duration of `durationHideFast`. The default fast duration is about 1/3 of the standard closing duration.


#### Timing and the User Experience
Normal Bootstrap collapse behavior is to use a single duration for opening and closing. SidePanelCollapse's founding reason for existence is to override this behavior and implement different durations in different scenarios. This creates a better end-user experience.

 How so? When interacting with an element like a side navigation bar, a person has a certain psychological tolerance for the total time it takes the page to respond to their request to show the side panel. This person (here, the paradigmatic "user") actively chooses to open the side panel and when they do that, their attention shifts to the results of the action. So the behavior of the panel becomes their primary focus – it is in their mental spotlight. If the response is too slow, dissatisfaction blooms. Too fast, and it feels aggressive.

On the flip side, psychological response time tolerance decreases significantly when closing the side navigation. 

On acting to close the panel, mental focus shifts back to the page itself, whether it is a task-based application or textual content. Once the focus is on the main page, the side navigation becomes secondary and it needs to disappear. If it closes too slowly, it does not fulfill mental expectations and intrudes negatively on focus. Closing quickly is what the person wants, but too quickly and it also creates an unconscious negative impression of being a behavior that is not purposeful and a detail that was left unmanaged.


## backdrop & backdropStyleClass

When `backdrop` is true, opening the panel will be accompanied by a translucent overlay that displays behind the side panel and above the main page content. 

The visual style of the backdrop is set by the `backdropStyleClass` value. Included in the library are two  styles: `light`, the default, is a diaphanous #FFF; `dark` is a shadowy #000.

You can specify a custom style by defining a rule in your project's SCSS and providing the selector as a string (without the leading dot). It must be a class and cannot be an id.

For example, this SCSS and option...
```scss
.brightSpring {
    background-color: rgba(#AAFF11, 0.57);
}
```
```js
var options = {
    backdropStyleClass: "brightSpring",
};
```
...results in this backdrop HTML element:
```html
<div class="backdrop brightSpring"></div>
```

## sidePanelIsOpenClass

When the side panel opens, the CSS class name specified by `sidePanelIsOpenClass` is added to the document's `<body>` tag and then removed when it hides. This provides a convenient cascade to enable styles that should apply only when the panel is open.

```css
// turn all <p> chartreuse when sidebar is open
.sidepanel-open p {
    background-color: #AAFF11;
}
```

## handleLinks

The `handleLinks` option is a boolean value that determines if SidePanelCollapse will attempt to alter the default behavior of links in the side panel element. 

When `handleLinks` is `true`, SidePanelCollapse will attempt to parse the content of the element. Any links found - defined as standard `<a>` tags – will be given a custom event handler. When clicked, the side panel will be closed "fast" and then the page will be sent to the link destination.

When `false`, link-handling is disabled and nothing changes.

See [Closing The Side Panel: Clicking A Link](#clicking-a-link) for more explanaation.




# The Behavior of SidePanelCollapse

It opens and it closes. Look more closely, and there is a little more to it than just that. Read on.


## Opening the Side Panel

The side panel opens when the open button is clicked. And if backdrop is enabled, then the backdrop will appear behind the side panel and will screen off the content in the page. 

Some default Bootstrap components (fixed navbar, modals, popover, tooltips) will remain above the backdrop, including the navbar component. This is by design and is due to basing the SidePanelCollapse z-index values on Bootstrap's `$zindex-fixed` variable. 


### The Irrevocable Opening

Bootstrap's collapse functionality underlies the open and close transitions.

Consequently, this means that the open and close behavior is fundamentally dependent on how Bootstrap behaves. And in Bootstrap, once the open transition has been started, it cannot be stopped. It is irrevocable. Any programmatic attempt to interrupt the transition in progress, or to cancel it once it has started, will be ignored. Once the opening transition has begun, it cannot be closed until it has finished opening.

This is a bootstrap  ~~limitation~~ [condition][BS-javascript].

From the user experience perspective, however, this is not ideal. It is a reasonable and likely possibility that a person might initiate opening the side panel and then immediately want to (or at least try to) close the panel.

To account for this uninterruptibility, SidePanelCollapse makes the design decision that if an action to close the panel is made while it is opening (e.g. the ESC, the closing command will be queued once. Then, when the open transition has completed, it will immediately be closed very quickly (fast duration).

Queuing is only done for actions while the panel is opening, and not for actions when it is closing.

Of course, this irrevocability is also true of the closing transition. But since closing has a different user expectation, it generally will not be an issue.


## Closing the Side Panel

Once it is open, there are four regulated ways to close the side panel:
1. A close button
1. The ESCAPE key
1. Clicking the backdrop
1. Clicking a link (in the panel)

The first three of these are mostly straightforward. The fourth is not.


### A Close Button

SidePanelCollapse allows for a close `<button>` element within the vertical panel or on the page. For example, in the demos, this is the glyph "X" in the side header bar that overlaps and covers the opening menu glyph (&#9776;).

The default CSS selector for the close button is `.sidePanel-close`. Give the option `sidepanelCloseElement` a custom CSS selector on initialization to target a differently-named closing element that adheres to the Bootstrap collapse `.navbar-toggler` requirements. Or it can be given a value of `false`. In that case, no separate close button will be initialized by the library, and the other closing methods can be relied upon. 

Clicking the close button will close the side panel at the normal duration speed.

**Caution**: The toggle button used to first open the side panel will close the panel when clicked (if it is visible and not covered). Activating it calls directly to bootstrap.js. However, when it closes, it will not clean up the page properly. Notably, the backdrop will remain. This is something to change in [a future iteration](#roadmap).


### The ESCAPE Key

When the sidepanel is open, pressing the "ESC" key will close at the normal duration speed.


### Clicking the Backdrop

The panel will also close – at normal duration – if the backdrop is clicked. This covers clicking anywhere in the page window other than within the side panel element itself.


### Clicking a Link

Clicking a link in the side panel will also close the panel, but not like the other three behaviors. Special behavior in SidePanelCollapse is available for links.

When the `handleLinks` setting is `true`, SidePanelCollapse will add an interstitial behavior to HTML links that are in the side panel element. Specifically, only <a> elements that are descendants of `sidepanelElement`. When one of these links is clicked, the following sequence is followed:
1. The default link action is blocked.
1. The side panel will be closed using the 'fast' duration setting.
1. When the close transition is complete, then the browser will be sent to the `href` destination of the link.

The setting `handleLinks: false` disables this behavior. Do this if, say, your project's side bar is not for navigation.


#### Links and the User Experience

The design intent behind managed links is to provide a subtly more sophisticated user experience.

If `handleLinks = false`, the link action will happen in the usual unmodified manner of links – immediately. Typically this means that the browser will leave the current page as-is and begin to load the link's destination URL. In the browser window, the side panel will remain open until the new destination page begins to render, and the window will 'jump cut' to the new page.

When links are handled (`handleLinks = true`, the default), the side panel will first close itself expediently and neatly before starting off to the new destination. This is a subtle communication to the end-user that the current page is exiting gracefully and helps engender trust.
















# The Demos

There are two different demo sites included in the source code to showcase using the library in different ways: simple, and advanced.

## Building the Demos

To view the working demo sites, you first need to build the demos from the source. And to build the demos, you need to have `node` and `npm`.

Begin by getting a copy of the project source locally.

1. Clone the repository, or download and unzip.
1. Open a terminal to the root of the project directory.
1. From the root, the command `npm install` will initiate the installation of all the necessary dependencies, including `gulp`. At the time of this writing, the total is about 132MB. This may take a little while.

```sh
> cd SidePanelCollapse
> npm install
```

4. When the install has completed successfully, `gulp demo` will build all of the files and start a local node-based web server to serve the web pages. 

    When the gulp tasks run, and if no errors occur, there will be a message about the web server in the stream of status messages displayed (like the one below, but your listed IP address may be different or not displayed at all).

```sh
> gulp demo

[11:11:51] Starting 'demo'...
...

Demo web server is running.
Connect to:  localhost:9191
Connect to:  192.168.1.42:9191

...
[11:12:13] Finished 'demo' after 456 ms
```

5. Now, open one of the "connect to:" addresses (they point to the same location) in your recent-model browser of choice, and a demo will display.


## The Simple Demo

Simple demo is a single page, `index-simple.html`, that exemplifies the most minimal method of using the SidePanelCollapse library in a website: linked files, no javascript, and the default settings.

### Inclusion: External Resources

The side panel library is included into the page as linked files, separate from the other CSS and javascript files.


### Initialization: Via Data Attribute

The side panel is enabled for Bootstrap's collapse via data-attributes, and also initialized by SidePanelCollapse using the data-attribute option.

### Configuration: Defaults

All of the default SidePanelCollapse settings are used for configuration.



## The Advanced Demo

The "advanced demo" (for want of a preferable name) is a more complex example of using SidePanelCollapse. It has a top-level home page, `index.html`, and a couple of interior pages. Although these are all individual page files, the site is structured as a primordial single page application in that all of the pages rely on a single common javascript file with a simplistic routing mechanism to run different functions depending on the page.

In this demo, SidePanelCollapse is incorporated into the site's source, is initialized programmatically, and has custom configuration settings.

### Inclusion: Integrated

The SCSS and javascript sources are incorporated into the site's build process, and become part of the final .css and .js files respectively.

For the SCSS, the source is included by an `import` directive in `site.scss`, and `gulp` tasks compile the composite CSS file.

```scss
@import "sidePanelCollapse";
```

For the javascript, the beginning of the site's standalone script loads SidePanelCollapse.js. 

```js
window.SidePanelCollapse = require("SidePanelCollapse");
```

### Initialization: Via Javascript

SidePanelCollapse is instantiated and initialized differently for each page. Currently, the site script distinguishes between the index page and the interior pages.

### Configuration: Custom

Configuration settings differ for the home page and the interior pages. This isn't necessary to do, and might even be a poor user experience practice for a site, but is done here to illustrate the possibility.



# Building From Source


## About the Source

The library's source code is, I think, commented generously with notes written with a general perspective in mind and they attempt to explain most of the internal code behaviors. Look there for deeper details.


## Building For Development

1. Clone the repository
1. Open a terminal to the root of the project directory.
1. From the root, `npm install` will initiate installation of all the necessary dependencies, including `gulp`.

```sh
> git clone https://github.com/mmilano/SidePanelCollapse
> cd SidePanelCollapse
> npm install
```

4. When the install has completed successfully, `gulp dev` will build the all of the files, watch for changes, and start a local node-based web server for the example pages.

    If no errors occur, there will be a message about the web server within the stream of status messages (like the one below, but your listed IP address may be different or not displayed).

```sh
> gulp dev

[11:11:51] Starting 'dev'...
...

Demo web server is running.
Connect to:  localhost:9191
Connect to:  192.168.1.42:9191

...
[11:12:13] Finished 'dev' after 777 ms
```

5. Open one of the "connect to:" addresses in your recent-model browser.


### Building Just SidePanelCollapse

If all you want is a new build of just the library, there is also a task for that. Assuming everything is already installed (per **Building For Development**), open a terminal to the root of the project directory and run the `production` task.

```sh
> gulp production

```

Production builds of the library (the .js and .css files) get put into the project's `/dist` directory, in both minified and verbose (aka normal) versions. Source maps are created in the respective `/map` directories.


#### About the Production Builds

The CSS and javascript is compiled or transpiled to a browser target of `["> 0.5%"].` If you need a different target range, this value can be changed (in the gulp task file) and the files rebuilt to the new target.




# Miscellaneous

## Questions
If you have any questions, ideas, or problems, feel free to create a new [issue][project-issues].


## Roadmap

Planned and unplanned future revisions for SidePanelCollapse.

**Q2, 2019**
- npm package for installation

**Q3, 2019**
- Allow the opening button to also be the close, and not require a separate close button

**In the Backlog**
- Tests
- Method to dispose of the SidePanelCollapse object
- Functionality to prevent scroll of the document when side panel is open


### Recognitions
**Pioneers**

There are other examples in the wild demonstrating a Bootstrap horizontal collapse that I may have read when originally trying to work out how to make sideways happen. To the original authors of those: thank you for your inspiration and help.


**Attributions**

* The FPO text on the examples pages was caffeinated-ly generated by [Coffee Ipsum][CoffeeIpsum].
* Iconography in the demo open graph image by Jacob Halton from the [Noun Project][TheNounProject].



## Notes
I crafted this library in order to fill a need that I had on my own project. 

SidePanelCollapse was created and designed for a static site, a set of static HTML files. Therefore, many of the methods and behaviors are written with that assumption, and not, for example, a more dynamic site like an application where the links may have complex behaviors connected to them. Nonetheless, it should be possible to adapt to more complex contexts. Let me know if you find success or encounter issues.



[Bootstrap-home]: https://getbootstrap.com/
[BS-collapse]: https://getbootstrap.com/docs/4.3/components/collapse/
[BS-source-width]: https://github.com/twbs/bootstrap/blob/v4-dev/js/dist/collapse.js#L306
[BS-javascript]: https://getbootstrap.com/docs/4.3/getting-started/javascript/#asynchronous-functions-and-transitions
[jQuery-home]: https://jquery.com/
[Panini]: https://github.com/zurb/panini
[CoffeeIpsum]: https://coffeeipsum.com/
[TheNounProject]: https://thenounproject.com
[stochasticnotions]: https://www.stochasticnotions.com/?pk_source=github

[project-issues]: https://gitlab.com/mmilano/bootstrapHorizontalCollapse/issues