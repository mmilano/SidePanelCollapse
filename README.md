# SidePanelCollapse

SidePanelCollapse is a library that extends Bootstrap 4 to made a vertical navigation bar open and close with added features.


## Background

The Bootstrap Collapse component is typically used to show and hide content in vertical manner, collapsing upwards and downwards.

[Bootstrap Collapse Component][BS-collapse]

While developing a new site, I wanted to add a vertical full-window navigation side bar to the project, and I was already using Bootstrap, so I thought that maybe I could use the existing component to make the navigation bar instead of adding another new code module.

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

While vertical/height collapse is the default behavior, Bootstrap will check if the collapsing element has a 'width' class. If so, then the width, not height, collapses. It transforms horizontally, not vertically.


## SidePanelCollapse Goes Sideways

So, while Bootstrap collapse normally shows and hides content vertically, SidePanelCollapse augments the normal behavior to create a side panel that will show and hide horizontally.
 
* Collapsing an element will animate the width between 0 and its full width value.

In addition, SidePanelCollapse extends the default collapse functionality to:

* Implement different, custom, and customizable durations for the open transition and the close transitions.
* Add an optional backdrop that screens the rest of the page when the side panel is open.
* Provide for a custom "close" button that is separate from the button that opens the side panel.
* Allow the use to close the sidepanel with: the close button, a click on the backdrop, or the ESC key.



# Wot's all this, then?

The SidePanelCollapse library is itself just two files, one javascript and one css. So what are all these other files in this project?

Everything in the `/src_demo` directory is for the demonstraion examples. The demos have been derived from a larger site I developed which is built around a static page generation process using Panini/handlebars.js. 

