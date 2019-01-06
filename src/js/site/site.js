// site script: main entry point
// general site javascript initialization and misc
// defines globals,
// immediate execution functions,
// or functions that will be made available via the 'site." namespace, via the exports


// legacy utilities for pages. mostly the scroll transition handler
// modules/
// require("site-utils.js");

// incorporate the script for the sidenav
require("site-sidePanel.js");

// collection of scripts and handlers specific to each page, keyed to page ID
let pageMethods = require("pages.js");

module.exports = {
    pageMethods: pageMethods,
};