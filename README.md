# SidePanelCollapse

SidePanelCollapse is a library that extends Bootstrap 4 to made a vertical navigation bar open and close with added features.


## Contents
* [Background](#background)
* [Library Requirements](#sidePanelCollapse-library-requirements)
* [Installation](#installation)
* [The Demos](#the-demos)
* [Using the Library](#using-the-library)




# Background

The [Bootstrap Collapse Component][BS-collapse] is typically used to show and hide content in vertical manner, collapsing upwards and downwards.

While developing a project site, I wanted to add a vertical full-window navigation side bar to the project and I was already using Bootstrap, so I thought that maybe I could use the existing component to make the navigation bar instead of adding another code package to the project or writing something new (of course, what I ended up writing is this library, so maybe this became a rabbit hole...).

Initial experiments did not work. But – it turns out that it is possible.

Bootstrap 4 can be used to make an element collapse horizontally.


## The Hook

The relevant code from Bootstrap is the following fragment:

```javascript
_proto._getDimension = function _getDimension() {
    var hasWidth = $(this._element).hasClass(Dimension.WIDTH);
    return hasWidth ? Dimension.WIDTH : Dimension.HEIGHT;
};
```
([Bootstrap.js/collapse source][BS-source-width])

Vertical/height collapse is the default behavior, but Bootstrap will check if the collapsing element has a `width` class. If so, then the width, not height, collapses between 0 and its full width value. It transforms horizontally, not vertically.


## SidePanelCollapse Goes Sideways

SidePanelCollapse starts from this buried possibility and augments the normal behavior of Bootstrap collapse to create a side panel that will show and hide horizontally.
 
Then, going beyond simple horizontal movement, SidePanelCollapse extends the collapse functionality to create a more nuanced user experience. 

### Features:
* Different and customizable durations for the open transition and the close transitions.
* Special optimized closing behavior when a link in the side panel is clicked.
* A backdrop that overlays the page when the side panel is open.
* A provisions for a custom "close" button that is separate from the button that opens the side panel.
* Allows the end-user to close the sidepanel with the close button, a tap on the backdrop, or the ESC key.



# Wot's all this, then?

The SidePanelCollapse library is itself just two files, one javascript and one css. So what are all these other files in this project?

Everything in the `/src_demo` directory is for the demonstration examples. The demos have been derived from a larger site I developed which is built around a static page generation process using Panini/handlebars.js. 

In addition to the handlebars partials, there are custom handlebars helpers (for example, `page-toc.js` generatively creates the page's table of contents when the page is built), site-specific javascript modules, and other supporting files. The data-file-driven "gallery" on the advanced demo's index/homepage is also a vestige of the larger site; I left a reduced version of it here for variety.

If you are interested, the larger parent site is at [stochasticnotions.com][stochasticnotions]

For the purposes of this project, I have tried to distill things down to greater simplicity, and have cut down the source considerably. But I might have missed some artifacts. If some aspect of the demo projects seems internally inexplicable, that is probably the reason why.

Feel free to contact me if you have questions.



# SidePanelCollapse Requirements

Minimum requirements to use the library on a site.

## Tech Requirements

* [Bootstrap 4.x][Bootstrap-home]. The library was developed with version 4.3.1, but it may work with earlier 4.x versions.
* [Jquery 3.x][Jquery-home]. Developed with version 3.3.1, slim build. Bootstrap itself requires jquery, so this library should already be part of the site. 

There are additional requirements to build/view the demos or work with the source code:
* [Node](https://nodejs.org/), v8+.
* npm, which is generally installed with node


## HTML Page Requirements

In order to work, the side panel HTML element must be set up as a valid Bootstrap collapse component, either with data attributes or programmatically.

The side panel HTML element itself must have the `width` class.

```html
<div class="sidepanel width collapse" id="sidePanel">
    [...]
</div>
```

There should also be a Bootstrap button configured to open the collapse element.

```html
<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#sidePanel" aria-controls="sidePanel" aria-expanded="false" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon"></span>
</button>
```




# Installing the Library

Installation for SidePanelCollapse means installing the library into a web project. The following options are available for using the library in your own project.


### Option A: External Linked Files

This is the simplest way of using SidePanelCollapse, and it is how the 'Simple Demo' page uses the library. The required javascript and css files are added to the HTML page(s) as external resources.

 ```html
 <head>
    <link href="path/to/css/sidePanelCollapse.min.css" rel="stylesheet"/>
</head>
<body>
    [...]
    <script src="path/to/SidePanelCollapse.min.js" async></script>
</body>
```


1. Clone the repository, or download and unzip.
1. Copy the `/dist` sidePanelCollapse css and javascript files to an appropriate location in your own project. You can choose to use either the minified or regular versions.
If you also want the sourcemap files, copy those as well (maintain the `/map` directory structure so that the browser can find the map files).
1. Add the `<link>` and `<script>` tags to your HTML document, like the sample above.

The simple demo site uses this option. See [Simple Demo](#the-simple-demo) for more details.

### Option B: Incorporate Into an Existing Build Process

If your own project already has a build process, it already compiles, transpiles, and processes javascript, and it is using SCSS, then the SidePanelCollapse source files can be incorporated into your project.

1. Clone the repository, or download and unzip.
1. Copy all of the `/src` sidePanelCollapse javascript and SCSS files to a location in your own project. Namely:
 ```sh
src/
    scss/
        sidePanelCollapse.scss
        sidePanelCollapse/
            _sidePanelCollapse.scss
        vendor/
            _bootstrap.scss

src/
    js/
        SidePanelCollapse.js
```

3. If Bootstrap 4 is not already in your project's dependencies, add it. E.g.
`npm install --save-dev bootstrap`. SidePanelCollapse's SCSS references one or two Bootstrap variables, and so the whole thing needs to be available (which it is in the demo, via `node-modules`).
1. You will need to add the appropriate directives to include or require the source files into your own source.
    - For SCSS, this will be an SCSS import. 
    - For javascript, this will be whatever method you are already using (e.g. `require` or `import`).

```scss
    scss:
    @import "sidePanelCollapse";
```
```js
    javascript:
    SidePanelCollapse = require("SidePanelCollapse");
```
The advanced demo site uses this method. See [Advanced Demo](#the-advanced-demo) for more details.


### Option C: Node/NPM

_This will be an option in the future. It will work similarly to Option B, but with less manual file copying._





# Using the Library

## Requirements To Use SidePanelCollapse

To begin with, you should have a side panel containing some content that you want to show and hide.

* The top level of the side panel must have a unique css selector. By default, it is `#sidePanel`.
* The side panel must be initialized in SidePanelCollapse before it will function correctly. Either passively via a data-attribute or manually via javascript.
* There should be an HTML button element that will, when clicked, close the sidepanel. This is the complement to the usual Bootstrap button element for opening a collapse-able element. This isn't a technical requirement, but a user-centered design requirement.


## Initialization

### Via data attributes

Add the boolean attribute `data-sidepanel-collapse` on the side panel HTML element to have the side panel activated automatically when the page loads.

Data attribute activation will use the default settings. Custom configurations are only available via javascript initialization.

```html
<div class="sidepanel sidenav width collapse" id="sidePanel" data-sidepanel-collapse>
    ...
</div>
```

### Via Javascript

Activate SidePanelCollapse manually by creating a new SidePanelCollapse instance.

```js
sidepanel = new SidePanelCollapse(options);
```

Setting custom configuration options is only available via javascript initialization. See [Configuration Options](#configuration-options) for details.



## Configuration Options

SidePanelCollapse can be initialized with custom configuration options. Any options not specified will use the default value.

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
| `sidepanelElement`      | css class name | `#sidePanel` | CSS selector for the top-level of the sidepanel. |
| `sidepanelCloseElement` | css class name  or `false` | `.sidePanel-close` | CSS selector for the close button, containing the close icon, that should close the sidepanel. If `false`, no closing button will be used by the library. |
| `durationShow`          | css transition-duration | `1.1s` | Duration for the opening transition.
| `durationHide`          | css transition-duration | `0.35s` | Duration for the standard closing transition.
| `durationHideFast`          | css transition-duration | `0.13s` | Duration for  _FAST_ closing transition.
| `sidePanelIsOpenClass`  | css class name | `sidepanel-open` | CSS class that is added to the document `<body>` when sidepanel shows, removed when it hides. For convenient use in enabling any specific styles that should apply when sidepanel is open. |
| `backdrop`              | boolean | `true` | Whether or not a backdrop (i.e. overlay) should display behind the open sidepanel. |
| `backdropStyle`         | "light", "dark" | `light` |  Which style of backdrop to use, corresponding to the css styles of the same name. |
| `handleLinks`         | boolean | `true `| Whether or not links in the side panel should be handled in a special manner by the library. See [Closing The Side Panel](#closing-the-side-panel) for details.  |


⚠️**Caveat Developer**: 
During intialization, if the `sidepanelElement` HTML element cannot be found in the document, a (browser console message will display and the side panel will not be created. Otherwise, it will be created – whether or not the custom values are valid.

Any custom settings should be manually verified and validated for the context. For example, the durations are required to be valid css transition-duration values. If they are not, there may not be any message or indication that something is awry, but the side panel will not function correctly.


# The Behavior of SidePanelCollapse
## About the Options

### Durations

SidePanelCollapse implements different transition durations for regular opening and closing the panel, and has an additional duration for closing very fast.

#### Opening

The Sidepanel opens using the duration value `durationShow`. The default value chosen is felt to be a good balance between two qualities: fast enough to be prompt and attentive, but not too fast that it feels pugnacious.


#### Closing

There are two closing durations: "normal", or standard, and "fast".

##### Closing Normally

When the side panel is closed using the close button, clicking the backdrop, or using the keyboard (the ESCAPE key), the sidepanel closes using the duration value `durationHide`. 


The default hide duration is chosen to be fast enough to get out of the way quickly.

to optimize the user experience
be fast enough to get out of the way 

##### Closing Fast

Inter-page links – Page Links
For a link that goes to another page, 
the sidepanel is configured to close using the duration
`durationHideFast`.
By default the fast duration is about 1/3 of the standard duration.



#### Timing and The User Experience
Normal Bootstrap collapse behavior is to use a single duration for opening and closing.
SidePanelCollapse's founding reason for existence is to override this behavior and implement different durations for closing in different scenarios. This is to provide a better end-user experience.

 When interacting with an element like a side navigation bar, a person has a (moderate) psychological tolerance for the total time it takes to respond to their request to view the side bar; i.e. to open and display. This person (here, the paradigmatic "user") actively makes the action to open the side panel, and when they do that, their attention shifts to the results of the action. So the behavior of the panel becomes their primary focus – it is in their mental spotlight. Respond too slow, and dissatifaction blooms. Too fast, and it feels aggressive.

On the flip side, psychological response time tolerance decreases significantly when the action is  closing the side navigation. 

On choosing and acting to close the panel, mental focus shifts back to the page itself, whether it is a task-based application or textual content. Once the focus is on the main page, the side navigation becomes secondary and it needs to get out of the way, to disappear. If it closes too slowly, it does not fulfill mental expectations and intrudes negatively on focus. Closing quickly is what the person wants, but too quickly and it also creates an unconscious negative impression, in this case of being a detail that was left unmanaged.








## Closing the Side Panel

There are four built-in ways to close the sidepanel once it is open:
1. The close button &#9447;
1. The ESCAPE key
1. Clicking the backdrop
1. Clicking a link in the sidepanel

Three of these are straightforward. One is not.

### The Close Button

SidePanelCollapse makes the assumption that there is a close `<button>` element either within the sidepanel or on the page. In the example demos, this is the glyph "X" in the sidepanel header bar that overlaps and covers the opening menu glyph &#9776; (the "sandwich").

The settings option `sidepanelCloseElement` can be given a css selector to specify a closing element
that adheres to the regular Bootstrap collapse `.navbar-toggler` behavior.

Activating the close button will close the sidepanel at the normal duration speed.


### The ESCAPE Key

When the sidepanel is open, pressing the "ESC" key will close the sidepanel at the normal duration speed.


### Clicking the Backdrop

The sidepanel will also close – at normal duration – if the backdrop is clicked. This covers anywhere in the page window other than the sidepanel itself.


### Clicking a Link


#### The Irrevocable Opening

The side panel uses Bootstrap's collapse functionality to open the panel. That means that the bootstrap.js functions manage the transitions.

Consequently, this also means that once the open transition has been started, it cannot be stopped. It is irrevocable. Any programmatic attempt to interrupt the transition in progress, or to cancel it once it has started, will be ignored. Once the opening transition has begun, it cannot be closed until it has finished opening.

This is a bootstrap  ~~limitation~~ condition.

From the user experience perspective, however, this is not ideal.
It is a valid possibility that a person might initiate opening the side panel but immediately want to close the panel.

To account for this case, SidePanelCollapse makes the design decision that if an action to close the sidepanel is made while it is opening, the closing command will be queued once. Then, when the open transition is completed, the sidepanel will immediately be closed very quickly.


#### Side Panel Links and the User Experience

if the `handleLinks` setting is `true`, SidePanelCollapse will add an interstitial behavior to HTML links in the side panel element. When one of these links is clicked, the side panel will first be closed using the 'Fast' duration setting, and then the browser will be sent to the existing `href` destination of the link.

The design intent with this functionality is to provide a subtly more sophisticated user experience.

If links are not handled (`handleLinks = false`), the link action will happen in the usual manner of links – immediately. Typically this means that the browser will leave the current page as-is and begin to load the link's destination URL. Visibly, the side panel will remain open until the new destination page begins to render, and the window will 'jump' to the new page.

When links are handled (`handleLinks = true`, the default), the side panel will first close itself expediently and neatly, communicating that the current page is exiting gracefully.




## About the Source

The library's source code is, I think, generously commented, and is written with the general third-person perspective in mind. It attempts to explain most of the internal code behaviors.



----------------


# The Demos

There are two demo sites" included in the project to illustrate using the library in different ways: simple, and advanced.

## Building the Demos

To view the working demo sites, you first need to build the demos from the source. And to build the demos, you need to have `node`, `npm`, and then `gulp` installed.

Begin by getting a copy of the project source locally.

1. Clone the repository, or download and unzip.
1. Then, open a terminal to the root of the project directory.
1. From the root of the project, the command `npm install` will initiate the installation of all the necessary dependencies. At the time of this writing, the total is about 132MB. This may take a little while.

```sh
> cd SidePanelCollapse
> npm install
```

4. When the install command has completed, `gulp demo` will build the all of the files and start a local node-based webserver to serve the web pages.

When the gulp tasks run, and if no errors occur, there will be a message about the webserver (like the one below, but your listed IP address may be different or not displayed) within the stream of status messages displayed.

```sh
> gulp demo

[11:11:51] Starting 'demo'...
...

Demo webserver is running.
Connect to:  localhost:9191
Connect to:  192.168.1.42:9191

...
[11:12:13] Finished 'demo' after 456 ms
```

5. Now, open one of the "connect to:" addresses (they point to the same location) in your recent-model browser of choice, and the demo will display.

There are two different demos (and they have a link to each other).

## The Simple Demo

Simple demo is a single page, `index-simple.html`, that exemplifies the most minimal method of using the SidePanelCollapse library in a website: linked files, no javascript, and the default settings.

### Inclusion: Linked Files

The sidepanel library is included into the page as linked files, separate from the page's other css and javascript files.

```html
...
<link href="./public/css/sidePanelCollapse/sidePanelCollapse.min.css" rel="stylesheet">
<link href="./public/css/site-simple.css" rel="stylesheet">
...
<script src="./public/js/sidePanelCollapse/sidePanelCollapse.min.js"></script>
<script src="./public/js/site-simple.js"></script>
...
```

### Initialization

The side panel is initialized using the data-attribute option.


### Configuration

All of the default SidePanelCollapse settings are used for configuration.



## The Advanced Demo

The "advanced demo" (for want of a preferable name) is a more complex example of using SidePanelCollapse. It has a top-level home page, `index.html`, and a couple of interior pages. Although these are all individual page files, the site is structured as a primordial single page application in that all of the pages rely on a single common javascript file with a simplistic routing mechanism to run different methods depending on the page.

In this demo, SidePanelCollapse is incorporated into the site's source, is initialized programmatically, and applies custom configuration settings.

### Inclusion: Integrated

The sidepanel SCSS and javascript sources are incorporated into the site's build process, and become part of the final  .css and .js files respectively.

For the SCSS, the source is included by an `import` directive in `site.scss`, and `gulp` tasks assemble and compile the composite css file.

```scss
@import "sidePanelCollapse";
```

For the javascript, the beginning of the site's standalone script require's SidePanelCollapse.js. 

```js
// make sidepanel available as global
// this isn't strictly necessary, depending on how your site is structured, 
// but makes development investigation easier
window.SidePanelCollapse = require("SidePanelCollapse");
```

Later in the script timeline the SidePanel itself is initialized in code specific to each page.

When building the site, a `gulp` task assembles the final `site.js` using `browserify`, `babel` and some other tools.


### Initialization

The side panel is initialized programmatically when each page loads.

### Configuration

The side panel is configured differently for the home page and the interior pages.

This isn't necessary to do, and even might be a poor user experience practice, but is done here to demonstrate the possibility.



### Other Details of the Advanced Demo

On the index page, the sidepanel menu displays only at large (in the Bootstrap breakpoint definition) window sizes or smaller; at extra-large, the primary navigation displays in-page anchor links in a row. The anchor links scroll to their respective sections, but the side panel items are links to the interior pages.

On the interior pages, the sidepanel menu always displays.


# Miscellaneous

## Project Roadmap

Planned future revisions for SidePanelCollapse.

#### Q2, 2019
- npm package for installation

#### In the Backlog
- Tests
- Allow the opening button to also be the close, and not require a separate close element
- Method to dispose of the sidepanel
- Functionality to prevent scroll of the document when side panel is open





# Notes

I originally cobbled this library together in order to fill a need that I had on my own project. 


SidePanelCollapse was created and designed for a static site, a set of static html pages with links between the pages. Therefore, many of the methods and behaviors are written on that assumption, and not, for example, a more dynamic context like an application where the links may have complex behaviors connected to them. It should be possible to adapt to more complex contexts. Let me know if you find success or encounter issues.



##### Demo FPO content
The FPO text on the examples pages was caffeinated-ly generated by [Coffee Ipsum][CoffeeIpsum].

##### Pioneers
There are other examples in the wild demonstrating a Bootstrap horizontal collapse that I may have read when originally trying to work out how to make sideways happen. To the original authors of those: thank you for your inspiration and help, direct or indirect.



## Building the Library


### About The Production Builds

Production builds of the library (the .js and .css files) are in the project's `/dist` directory, both minified and verbose (aka normal) versions. Sourcemaps are in the associated `/map` directories.

The css and javascript has been compiled or transpiled to a browser target of ` ["> 0.5%"].` If you need a different target range, this value can be changed in the gulp task file and the files rebuilt to the new target.

See [Building The Project](#building-the-project) for more details.





### Project Issues

[GitHub Issues](https://gitlab.com/mmilano/bootstrapHorizontalCollapse/issues)




[Bootstrap-home]: https://getbootstrap.com/
[BS-collapse]: https://getbootstrap.com/docs/4.2/components/collapse/
[BS-source-width]: https://github.com/twbs/bootstrap/blob/v4-dev/js/dist/collapse.js#L306
[Jquery-home]: https://jquery.com/
[CoffeeIpsum]: https://coffeeipsum.com/

[stochasticnotions]: https://www.stochasticnotions.com&pk_source=github