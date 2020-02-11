// BUILD DATA
// used in panini page generation
//
// define sitewide values and data,
// PRIMARY site metadata and meta details

var siteBase = "./";
var siteHome = "/";

var siteData = {
    "site_name": "Bootstrap SidePanelCollapse",
    "title": "Horizontal Sliding Side Panel",
    "description": "An example project to demonstrate using the Bootstrap 'collapse' component to make a vertical sidebar slide horizontally, with variable timing.",
    "project-url": "http://localhost:9191",

    // site meta keywords
    "keywords": [
        "Bootstrap 4",
        "collapse",
        "horizontal collapse",
        "vertical sidebar",
        "example",
        "demonstration",
        "website",
    ],

    "siteYear": 2020,

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
        "url":          "localhost:9191/",
        "url-content":  "localhost:9191/",
        "url-image-base": "/",
        "image": {
            url: "public/images/og/og-demo.png",
            width: 512,
            height: 256,
            alt: "SidePanelCollapse Demonstration"
        },
    },

    "site-version":     "1.0.1",
    "site-root":        siteBase,
    "site-home":        siteHome,
    "path-pages":       "./",
};

module.exports = siteData;