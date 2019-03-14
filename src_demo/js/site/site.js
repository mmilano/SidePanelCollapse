// site script: main entry point
// general site javascript initialization
//
// globals,
// immediate execution functions,
// or functions that will be available to the site in general


// make sidepanel available as global
// this isn't strictly necessary, depending on how your site is structured,
// but makes development investigation easier

window.SidePanelCollapse = require("SidePanelCollapse");

// collection of scripts and handlers specific to each page, keyed to page ID
var pageMethods = require("pages.js");

module.exports = {
    pageMethods: pageMethods,
};