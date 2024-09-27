// site script: main entry point
// general site javascript initialization
//
// globals, etc.


// make SidePanelCollapse available as global
// this isn't strictly necessary, depending on how your site is structured,
// but done here for the sake of simplicity in the demo.
window.SidePanelCollapse = require("SidePanelCollapse");

// demo specific:
const {pageRouter, pageMethods} = require("pages");

module.exports = {
    pageRouter,
    pageMethods,
};
