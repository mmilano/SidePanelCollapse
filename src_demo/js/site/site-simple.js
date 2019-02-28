// simple demo site script: main entry point
// general site javascript initialization
//

/* globals SidePanelCollapse */    // jshint: global values
"use strict";

var sidepanelOptions = {
    sidepanelElement: "#sidePanel",
    sidepanelCloseElement: ".sidepanel-close",
};
// initialize and instantiate a new sidepanel for the page
var sidepanel = new SidePanelCollapse();

