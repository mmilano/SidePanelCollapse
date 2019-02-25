// simple demo site script: main entry point
// general site javascript initialization
//

/* globals SidePanelCollapse */    // jshint: global values
"use strict"

// declare as global
var sidepanel;

var pageMain = function(pageID) {

    // sidepanel options
    var sidepanelOptions = {
        sidepanelElement: "#sidePanel",
        sidepanelCloseElement: ".sidepanel-close",
    };
    // initialize and instantiate a new sidepanel for the page
    sidepanel = new SidePanelCollapse(sidepanelOptions);

};

document.addEventListener("DOMContentLoaded", pageMain("index-simple"), false);
