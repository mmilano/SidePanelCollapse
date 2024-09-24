// BUILD DATA
// used in page generation
//
// define sitewide values and data,
// PRIMARY site metadata and meta details

const siteBase = "./";
const siteHome = "/";

const siteData = {
    "site_name": "SidePanelCollapse",
    "title": "Horizontal Sliding Side Panel",
    "description": "A project to demonstrate using the Bootstrap 'collapse' component to make a vertical sidebar slide horizontally, with advanced variable timing.",
    "project-url": "http://localhost:9191",

    // site meta keywords
    "keywords": [
        "Bootstrap 5",
        "collapse",
        "horizontal collapse",
        "vertical sidebar",
        "example",
        "demonstration",
        "website",
    ],

    "year": 2024,

    // data for sample open graph metadata for the demo pages
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

    "site-version":     "1.5.0",
    "site-root":        siteBase,
    "site-home":        siteHome,
    "path-pages":       "./",
};

module.exports = siteData;