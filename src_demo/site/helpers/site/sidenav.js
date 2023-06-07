// *****
// panini/handlebars helper module
//
// generate the list of sub-pages in the site
// currently used to display nav options in the slide-out side panel
//
// @param {object} globalContext: the top level (handlebars) context for the site
"use strict";

const panini = require("panini");
const node_path = require("path");
const titlecase = require("ap-style-title-case");

module.exports = function (globalContext, options) {

    let out = ""; // output
    let currentPage, currentPageID;

    const hbs_partials = panini.Handlebars.partials;
    const hbs_helpers = panini.Handlebars.helpers;

    // utility function
    // check if the passed-in partial is already compiled.
    // if so,just use that.
    // if not, compile it.
    // return the compiled partial
    function getCompiled(p) {
        let partialCompiled;

        if (typeof p === "function") {
            partialCompiled = p;
        } else {
            partialCompiled = panini.Handlebars.compile(p);
        }

        return partialCompiled;
    }

    // convenience references to the partials and helpers
	const template_compiled = {};
    template_compiled["name"] = getCompiled(hbs_partials["sidenav-name"]);
    template_compiled["group"] = getCompiled(hbs_partials["sidenav-group"]);
    template_compiled["divider"] = getCompiled(hbs_partials["sidenav-divider"]);
    const getPageData = hbs_helpers["getPageData"];

    // for page name:
    // get url from the gallery data
    // but
    // get page name from the page data
    function renderPageName(page) {
        const pageURL = page.url;

        // to get the title in the page data,
        // have to breakdown the page url because the page data is keyed to the page file name
        const fileName = node_path.parse(pageURL).name;
        const pageData = globalContext[fileName];
        const pageName = titlecase(pageData["page-title-short"]);

        let context = {
            url: pageURL,
            pagename: pageName,
        };

        if (page.id === currentPageID) {
            context.currentPage = true;
        }

        return template_compiled["name"](context, options);
    }

	// NOTE: not being used in sidepanel demo
    const renderDivider = () => "<!-- divider -->";

	// NOTE: not being used in sidepanel demo
    const renderGroupName = (group) => {
        let context = {
            "group": group,
        };
        return template_compiled["group"](context);

    }

	// NOTE: not being used in sidepanel demo
    const renderGroupBegin = () => "<!-- begin: a group -->";

	// NOTE: not being used in sidepanel demo
    const renderGroupEnd = () => "<!-- end: a group -->";

    // iterate the data array of pages passed in and find just the non-disabled ones
    function getActivePages(gallery) {
        let list = [];
        let keys = Object.keys(gallery);

        keys.forEach(function (key) {
            if (!gallery[key].disable) {
            	list.push(key);
            };
        });
        return list;
    }

    // allow for arbitrary number of attributes passed as arguments
    if (!options || !options.fn) {
        options = arguments[arguments.length - 1];
    }

    // in lieu of passing in the {object} site-gallery, get it out of the global context that is passed in
    const siteGallery = globalContext && globalContext["site-gallery"];

    // create a parallel array of just the active page keys
    const pagesActive = getActivePages(siteGallery);

    // convert 'human-friendly' length to be compatible with the machine-friendly index
    const galleryPagesLength = pagesActive.length < 2 ? 1 : pagesActive.length - 1;

    let previousGroup = "";

    // currentPage = page where list is being generated
    currentPage = globalContext.page;
    currentPageID = getPageData(globalContext, currentPage, "id");

    pagesActive.forEach(function (k, index) {
        let htmlFragment = ""; // set to empty at beginning

        const aPage = siteGallery[k];
        const pageName = node_path.parse(aPage.url).name;
        const pageGroup = getPageData(globalContext, pageName, "group");

        // if this group = group from previous page,
        // then just render the page name
        if (pageGroup === previousGroup) {
            htmlFragment = renderPageName(aPage);
        } else {
            // if group !== previous group, then render:
            // 1. group closer and a divider to close the previous group,
            // 2. the new group title,
            // 3. the first page in the new group
            if (previousGroup !== "") {
                htmlFragment = renderGroupEnd();
                htmlFragment += renderDivider();
            }

            htmlFragment += renderGroupBegin();
            // htmlFragment += renderGroupName(pageGroup);  // not being used in demo
            htmlFragment += renderPageName(aPage);
            previousGroup = pageGroup;
        }
        // check if this is the end of the list. if so, close out
        if (index === galleryPagesLength) {
            htmlFragment += renderGroupEnd();
        }

        out += htmlFragment;
    });

    return out;
};