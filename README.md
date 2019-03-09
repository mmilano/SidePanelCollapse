# sidebar-slide


Bootstrap 4 can be used to make an element collapse horizontally.


The Bootstrap Collapse component is typically used to show and hide content in vertical manner, collapsing upwards and downwards.

[Bootstrap Collapse Component](https://getbootstrap.com/docs/4.2/components/collapse/)


I wanted to add a vertical full-window navigation side bar to my site, and I was already using Bootstrap, so I thought that maybe
I could use the existing component to make the navigation bar instead of adding another code module to handle this.

It turns out that there is a hook for horizontal collapse.



```javascript
_proto._getDimension = function _getDimension() {
    var hasWidth = $(this._element).hasClass(Dimension.WIDTH);
    return hasWidth ? Dimension.WIDTH : Dimension.HEIGHT;
};
```
[from Bootstrap.js/collapse code](https://github.com/twbs/bootstrap/blob/v4-dev/js/dist/collapse.js#L305)


While height collapse is the default behavior, Bootstrap will check if the collapsing element has a 'width' class.
If so, then the width, not height, collapses. It transforms horizontally, not vertically.


Just as the Bootstrap collapse component normally shows and hides content vertically, 
this version will show and hide horizontally.
 
* Buttons or anchors are used as triggers that are mapped to specific elements you toggle. 
* Collapsing an element will animate the width between 0 and its full width value.




#What is all this other stuff in the project

The demo examples have been extracted from a larger site I have developed,
which includes static page generation using Panini/handlebars.js,

In addition to the handlebars partials, there are a number of handlebars helpers 
(for example, creation of the page's table of contents at time of page generation by parsing the content),
and some site-specific javascript modules.
The existence of the gallery on the index/homepage is also a vestige of the larger site; I left a reduced version of it here for variety.

The larger parent site is at [stochasticnotions.com](https://www.stochasticnotions.com).


For the purposes of this project, I have tried to distill things down to be more simple, and have cut down the source considerably. But I might have missed some artifacts. If some name or aspect of the demo projects seems internally inexplicable, that is probably the reason why.



Contact me via github with questions.


### Issues

[GitHub Issues](https://gitlab.com/mmilano/bootstrapHorizontalCollapse/issues)




The sidepanel

Requirements

* npm
* Bootstrap 4
* jquery. Bootstrap itself requires jquery, so this library should already be there.


## Installation

The following options are available:

### HTML external files

This is the most simple way of using the SidePanelCollapse, and is how the 'Simple Demo' page uses the library.

1. Download the repository,
1. unzip the package,
1. copy the /dist css and javascript files to an appropriate location,
1. and link to the files within your HTML document.

 ```html
 
<link href="path/to/css/sidePanelCollapse.min.css" rel="stylesheet"/>


<script src="path/to/SidePanelCollapse.min.js" async></script>

```


### Incorporate into an existing build process

If your own project already has a build process, it compiles, transpiles, and processes javascript, and it is using SCSS, then SidePanelCollapse source files can be added to the project's 


1. Download and unzip the package, or close the repository,
1. copy all of the src files to a location in your own project
1. 


 ```
 
src/scss/sidePanelCollapse.scss
src/scss/sidePanelCollapse/_sidePanelCollapse.scss
src/scss/vendor/_bootstrap.scss


src/js/SidePanelCollapse.js

```



### NPM and a build process
Install it via npm, and add the SCSS and javascript files to your build process

 ```bash
$ npm install sidepanelslide
```

```javascript


```



# Building the demo

To view the demo sites, you first need to **


You need to have npm installed already.
If you need to install npm, ****


Download and unzip the package, or close the repository locally,
and then open a terminal to the root of the project directory.

From the root of the project, the command `npm install` will initiate the download of all the necessary dependencies. At the time of this writing, this is about 132MB. This will take a little while.

When the install command has completed,
then `gulp demo` will build the demo files, instan

If no errors are displayed,
visit
localhost:9191
in a browser.



```shell

> cd /path/to/local/SidePanelCollapse/

> npm install

> gulp demo

```

# Sidepanel Collapse Durations


### Opening
Sidepanel is configured to open using the duration
`durationShow`.



### Closing: Two sidepanel closing durations

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

| Name | Possible values | Default | Description |
| ---- | --------------- | ------- | ----------- |
| sidepanelElement      | css class name | `#sidePanel` | css selector for the top-level of the sidepanel |
| sidepanelCloseElement | css class name  or `false` | `.sidePanel-close` | css selector for the close button, containing the close icon, that is to be used to close the sidepanel. if `false`, no closing button will be used. |
| durationShow          | css transition-duration | 1.0s | Duration for sidepanel opening transition
| durationHide          | css transition-duration | 0.33s | Duration for sidepanel closing transition
| durationHideFast          | css transition-duration | 0.11s | Duration for sidepanel _FAST_ closing transition
| backdrop              | boolean | `true` | Whether or not a backdrop (i.e. overlay) should display behind the open sidepanel |
| backdropStyle         | "light", "dark" | "light" |  Which style of backdrop to use, corresponding to the css styles |
| sidePanelIsOpenClass  | css class name | sidepanel-open | css class that is added to the document `<body>` when sidepanel shows, removed when it hides. For use in enabling any specific styles that should apply when sidepanel is open. |



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

# Simple Demo
This is a single page demo with the 


sidepanel library is included in the page as a linked files

```html
<script src="/demo/public/js/sidePanelCollapse/sidePanelCollapse.min.js"></script>`

<link href="/demo/public/css/sidePanelCollapse/sidePanelCollapse.min.css" rel="stylesheet">`

```

the sidepanel menu displays at all window sizes
uses the default SidePanel settings for configuration


# Advanced Demo

This is a more complex 

The sidepanel scss and javascript source are incorporated into the build process,
and are part of the compiled .css and .js files respectively.



On the initial index page, the sidepanel menu displays only at large window sizes or smaller; at extra-large, the primary navigation displays in a row.
On the sub-pages, the sidepanel menu displays at all window sizes.





## future work

- configure the open and close methods so that they can be called on their own and will function 
    
    
- allow the opening menu to also be the close, and no separate close element
- the sidepanel can be on the right OR the left side of the window
- function to dispose of the sidepanel

- setting to make the sidepanel modal when open, which will prevent any scroll of the document when panel is open