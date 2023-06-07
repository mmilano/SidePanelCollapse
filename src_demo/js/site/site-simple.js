// simple demo site script: main entry point
// general site javascript initialization
//
// there isn't much to this, just some placeholders to stand in for some script code on a page

"use strict";

// run after page is fully loaded
window.addEventListener("load", function() {

    // if the desire is to initialize SidePanelCollapse manually instead of the auto-init that the data-attribute initiates,
    // then this is the place that could be done, like the following (disabled) example code.

    // const sidepanelOptions = {
    //     sidepanelElement: "#sidePanel",
    //     sidepanelCloseElement: ".sidePanel-close",
    //     durationShow: "2s",
    //     durationHide: "1.5s",
    //     durationHideFast: "0.25s",
    //     backdrop: true,
    //     backdropStyleClass: "light",
    //     sidePanelIsOpenClass: "sidepanel-shown",
    // };

    // const sidepanel = new SidePanelCollapse(sidepanelOptions);

    console.log("script can do programmatic things here after the window 'load' event fires");
    console.log("at this point, the SidePanel will have been created and initialized.");
});
