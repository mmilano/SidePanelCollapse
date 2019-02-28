// *****
// handlebars helper
// generate a table of contents for a blob of html body contents
//
// takes the body content as input
// assumes ONLY ONE per page
//
// adapted version of
//  * Bootstrap Table of Contents (http://afeld.github.io/bootstrap-toc/)
//  * Copyright 2015 Aidan Feldman
//  * Licensed under MIT (https://github.com/afeld/bootstrap-toc/blob/gh-pages/LICENSE.md) */
//
// instead of using jquery to parse the page, uses cheerio.
//
//
// data attribute identifiers within the content:
//
// data-id="value"          id value for the element
// data-toc-ignore=true     marks that this heading element should be ignored/skipped
// data-title-short         alt value of the element's text to be used in the table of contents. allows a shorter version of the heading
//

/* jshint esversion: 6 */  // allow es6 features


const panini = require("panini");
const cheerio = require("cheerio");
const trimWhitespace = require("normalize-html-whitespace");

module.exports = function(attr, options) {
    /* jshint validthis: true */
    /* jshint undef:true */
    /* jshint -W069 */   // suppress the warning 'better written in dot notation'

    "use strict";

    const hbs = panini.Handlebars;
    const hbs_partials = panini.Handlebars.partials;

    // internal default values for the TOC
    var defaults = {
        // default scope is the whole page
        $scope: null,

        // how many heading levels to go down when generating the toc. e.g. 3 -> stop at h3
        maxHeadingDepth: 3,

        // when searching for headings, which level to start at. 1 = h1, 2 = h2, etc.
        topHeadingLevel: 1,

        // when generating unique ID values, start from this number (appended to the original id value)
        startingUniqueID: 1,

        // css selector for the <section>s that start sections
        sectionSelector: "section[id]",

        // selector of headings to ignore
        ignoreSelector: "[data-toc-ignore]",
    };

    // check if the passed-in partial is already compiled.
    // if so, just use that.
    // if not, compile it, and
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

    let template_compiled = [];
    template_compiled["pageTOC"] = getCompiled(hbs_partials["page-tableOfContents"]);

    // ******************
    // BEGIN
    // STEP1: get the rendered page body content

    // allow for arbitrary number of attributes passed as arguments
    if (!options || !options.fn) {
        options = arguments[arguments.length-1];
    }

    // rendered body content has been added to the pagedata value in panini, and is available via options.data.root.pageRendered
    let bodyRendered = options.data.root.pageRendered;

    // END: get the rendered page body content
    // ******************



    function TableOfContents(options) {

        // forge bonds to the defaults and methods.
        // var myself = this;
        this.defaults = defaults;

        // check if the element is a cheerio object (o.noteType = undefined) or Node object (o.noteType = 1)?
        this.checkForNode = function checkForNode(o) {
            if (o.nodeType === undefined) {
                return false;
            } else if (o.nodeType === 1) {
                return true;
            }
        };

        this.getElementAsNode = function getElementAsNode(o) {
            if (this.checkForNode(o)) {
                o = o;
            } else {
                o = o[0];
            }
            return o;
        };

        this.filterOut = function filterOut($el) {
            // construct selector for elements that should be filtered out. in this case, it is determined by the ignoreSelector value
            let filterOutSelector = ":not(" + this.ignoreSelector +")";
            return $el.filter(filterOutSelector);
        };

        // return all matching elements in the set, or their descendants
        // exclude items that have 'data-toc-ignore' attribute
        this.findAndFilter = function findAndFilter(selector, $scope) {
            if ($scope === undefined) {
                console.warn ("findAndFilter: NO SCOPE GIVEN");
                return false;
            }

            let $descendants = $scope.find(selector);
            let group = $scope.filter(selector).add($descendants);
            group = this.filterOut(group);

            return group;
        };

        // given a NODE DOM element,
        // try to get its title value, or what should be used in the TOC
        this.getTitle = function(el) {
            let title;

            if (el === undefined) {
                console.warn ("getTitle: NO ELEMENT ARGUMENT GIVEN");
                return 0;
            }

            // console.log ("**** el1", el);
            // console.log ("**** el2", $(el));
            let $el = $(el);

            // first check if there is a data-title-short value
            if ($el.data("title-short")) {
                title = $el.data("title-short");
            } else {
                // if that doesnt exist, try to get the innertext of the tag
                title = trimWhitespace($el.text());
            }

            return title;
        };

        // given a NODE DOM element,
        // try to get its text content in order to make an ID value from that
        this.generateUniqueIdBase = function generateUniqueIdBase(el) {
            let anchor;

            if (el === undefined) {
                console.warn ("generateUniqueIdBase: NO ELEMENT ARGUMENT GIVEN");
                return 0;
            }

            let elObject = $(el);

                // first try to get the data-id value
            if (elObject.data("id-value")) {
                anchor = elObject.data("id-value");
            } else if (elObject.data("title-short")) {
                // then try to get the short title value
                anchor = elObject.data("title-short");
            } else {
                // if that doesnt exist, try to get the innertext of the tag
                anchor = elObject.text();
            }

            // replace invalid characters and spaces with '-' to make valid css identifiers
            anchor = anchor.trim().toLowerCase().replace(/[^A-Za-z0-9]+/g, "-");
            return anchor || el.tagName.toLowerCase();
        };

        // check if an element is in the top scope
        this.checkIfExists = function(attr) {
            let exists = this.$scope(attr).length > 0;
            return exists ? true : false;
        };

        // check if an element with given ID exists
        this.checkIfIDExists = function(attr) {
            return (this.checkIfExists("#" + attr));
        };

        // given a NODE DOM element,
        // attempt to create an ID value for it that is unique in the page
        this.generateUniqueId = function generateUniqueId(el) {
            if (el === undefined) {
                console.warn ("generateUniqueId: NO ELEMENT ARGUMENT GIVEN");
                return false;
            }

            let anchorID = this.generateUniqueIdBase(el);

            // first check to see if the id in already in the page
            let doesExist = this.checkIfIDExists(anchorID);

            while (doesExist) {
                // use the object's running unique id value and increment it as it is being used
                let newID = anchorID + "-" + this.uniqueIDIndex++;
                // check if ID already exists by trying to select item in the 'big scope'
                if (!this.checkIfIDExists(newID)) {
                    doesExist = false;
                    anchorID = newID;
                }
            }
            return anchorID;
        };

        // given a NODE DOM element,
        // either return its existing ID value,
        // or if there is none, create a new unique ID value
        this.getAnchor = function(el) {
            let anchor;

            // if there is an existing id value, get that
            if (el.attribs && el.attribs.id) {
                anchor = el.attribs.id;
            } else {
                // otherwise, need to create a new id
                anchor = this.generateUniqueId(el);
                el.attribs.id = anchor;
            }

            return anchor;
        };

        // Find the first heading level (<h1>, then <h2>, etc.) that has ONE OR MORE element. Defaults to value of topHeadingLevel (eg <h2>)
        // returns integer #, corresponding to h#
        this.getTopLevel = function getTopLevel($scope) {
            // default the scope to the top

            $scope = ($scope !== undefined) ? $scope : this.$ROOT;

            // set to -1 to signal if there are no top level headings
            let topLevel = -1;

            for (var i = this.topHeadingLevel; i <= this.maxHeadingDepth; i++) {
                let $headings = this.findAndFilter("h" + i, $scope);
                if ($headings.length > 0) {
                    topLevel = i;
                    break;
                }
            }

            return topLevel;
        };

        // returns the elements for the top level, and the next below it
        // $scope:      $object of content to search within
        // startLevel:  integer of top heading level to search for
        this.getHeadingsAndNext = function getHeadingsAndNext(startLevel, $scope) {
            $scope = ($scope !== undefined) ? $scope : this.$ROOT;

            let topSelector = "h" + startLevel;
            let secondarySelector = "h" + (startLevel + 1);
            let combinedSelector = topSelector + "," + secondarySelector;
            return this.findAndFilter(combinedSelector, this.$ROOT);
        };

        this.getHeadingsOnly = function(level, $scope) {
            $scope = ($scope !== undefined) ? $scope : this.$ROOT;
            let selector = "h" + level;
            return this.findAndFilter(selector, $scope);
        };

        this.getNextHeadingsUntil = function($el, headingLevel, $scope) {
            let headingSelector = "h" + headingLevel;
            let group = $el.nextUntil($el, headingSelector);
            return group;
        };

        this.generateContents = function() {
            let contents = {};
            // index counter for the top-level sections
            let contentsIndexTop = 1;

            function contentsKeyFirst(i) {
                return "section" + i;
            }
            function contentsKeySecond(i) {
                return "subsection" + i;
            }
            function isEmpty(obj) {
                return Object.keys(obj).length === 0;
            }

            // put the first contents entry in
            let firstEntry = this.createContentsEntry_overview();
            let indexTop = contentsKeyFirst(contentsIndexTop++);
            contents[indexTop] = firstEntry;

            let $PAGE= this.$ROOT;
            let topLevel = this.getTopLevel($PAGE);

            // this should be a collection of all the headings that should appear in the table of contents
            let $allReleventHeadings = this.getHeadingsAndNext(topLevel, $PAGE);

            var thisContext = this;

            // how many relevant headings are there?
            let allHeadingsLength = $allReleventHeadings.length;

            // top-sections:
            // manually loop through all the relevant headings, one by one
            // note: cannot use for x in object because the cheerio object has been given a bunch of its methods as properties, rather than as prototype or something
            topSectionsLoop:
            for (var i = 0; i < allHeadingsLength; i++) {

                let heading = $allReleventHeadings[i];

                // get the anchor and title of the heading
                let anchor = thisContext.getAnchor(heading);
                let title = thisContext.getTitle(heading);

                // create the {} entry...
                let entry = thisContext.createContentsEntry(anchor, title);
                // ...and add it to the toc data object being built...
                let key_top = contentsKeyFirst(contentsIndexTop++);

                contents[key_top] = entry;

                // sub-sections:
                // now look at each of the next headings.
                // if they are same level as the current, then stop looping for subsections
                // if they are level+1, then make a new subsection and add it in

                let subsections = {};
                // index counter for the subsections
                let subsectionIndex = 1;

                subsectionLoop:
                for (var j = i + 1; j < allHeadingsLength; j++, i++) {

                    let nextHeading = $allReleventHeadings[j];
                    let nextLevel = thisContext.getLevel($(nextHeading));

                    if (nextLevel > topLevel) {
                        // get the anchor and title
                        let anchor_sub = thisContext.getAnchor(nextHeading);
                        let title_sub = thisContext.getTitle(nextHeading);

                        // create the {} entry...
                        let entry_sub = thisContext.createContentsEntry(anchor_sub, title_sub);
                        // ...and add it to the toc data object being built...
                        let key_sub = contentsKeySecond(subsectionIndex++);
                        subsections[key_sub] = entry_sub;
                    } else {
                        break subsectionLoop;
                    }
                };

                if (!isEmpty(subsections)) {
                    contents[key_top]["subsections"] = subsections;
                }
            }

            return contents;
        };

        // given a heading OBJECT,
        // e.g. 'h3', return the integer of the level it is
        this.getLevel = function getLevel($el) {
            return parseInt(this.getTag($el).tagName.charAt(1), 10);
        };

        // given a $element object, return the tag object itself
        // because some calls require the tag object, instead of the cheerio object
        // cheerio specific
        this.getTag = function($el) {
            return $el.get(0);
        };

        // creation of contents objects
        //
        // create a new contents item object given the anchor (= the html ID attribute) & title value
        // and return it
        this.createContentsEntry = function(anchor, title) {
            let obj = {
                "anchor": anchor,
                "title": title
                };
            return obj;
        };

        // create a new contents item object
        // for the 'overview' that is the default first section on the interior page
        // and return it
        this.createContentsEntry_overview = function() {
            const anchor =  "overview";
            const title =   "Overview";
            return this.createContentsEntry(anchor, title);
        };

        // parse any options passed in for the toc generation and set up values used within the methods
        //
        // $scope: element to limit the search for headings (at this element and down). should be a $cheerio object
        function initialize(arg) {

            // if no args passed, then use empty
            arg = arg || {};

            let defaults = this.defaults;

            // scope:
            // either use a more narrow scope that was passed in as option, or else use the entire body (the document) as scope
            this.$scope = (arg.$scope !== undefined) ? arg.$scope : $;
            this.$ROOT  = this.$scope.root();

            this.maxHeadingDepth = (arg.maxHeadingDepth !== undefined) ? arg.maxHeadingDepth : defaults.maxHeadingDepth;
            this.topHeadingLevel = (arg.topHeadingLevel !== undefined) ? arg.topHeadingLevel : defaults.topHeadingLevel;

            // uniqueID is internal property used as index for creating new uniqueIDs
            this.startingUniqueID = (arg.startingUniqueID !== undefined) ? arg.startingUniqueID : defaults.startingUniqueID;
            this.uniqueIDIndex = defaults.startingUniqueID;

            this.sectionSelector = (arg.sectionSelector !== undefined) ? arg.sectionSelector : defaults.sectionSelector;
            this.ignoreSelector = (arg.ignoreSelector !== undefined) ? arg.ignoreSelector : defaults.ignoreSelector;
        }

        initialize.call(this, options);
    };

    // ******************
    // BEGIN: parsing the body content to create the table of contents
    //
    // load the whole page into cheerio
    const $ = cheerio.load(bodyRendered);

    // options for cheerio/table of contents parsing
    const _toc_options = {
        $scope: $,
        topHeadingLevel: 2,
    };

    // initialize the table of contents
    let _toc = new TableOfContents(_toc_options);
    let currentTopLevel = _toc.getTopLevel();

    let contents = {};
    if (currentTopLevel > 0) {
        contents["contents"] = _toc.generateContents();
    }
    // END: parsing the body content
    // ******************

    // ******************
    // now that the contents data is built,
    // render the table of contents
    return template_compiled["pageTOC"](contents, options);
};