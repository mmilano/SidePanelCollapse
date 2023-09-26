// site script: main entry point
// general site javascript initialization
//
// globals, etc.


// make sidePanel available as global
// this isn't strictly necessary, depending on how your site is structured,
// but makes development investigation easier
window.SidePanelCollapse = require("SidePanelCollapse");

// demo specific:
const pages = require("pages.js");

const pageRouter = pages.pageRouter;
const pageMethods = pages.pages;

module.exports = {
    pageRouter,
    pageMethods,
};