In addition to the handlebars partials, there are custom handlebars helpers (for example, `page-toc.js` generatively creates the page's table of contents when the page is built), site-specific javascript modules, and other supporting files. The data-file-driven "gallery" on the advanced demo's index/homepage is also a vestige of the larger site; I left a reduced version of it here for variety.

If you are interested, the larger parent site is at [stochasticnotions.com][stochasticnotions]

For the purposes of this project, I have tried to distill things down to greater simplicity, and have cut down the source considerably. But I might have missed some artifacts. If some aspect of the demo projects seems internally inexplicable, that is probably the reason why.

Feel free to contact me if you have questions.



# Requirements

## Tech Requirements

Minimum requirements to use the library on a site:
* Bootstrap 4. The library was developed with version 4.3.1, but it probably will work with 4.x versions.
* Jquery. Developed with version 3.3.1, slim or full build. Bootstrap itself requires jquery, so this library should already be part of the site. 

Requirements to view the demos or work with the source code:
* [Node](https://nodejs.org/), v8+.
* `npm`, which is generally installed with node


## HTML Page Requirements

In order to work, the side panel HTML element should be set up as a Bootstrap collapse component, either with data attributes or programmatically. 

There should be an existing Bootstrap button configured to open the collapse element.

```html
<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#sidePanel" aria-controls="sidePanel" aria-expanded="false" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon"></span>
</button>
```

The side panel itself must have the `width` class.

```html
<div class="sidepanel width collapse" id="sidePanel">
    [...]
</div>
```



# Installation

The following options are available for using the library in your own project.


### HTML Linked Files

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



### Incorporate Into An Existing Build Process

If your own project already has a build process, it already compiles, transpiles, and processes javascript, and it is using SCSS, then the SidePanelCollapse source files can be incorporated into your project.


1. Clone the repository, or download and unzip.
1. Copy all of the `/src` sidePanelCollapse javascript and SCSS files to a location in your own project.
1. If Bootstrap 4 is not already in your project's dependencies, add it. E.g.
`npm install --save-dev bootstrap`. SidePanelCollapse's SCSS references one or two Bootstrap variables, and so the whole thing needs to be available (which it is in the demo, via `node-modules`).

 ```sh
src/scss/sidePanelCollapse.scss
src/scss/sidePanelCollapse/_sidePanelCollapse.scss
src/scss/vendor/_bootstrap.scss

src/js/SidePanelCollapse.js
```

4. You will need to add the appropriate directives to include or require the source files into your own source.
For SCSS, this will be an SCSS import.

```scss
    @import "sidePanelCollapse";
```
For javascript, this will be whatever method you are already using (e.g. `require` or `import`).
```js
    SidePanelCollapse = require("SidePanelCollapse");
```

For reference, the advanced demo site uses this method. See [Advanced Demo](#the-advanced-demo) for more details.


### Installation via NPM

This is coming in a future iteration.



# Using the Library

## Sidepanel Durations

SidePanelCollapse implements different transition durations for opening and closing the panel, along with an additional duration for closing very fast.


### Opening

The Sidepanel will open using the duration value
`durationShow`.


### Closing

Two closing durations are used: "standard" and "fast".

#### Closing 

When the side panel is closed using the close button, clicking the backdrop, or using the keyboard (the ESCAPE key), the sidepanel closes using the duration value `durationHide`.


#### Closing Fast

Inter-page links – Page Links
For a link that goes to another page, 
the sidepanel is configured to close using the duration
`durationHideFast`.
By default the fast duration is about 1/3 of the standard duration.





Requirements

the top level of the sidepanel must have a unique css selector. By default, it is #sidePanel

the sidepanel will contain within it an HTML button element that will, when clicked, close the sidepanel. This is the complement to the 
usual Bootstrap button element for opening a collapse-able element.



The FPO content on examples pages was caffeinated-ly generated by [Coffee Ipsum][CoffeeIpsum].




## Configuration Options

SidePanelCollapse can be initialized with an object of configuration options.



| Name | Possible values | Default | Description |
| ---- | --------------- | ------- | ----------- |
| `sidepanelElement`      | css class name | `#sidePanel` | CSS selector for the top-level of the sidepanel |
| `sidepanelCloseElement` | css class name  or `false` | `.sidePanel-close` | CSS selector for the close button, containing the close icon, that should close the sidepanel. If `false`, no closing button will be used. |
| `durationShow`          | css transition-duration | `1.1s` | Duration for the opening transition.
| `durationHide`          | css transition-duration | `0.4s` | Duration for the standard closing transition.
| `durationHideFast`          | css transition-duration | `0.13s` | Duration for  _FAST_ closing transition.
| `sidePanelIsOpenClass`  | css class name | `sidepanel-open` | CSS class that is added to the document `<body>` when sidepanel shows, removed when it hides. For convenient use in enabling any specific styles that should apply when sidepanel is open. |
| `backdrop`              | boolean | `true` | Whether or not a backdrop (i.e. overlay) should display behind the open sidepanel |
| `backdropStyle`         | "light", "dark" | `light` |  Which style of backdrop to use, corresponding to the css styles of the same name. |
| `handleLinks`         | boolean | `true `| Whether or not links in the side panel should be   |



# About The Production Builds

Production builds of the library (the .js and .css files) are in the project's `/dist` directory, both minified and verbose (aka normal) versions. Sourcemaps are available in the associated `/map` directories.

The css and javascript has been compiled or transpiled to a browser target of ` ["> 0.5%"].` If you need a different target range, this value can be changed in the gulp task file and the files rebuilt to the new target.

See [Building The Project](#building-the-project) for more details.



## Closing the Sidepanel

There are three default ways to close the sidepanel once it is open
1. the close button
1. the ESCAPE key
1. clicking the backdrop
1. clicking a link in the sidepanel

### Close Button

SidePanelCollapse is designed on the assumption that there is a "close' `<button>` element within the sidepanel.

In the example demos, this is the "x" glyph in the sidepanel header bar that overlaps and covers the opening menu glyph (the "sandwich").

The "sidepanelCloseElement" option can be given a css selector to specify a custom closing element
that adheres to the regular Bootstrap collapse `.navbar-toggler` behavior.



### The ESCAPE key
When the sidepanel is open, pressing the "ESC" key will close the sidepanel, using the normal duration.


### Clicking the backdrop


the sidepanel will also close if the backdrop is "clicked" (i.e. anywhere in the page window other than the sidepanel itself).




# The Irrevocable Opening

The sidepanel uses the Bootstrap collapse functionality to open the panel. Therefore, bootstrap.js functions handle the 

Unfortunately, this means that once the open transition has been started, 
it cannot be stopped. it is irrevocable.

Any programmatic attempt to interrupt the transition or cancel it will be ignored.


This means that once the opening transition has begun, it cannot be closed until it has finished opening.

This ia an existing bootstrap  ~~limitation~~ condition.

In order to work with this behavior,
SidePanelCollapse makes the design decision that if the person tries to close the sidepanel while it is opening, the command to close will be queued.

Then, when the open transition is completed, the sidepanel will immediately be closed very, very quickly.




# Demo examples

There are two "sites" included in the project to help demonstrate using the library in different ways.

## Building the demos

To view the working demo sites, you first need to build the demo pages from the source.

You need to have npm installed already.
If you need to install npm, see: *****

Begin by having the project source locally. 
See "Installation" (above) for notes on options for getting a copy of the project.

```sh
cd SidePanelCollapse
npm install
gulp demo
```

Then, open a terminal to the root of the project directory.

From the root of the project, the command `npm install` will initiate the installation of all the necessary dependencies. At the time of this writing, the total is about 132MB. This may take a little while.

When the install command has completed, then `gulp demo` will build the all of the files and start a local node-based webserver to serve the web pages.

If no errors occur, there will be a message about the webserver (like the one below, but your own IP address may be different) within the stream of status messages displayed.

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

Now, open either of the "connect to:" addresses (they point to the same location) in your recent-model browser of choice, and the demo will display.

There are two different demo index pages, and their content has a link to each other.


## The Simple Demo

This is a single page, `index-simple.html`, that demonstrates the most minimal method of using the SidePanelCollapse library in a website via linked files, no extra javascript, and the default options.

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

The 'advanced demo' (for want of a preferable name) site is a more complex example of using SidePanelCollapse. It has a top-level home page, `index.html`, and a couple of interior pages. Although these are all individual page files, the site is structured as a primordial single page application in that all of the pages rely on a single common javascript file with a simplistic routing mechanism to run different methods depending on the page.

## Inclusion: Integrated

The sidepanel SCSS and javascript sources are incorporated into the site's build process, and become part of the final  .css and .js files respectively.

For the SCSS, the source is included by an `import` directive in `site.scss`, and `gulp` tasks assemble and compile the composite css file.

```scss
@import "sidePanelCollapse";
```

For the javascript, the beginning of the site's standalone script `requires` SidePanelCollapse.js. 

```js
// make sidepanel available as global
// this isn't strictly necessary, depending on how your site is structured, 
// but makes development investigation easier
window.SidePanelCollapse = require("SidePanelCollapse");
```

Later, the SidePanel itself is initialized in code specific to each page.

When building the site, a `gulp` task assembles the final `site.js` using `browserify`, `babel` and other tools.


### Initialization

The side panel is initialized programmatically when each page when it loads.

### Configuration

The side panel is configured differently for the home page and the interior pages.


### Other Details of the Demo

On the index page, the sidepanel menu displays only at large (in the Bootstrap breakpoint definition) window sizes or smaller; at extra-large, the primary navigation displays in-page anchor links in a row. The anchor links scroll to their respective sections, but the side panel items are links to the interior pages.

On the interior pages, the sidepanel menu always displays.



## Project Roadmap

Planned future revisions for SidePanelCollapse.

#### Q2, 2019
- npm package for library

#### In the Backlog
- Tests
- Allow the opening button to also be the close, and not require a separate close element
- Method to dispose of the sidepanel
- Functionality to prevent scroll of the document when side panel is open



## points to add




## Side Panel Links

if the `handleLinks` setting is `true`, SidePanelCollapse will add an interstitial behavior to HTML links in the side panel element.
When a handled link is clicked, the side panel will first be closed using the 'Fast' duration setting, and then the browser will be sent to the existing `href` destination of the link.

The design intent with this functionality is to provide a subtly more sophisticated user experience.

If links are not handled (`handleLinks = false`), the link action will happen in the usual manner of links – immediately. Typically this means that the browser will leave the current page as-is and begin to load the link's destination URL. Visibly, the side panel will remain open until the new destination page begins to render, and the window will 'jump' to the new page.

When links are handled (`handleLinks = true`), the side panel will first close itself expediently and neatly, communicating the idea that the current page is exiting gracefully.



# Some notes

This sidepanel was created and designed for a static site, a set of static html pages with links between the pages.
Therefore, many of the methods and behaviors are written on that assumption, and not, for example, a more dynamic site like a single-page application.
It should be possible to adapt to more complex contexts. Let me know if you find success or encounter issues.


## Building the Project




### Project Issues

[GitHub Issues](https://gitlab.com/mmilano/bootstrapHorizontalCollapse/issues)





[BS-collapse]: https://getbootstrap.com/docs/4.2/components/collapse/
[BS-source-width]: https://github.com/twbs/bootstrap/blob/v4-dev/js/dist/collapse.js#L306
[CoffeeIpsum]: https://coffeeipsum.com/

[stochasticnotions]: https://www.stochasticnotions.com&pk_source=github