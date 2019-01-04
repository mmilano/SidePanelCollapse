// *****
// handlebars block helper module
//
// heading element

// supports any of the following
// <h2 id="sectionx" class="bitsy bopsy">context title</h2>
// <h2>context title</h2>

const basepath = process.cwd();
const trimWhitespace = require(basepath + "/src/site/lib/trim");
const titlecase = require("ap-style-title-case");

module.exports = function(attr, options) {
    "use strict";

    let out, open;

    const openTag =  "<h2>";
    const closeTag = "</h2>";

    // allow for arbitrary number of attributes passed
    if (!options || !options.fn) {
        options = arguments[arguments.length-1];
    }

    if (options.hash && Object.keys(options.hash).length > 0) {
        // if there are attributes, parse the attributes passed and construct the opening tag
        // otherwise just use default
        let attributes = "";
        var a;

        // if parameter passed in is "attribute=true", handle that as a special case
        // of a single name attribute
        // otherwise, express as: attribute="value"
        for (a in (options.hash)) {
            if (options.hash[a] === true) {
               attributes = " " + a + attributes;
            } else {
                attributes = " " + a + "=\"" + options.hash[a] + "\"" + attributes;
            }
        }
        open = [openTag.slice(0, (openTag.length -1)), attributes, openTag.slice(openTag.length -1)].join('');

    } else {
        open = openTag;
    }

    out = open;
    let headingText = trimWhitespace(options.fn(this));
    headingText = titlecase(headingText);
    out += headingText;
    out += closeTag;
    out += "\n";
    return out;
};