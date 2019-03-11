// BUILD DATA
// used in panini page generation
//
// define sitewide values and data,
// PRIMARY site metadata and meta details

var siteBase = "./";
var siteHome = "/";

var siteData = {
    "site_name": "Bootstrap v4 Sidebar",
    "title": "Horizontal Sliding Sidebar",
    "description": "An example project to demo using the Bootstrap v4 'collapse' component to make a vertical sidebar slide horizontally, with variable timing.",
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
            return siteData.site_name; // use the general site name
        },
        get title() {
            return siteData.title;  // use the general site title
        },
        "description":  function() {
            return siteData.description;
        },
        "type":         "website",
        "url":          "exampleurl.com",
        "url-content":  "exampleurl.com",
        "url-image-base":   "/",
        "image": {
            url: "public/images/og/og-site.png",
            width: 512,
            height: 256,
            alt: "Example site",
        },
    },

    "site-version":     "1.0",
    "site-root":        siteBase,
    "site-home":        siteHome,
    "path-pages":       "./",
};

module.exports = siteData;