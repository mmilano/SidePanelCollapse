// simple demo site script: main entry point
// general site javascript initialization
//

/* globals SidePanelCollapse */    // jshint: global values
"use strict";

var sidepanelOptions;

sidepanelOptions = {
//     sidepanelElement: "#sidePanel",
//     sidepanelCloseElement: ".sidePanel-close",
//
//     durationShow: "2s",
//     durationHide: "1.5s",
//     durationHideFast: "0.25s",
//
//     backdropEnabled: true,
//     backdropStyle: "light",
//
//     sidePanelIsOpenClass: "sidepanel-shown",
};

// initialize and instantiate a new sidepanel for the page
var sidepanel = new SidePanelCollapse(sidepanelOptions);
