# SidePanelCollapse


SidePanelCollapse is a library that extends 
to made a side panel, vertical navigation bar.


## Background

The Bootstrap Collapse component is typically used to show and hide content in vertical manner, collapsing upwards and downwards.

[Bootstrap Collapse Component](https://getbootstrap.com/docs/4.2/components/collapse/)


While developing a new site, I wanted to add a vertical full-window navigation side bar to the project, and I was already using Bootstrap, 
so I thought that maybe 
I could use the existing component to make the navigation bar instead of adding another new code module.

Initial experiments did not work. But –
it turns out that there is a hook for horizontal collapse.

Bootstrap 4 can be used to make an element collapse horizontally.


## The Hook
The specific code of interest from Boostrap is the following fragment.

```javascript
_proto._getDimension = function _getDimension() {
    var hasWidth = $(this._element).hasClass(Dimension.WIDTH);
    return hasWidth ? Dimension.WIDTH : Dimension.HEIGHT;
};
```
[Bootstrap.js/collapse source](https://github.com/twbs/bootstrap/blob/v4-dev/js/dist/collapse.js#L306)


While vertical/height collapse is the default behavior, Bootstrap will check if the collapsing element has a 'width' class.
If so, then the width, not height, collapses. It transforms horizontally, not vertically.


Just as the Bootstrap collapse component normally shows and hides content vertically, this version will show and hide horizontally.
 
* Buttons or anchors are used as triggers that are mapped to specific elements you toggle. 
* Collapsing an element will animate the width between 0 and its full width value.



SidePanelCollapse essentially extends the default Bootstrap collapse functionality on an element to 

* provides for a custom "close" button that is separate from the button that opens the side panel
* implements different durations for the open transition and the close transitions
* custom and customizable durations for opening and closing


# What is all this other stuff, then?



The SidePanelCollapse library is itself just two files, the javascript and the css. So what are all these other files in this project?

The demo examples in this project have been extracted from a larger site I developed,
which is built around a static page generation process using Panini/handlebars.js.
Here, everything in /src_demo directory is for building the demo pages.

In addition to the handlebars partials, there are custom handlebars helpers 
(for example, creation of the page's table of contents at time of page generation by parsing the content),
and some site-specific javascript modules.

The "gallery" on the index/homepage (in the "advanced demo") is also a vestige of the larger site. I left a reduced version of it here for variety.

If you are curious, the larger parent site is at [stochasticnotions.com](https://www.stochasticnotions.com&pk_source=github).


For the purposes of this project, I have tried to distill things down to greater simplicity, and have cut down the source considerably. But I might have missed some artifacts. If some name or aspect of the demo projects seems internally inexplicable, that is probably the reason why.

Contact me if you have questions.


### Project Issues

[GitHub Issues](https://gitlab.com/mmilano/bootstrapHorizontalCollapse/issues)




# The sidepanel

## Requirements

Requirements to use the library on a site
* Bootstrap 4. Developed with version 4.3.1.
* Jquery. Developed with version 3.3.1, slim or full build. Bootstrap itself requires jquery, so this library should already be part of the site. 

Requirements to view the demos or modify the source code
* [Node.js](https://nodejs.org/) v8+.



## Installation & Using the Library

The following options are available for installing the library and using it in your own project.


### HTML Linked Files

This is the simplest way of using SidePanelCollapse, and is how the 'Simple Demo' page uses the library.

1. Clone the repository, or download and unzip.
1. Copy the `/dist` css and javascript files to an appropriate location in your own project. You can choose to use either the minified or regular versions.
If you want to provide the sourcemap files, copy those as well (maintain the /map directory structure).
1. Link to the files within your HTML document.

 ```html
<link href="path/to/css/sidePanelCollapse.min.css" rel="stylesheet"/>
   [...]
<script src="path/to/SidePanelCollapse.min.js" async></script>
```


### Incorporate Into An Existing Build Process

If your own project already has a build process, it already compiles, transpiles, and processes javascript, and it is using SCSS, then the SidePanelCollapse source files can be incorporated into your project.



1. Clone the repository, or download and unzip.
1. Copy all of the `/src` files to a location in your own project


 ```sh

src/scss/sidePanelCollapse.scss
src/scss/sidePanelCollapse/_sidePanelCollapse.scss
src/scss/vendor/_bootstrap.scss

src/js/SidePanelCollapse.js

```


For reference, 
the project's demo sites and development/build tasks use `gulp` tasks to build  the css and javascript.




### Installation via NPM
This is coming in a future iteration.




# Sidepanel Collapse Durations


### Opening
Sidepanel is configured to open using the duration
`durationShow`.



### Closing: Two Sidepanel Closing Durations

Intra-page links – Anchor Links
For a link that goes to a location within the current page,

the sidepanel is configured to close using the duration
`durationHide`

Inter-page links – Page Links
For a link that goes to another page, 
the sidepanel is configured to close using the duration
`durationHideFast`.
By default this is set to be much faster than `sidepanelDurationHide`.





Requirements

the top level of the sidepanel must have a unique css selector. By default, it is #sidePanel

the sidepanel will contain within it an HTML button element that will, when clicked, close the sidepanel. This is the complement to the 
usual Bootstrap button element for opening a collapse-able element.



The FPO content on examples pages was generated by [Bacon Ipsum](https://baconipsum.com/).



Some notes

This sidepanel was created and designed for a static site, a set of static html pages with links between the pages.
Therefore, many of the methods and behaviours are written on that assumption, and not, for example, a more dynamic site like a single-page application.
It could be adapted; maybe the next time I need something to amuse myself.


## Configuration Options

SidePanelCollapse can be passed an object of configuration options when instantiated.



| Name | Possible values | Default | Description |
| ---- | --------------- | ------- | ----------- |
| sidepanelElement      | css class name | `#sidePanel` | CSS selector for the top-level of the sidepanel |
| sidepanelCloseElement | css class name  or `false` | `.sidePanel-close` | CSS selector for the close button, containing the close icon, that should close the sidepanel. If `false`, no closing button will be used. |
| durationShow          | css transition-duration | 1.1s | Duration for opening transition.
| durationHide          | css transition-duration | 0.4s | Duration for  closing transition.
| durationHideFast          | css transition-duration | 0.13s | Duration for  _FAST_ closing transition.
| sidePanelIsOpenClass  | css class name | sidepanel-open | CSS class that is added to the document `<body>` when sidepanel shows, removed when it hides. For use in enabling any specific styles that should apply when sidepanel is open. |
| backdrop              | boolean | `true` | Whether or not a backdrop (i.e. overlay) should display behind the open sidepanel |
| backdropStyle         | "light", "dark" | "light" |  Which style of backdrop to use, corresponding to the css styles of the same name. |
| handleLinks         | boolean | true | Whether or not links in the side panel should be   |





# Dist

The css and javascript has been compiled or transpiled (respectively) to a browser target of ` ["> 0.5%"].`
If you need a different or broader target range, this value can be changed in the gulpfile and the files rebuilt to the new target.




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
When the sidepanel is open, pressing the "ESC" key will clsoe the sidepanel, using the normal duration.


### Clicking the backdrop
the sidepanel will also close if the backdrop is "clicked" (i.e. anywhere in the page window other than the sidepanel iteself).




# The Irrevocable Opening

The sidepanel uses the Bootstrap collapse functionality to open the panel.
Therefore, boostrap.js functions handle the 

Unfortunately, this means that once the open transition has been started, 
it cannot be stopped. it is irrevocable.

Any programmatic attempt to interrupt the transition or cancel it will be ignored.


This means that once the opening transition has begun, 
it cannot be closed until it has finished opening.

This ia an existing bootstrap  ~~limitation~~ condition.


In order to work with this behavior,
SidePanelCollapse makes the design decision that if the person tries to close the sidepanel while it is opening, the command to close will be queued.

Then, when the open transition is completed, the sidepanel will immediately be closed very, very quickly.





# Demo examples

There are two "sites" included in the project
to help demonstrate using the library in different ways.

## Building the demos

To view the working demo sites, you first need to build the demo pages from the source.

You need to have npm installed already.
If you need to install npm, see: *****

Begin by having the project source locally. 
See "Installation" (above) for notes on options for getting a copy of the project.

```sh

> cd SidePanelCollapse
> npm install
> gulp demo

```

Then, open a terminal to the root of the project directory.

From the root of the project, the command `npm install` will initiate the installation of all the necessary dependencies. At the time of this writing, the total is about 132MB. This may take a little while.

When the install command has completed,
then `gulp demo` will build the all of the demo files.

If no errors occur, 
there will be a message about the demo webserver (like the one below) within the stream of status messages displayed.

```sh

[11:11:51] Starting 'demo'...
...

Demo webserver is running.
Connect to: localhost:9191
Connect to: 192.168.1.42:9191

...
[11:12:13] Finished 'demo' after 456 ms

```


Now, open either of the urls (they point to the same location) in your recent-model browser of choice, and the demo page will display.



## Simple Demo

This is a single page demo, 
intended to demonstrate the most minimal method of using the SidepanelCollapse library in a website.

### Linked files
The sidepanel library is included into the page as linked files,
seperate from the page's other css and javscript files.


```html
...
<link href="/demo/public/css/sidePanelCollapse/sidePanelCollapse.min.css" rel="stylesheet">
<link href="./public/css/site-simple.css" rel="stylesheet">
...
<script src="/demo/public/js/sidePanelCollapse/sidePanelCollapse.min.js"></script>
<script src="./public/js/site-simple.js"></script>
...

```

### Javascript Initializtion


* All of the default SidePanelCollapse settings are used for configuration.
* On the page, the sidepanel menu displays at all window sizes




# Advanced Demo

This is a more complex 

The sidepanel scss and javascript sources are incorporated into the build process,
and become part of the compiled .css and .js files respectively.
There is only one final javascript and only one final css file that is used.

For the scss, the source is included by an scss directive in `site.scss`, and `gulp` tasks assemble and compile the composite css file.

```scss
@import "sidePanelCollapse";

```


For the javascript, 
the beginning of the site's standalone script requires `SidePanelCollapse.js`, and the SidePanel itself is initialized later in code specific to each page.
A `gulp` task uses `browserify` and `babel` to make the final `site.js`.

```js
// make sidepanel available as global
window.SidePanelCollapse = require("SidePanelCollapse");

```




On the initial index page, the sidepanel menu displays only at large window sizes or smaller; at extra-large, the primary navigation displays in a row.

On the sub-pages, the sidepanel menu displays at all window sizes.




## Future ToDos
- npm package for library
- tests

- allow the opening menu to also be the close, and no separate close element
- the sidepanel can be on the right OR the left side of the window
- function to dispose of the sidepanel

- setting to make the sidepanel modal when open, which will prevent any scroll of the document when panel is open




## points to add

when copying the /dist files, include the respective files in /map
if you also want the sourcemaps



# Side Panel Links

if the `handleLinks` setting is `true`, SidePanelCollapse will add an interstitial behavior to HTML links in the side panel element.
When a handled link is clicked, the side panel will first be closed using the 'Fast' duration setting, and then the browser will be sent to the existing `href` destination of the link.

The design intent with this functionality is to provide a subtlely more sophisticated user experience. 

If links are not handled (`handleLinks = false`), the link action will happen in the usual manner – immediately. Typically this means that the browser will leave the current page as-is and begin to load the the link's destination URL. Visibly, the side panel will remain open until the new destination page begins to render, and the window will 'jump' to the new page.

When links are handled (`handleLinks = true`), the side panel will first close itself, communicating the idea that the current page is exiting gracefully.

