// BUILD DATA
// define sitewide values and data

// PRIMARY site metadata and meta details

var siteBase = "./site/";
var siteHome = "/site/";


var siteData = {

    "name": "Bootstrap 4 Sidebar",
    "title": "Michel Milano",
    "description": "An example project to demo using the Bootstrap 4 'collapse' component to make a vertical sidebar slide horizontally, with variable timing.",

    "project-url": "http://www.stochasticnotions.com/",

    // site meta keywords
    "keywords": [
        "Bootstrap 4",
        "collapse",
        "vertical sidebar",
        "example",
        "demonstration",
        "website",
    ],

    "siteYear": 2019,

    "og": {
        get site_name() {
            return siteData.name; // use the general site name
        },
        get title() {
            return siteData.title;  // use the general site title
        },
        "description":  function() {
            return siteData.description;
        },
        "url":          "http://www.stochasticnotions.com/",
        "url-content":  "http://www.stochasticnotions.com/werk/",
        "type":         "website",
        "url-image-base":   "http://www.stochasticnotions.com/werk/public/images/",
        "image": {
            url: "public/images/general/og/site.jpg",
            width: 512,
            height: 256,
            alt: "null",
        },
    },

    "site-version":       "1.0",
    "site-root":          siteBase,
    "site-home":          siteHome,

    "path-pages":      "./",
};

module.exports = siteData;