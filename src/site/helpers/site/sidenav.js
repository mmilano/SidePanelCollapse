// *****
// panini/handlebars helper module
//
// generate the gallery page list in the pages - currently displayed as the slide-out sidepanel
//
// @param {object} globalContext: the top level context for the pages

const panini = require("panini");
const node_path = require("path");

module.exports = function(globalContext, options) {
    "use strict";

    let out = ""; // output
    let siteGallery;

    let currentPage;
    let currentPageID;

    var hbs = panini.Handlebars;
    var hbs_partials = panini.Handlebars.partials;
    var hbs_helpers = panini.Handlebars.helpers;

    // check if the passed-in partial is already compiled.
    // if so,just use that.
    // if not, compile it.
    // return the compiled partial
    function getCompiled(p) {
        let partialCompiled;

        if (typeof p === "function") {
            partialCompiled = p;
        } else {
            partialCompiled = hbs.compile(p);
        }

        return partialCompiled;
    }

    let template_compiled = {};
    template_compiled["name"] = getCompiled(hbs_partials["sidenav-name"]);
    template_compiled["group"] = getCompiled(hbs_partials["sidenav-group"]);
    template_compiled["divider"] = getCompiled(hbs_partials["sidenav-divider"]);

    let getPageData = hbs_helpers["getPageData"]; // use the existing helper

    // for page name:
    // get url from the gallery data
    // but
    // get page name from the page data

    function renderPageName(page) {
        let pageURL = page.url;

        // to get the title in the page data,
        // have to breakdown the page url because the page data is keyed to the page file name
        let pageName = node_path.parse(pageURL).name;
        let pageData = globalContext[pageName];
        let name = pageData["page-title-short"];

        let context = {
            "url": pageURL,
            "pagename": name,
        };

        if (page.id === currentPageID) {
            context.currentPage = true;
        }

        return template_compiled["name"](context, options);
    }

    function renderGroupName(group) {
        let context = {
            "group": group,
        };
        return template_compiled["group"](context);
    }

    function renderDivider() {
        return template_compiled["divider"]();
    }

    function renderGroupBegin() {
        return "<div class=\"pagelist-group\">";
    }

    function renderGroupEnd() {
        return "\n</div>";
    }

    // iterate the array of pages passed in and find just the non-disabled ones
    function getActivePages(gallery) {
        let list = [];
        let keys = Object.keys(gallery);

        keys.forEach(function(key, index) {
            if (!gallery[key].disable) {
               list.push(key);
            };
        });

        return list;
    }

    // allow for arbitrary number of attributes passed
    if (!options || !options.fn) {
        options = arguments[arguments.length-1];
    }

    // in lieu of passing in the {object} site-gallery, get it out of the global context that is passed in
    let projects = globalContext && globalContext["site-portfolio"];  // TODO replace with one below
    siteGallery = globalContext && globalContext["site-gallery"];

    // create a parallel array of just the active page keys
    let pagesActive = getActivePages(siteGallery);

    // convert 'human-friendly' length to be compatible with the machine-friendly index
    let galleryPagesLength = pagesActive.length < 2 ? 1 : pagesActive.length - 1;

    // generate the menu list element for each active page
    let previousGroup = "";

    // currentPage = page where list is being generated
    currentPage = globalContext.page;
    currentPageID = getPageData(globalContext, currentPage, "id");

    pagesActive.forEach(function(k, index) {
        let htmlFragment = "";

        let aPage = siteGallery[k];
        let pageID = aPage.id;
        let pageName = node_path.parse(aPage.url).name;
        let pageGroup = getPageData(globalContext, pageName, "group");

        // if this group = group from previous page,
        // then just render the page name
        if (pageGroup === previousGroup) {
            htmlFragment = renderPageName(aPage);
        } else {
            // if group !== previous group, then render
            // 1. group closer and a divider to close the previous group,
            // 2. the group name,
            // 3. the first page in the new group

            if (previousGroup !== "") {
                htmlelement = renderGroupEnd();
                htmlelement += renderDivider();
            };
            htmlFragment += renderGroupBegin();
            htmlFragment += renderGroupName(pageGroup);
            htmlFragment += renderPageName(aPage);
            previousGroup = pageGroup;
        }
        // check if this is the end of the list of pagess. if so, close out
        if (index === galleryPagesLength) {
            htmlFragment += renderGroupEnd();
        }

        out += htmlFragment;
    });

    return out;
};