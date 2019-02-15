// site script: main entry point
// general site javascript initialization and misc
// defines globals,
// immediate execution functions,
// or functions that will be made available via the 'site." namespace, via the exports


// incorporate the script for the sidepanel
var SidePanelCollapse = require("SidePanelCollapse.js");


// instantiate a new sidepanel for the page

// sidepanel options for this site
var sidepanelOptions = {
    sidepanelElement: "#sidePanel",
    sidepanelCloseElement: ".sidepanel-close",

//    durationShow: "1.1222s",
    backdropEnabled: true,

};

var side = new SidePanelCollapse(sidepanelOptions);

// collection of scripts and handlers specific to each page, keyed to page ID
var pageMethods = require("pages.js");

module.exports = {
    pageMethods: pageMethods,
};