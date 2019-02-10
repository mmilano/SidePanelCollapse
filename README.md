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


# How to use
open terminal


npm install

gulp




Two sidepanel closing durations

Intra-page links – Anchor Links
For a link that goes to a location within the current page,



Inter-page links – Page Links




