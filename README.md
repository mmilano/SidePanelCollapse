# sidebar-slide


Bootstrap 4 can be used to make an element collapse horizontally.


The Bootstrap Collapse component is typically used to show and hide content in vertical manner, collapsing upwards and downwards.

[Bootstrap Collapse Component](https://getbootstrap.com/docs/4.2/components/collapse/)


I wanted to add a vertical full-window navigation side bar to my site, and I was already using Bootstrap, so I thought that maybe
I could use the existing component to make the navigation bar instead of adding another code module to handle this.

It turns out that there is a hook for horizontal collapse.

While height collapse is the default behavior, Bootstrap will check if the collapsing element has a 'width' class.
If so, then the width, not height, collapses. It changes horizontally.

```javascript
_proto._getDimension = function _getDimension() {
    var hasWidth = $(this._element).hasClass(Dimension.WIDTH);
    return hasWidth ? Dimension.WIDTH : Dimension.HEIGHT;
};
```
[from Bootstrap.js/collapse code](https://github.com/twbs/bootstrap/blob/v4-dev/js/dist/collapse.js#L305)



Just as the Bootstrap collapse component normally shows and hides content vertically, 
this version will show and hide horizontally.

* Buttons or anchors are used as triggers that are mapped to specific elements you toggle. 
* Collapsing an element will animate the width between 0 and its full width value.




# What is all this other stuff in the project

This example has been extracted from a larger site I have developed,

which includes static page generation using Panini/handlebars.js,

In addition to the handlebars partials, there are many handlebars helpers 
(for example, creation of the page's table of contents at time of page generation by parsing the content),
and some site-specific javascript modules.
The existence of the gallery on the index/homepage is also a vestige of the larger site; I left a reduced version of it here for 

The larger parent site is available at [stochasticnotions.com](https://www.stochasticnotions.com).


For this smaller project, I have tried to distill everything down to be more simple,
and have cut down all of the source. But I might have missed some artifacts.

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

### HTML links
Clone the repository locally, copy the SCSS and javascript files, and link the  files to your HTML document.

 ```html
 
<link href="path/to/css/sidepanel.min.css" rel="stylesheet"/>
.. 
..
<script src="path/to/sidepanel.min.js" async></script>

```


### NPM and a build process
Install it via npm, and add the SCSS and javascript files to your build process

 ```bash
$ npm install sidepanelslide
```

```javascript


```



# Building the demo
Open terminal to the root of the project directory.

`npm install`

`gulp demo`


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


# Options

| name | possible values | default | description |
| ---- | --------------- | ------- | ----------- |
| sidepanelElement      | css class name | `#sidePanel` | css selector for the top-level of the sidepanel |
| sidepanelCloseElement | css class name  or 'false' | `.sidePanel-close` | css selector for the close button, containing the close icon, visible when the sidepanel is displayed. if false, no closing button will be used. |
| durationShow          | css transition-duration | 1.0s | Duration for sidepanel opening transition
| durationHide          | css transition-duration | 0.33s | Duration for sidepanel closing transition
| durationHideFast          | css transition-duration | 0.11s | Duration for sidepanel closing transition
| backdrop              | boolean | `true` | Whether or not a backdrop (i.e. overlay) should display behind the open sidepanel |
| backdropStyle         | "light", "dark" | "light" |  Which style of backdrop to use, corresponding the css styles |
| sidePanelIsOpenClass  | css class name | sidepanel-open | css class that is added to the document `<body>` when sidepanel shows, removed when it hides. For use in enabling any specific styles that should apply when sidepanel is open. |





The css and javascript has been compiled or transpiled (respectively) to a browser target of ` ["> 0.5%"].`
If you need a broader target range, adjust these values in the gulpfile and rebuild the files.




## Closing the Sidepanel

SidePanelCollapse is designed on the assumption that there is a "close' `<button>` element within the sidepanel.
In the example demos, this is the "x" glyph in the sidepanel header bar that overlaps and covers the opening menu glyph.

The "sidepanelCloseElement" option can be provided with a css selector to specify a custom closing element
that adheres to the regular Bootstrap collapse `.navbar-toggler` behavior.
        

the sidepanel will also close if the backdrop is "clicked" (i.e. anywhere in the page window other than the sidepanel iteself), 
the ESCAPE key is pressed,
or if any of the links in the sidepanel are clicked.



# The Irrevocable Opening

The sidepanel uses the Bootstrap collapse functionality to open the panel.
Therefore, the boostrap.js functions handle the 

Unfortunately, this means that once the open transition has been started, 
it cannot be stopped. it is irrevocable.

And any attempt to interrupt the transition and 

this means that if the user wants to close the sidepanel while it is opening, 

it cannot be closed until it has finished opening.

This ia an existing bootstrap ~~condition~~ limitation.


In order to work with this 
SidePanelCollapse makes the design decision to queue up the closing action, and when the open transition is completed, the sidepanel will be immediately closed.








# Demo examples

# Simple
This is a single page demo with the 


sidepanel library is included in the page as a linked files
`<script src="/demo/public/js/sidePanelCollapse/sidePanelCollapse.min.js"></script>`
`<link href="/demo/public/css/sidePanelCollapse/sidePanelCollapse.min.css" rel="stylesheet">`


the sidepanel menu displays at all window sizes
uses the default SidePanel settings for configuration


# Multi-page

This is a more complex 

The sidepanel scss and javascript source are incorporated into the build process,
and are part of the resulting .css and .js files respectively.



On the initial index page, the sidepanel menu displays only at large window sizes or smaller; at extra-large, the primary navigation displays in a row.
On the sub-pages, the sidepanel menu displays at all window sizes.






## future work

- configure the open and close methods so that they can be called on their own and will function 
    right now, the opening is activated on the click of the menu, but doesnt initiate the opening action
- allow the opening menu to also be the close, and no separate close element
- the sidepanel can be on the right OR the left side of the window
- function to dispose of the sidepanel

- do i need to check for the sidepanel scss values in setting defaults?


- setting to make the sidepanel modal when open, which will prevent any scroll of the document when panel is open