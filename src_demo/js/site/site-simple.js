// simple demo site script: main entry point
// general site javascript initialization
//
// there isn't much to this, just some placeholders to stand in for some script code on a page

/* globals SidePanelCollapse */    // jshint: global values
"use strict";


// run after page is fully loaded
window.addEventListener("load", function() {
    var sidepanelOptions;

    // sidepanelOptions = {
    //     sidepanelElement: "#sidePanel",
    //     sidepanelCloseElement: ".sidePanel-close",
    //
    //     durationShow: "2s",
    //     durationHide: "1.5s",
    //     durationHideFast: "0.25s",
    //
    //     backdrop: true,
    //     backdropStyleClass: "light",
    //
    //     sidePanelIsOpenClass: "sidepanel-shown",
    // };

    // initialize and instantiate a new sidepanel for the page
    // var sidepanel = new SidePanelCollapse(sidepanelOptions);

    console.log("script does some programmatic things here after the window 'load' event fires");
    console.log("at this point, the SidePanel will have been created and initialized.");
});

console.log("script does some programmatic things here when the script loads");

