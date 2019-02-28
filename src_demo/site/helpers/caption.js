// *****
// handlebars block helper module
//
// generate a caption element


const trimWhitespace = require("normalize-html-whitespace");

module.exports = function(attr, options) {
    "use strict";

    let out, open;

    const openTag =  '<div class="caption">';
    const closeTag = "</div>";

    // allow for arbitrary number of attributes passed as arguments
    if (!options || !options.fn) {
        options = arguments[arguments.length-1];
    }

    // if there are attributes, parse the attributes passed and construct the opening tag
    // otherwise just use default
    if (options.hash && Object.keys(options.hash).length > 0) {
        let attributes = "";

        // if parameter passed in is "attribute=true", handle that as a special case
        // of a single name attribute
        // otherwise, express as: attribute="value"
        for (var a in (options.hash)) {
            if (options.hash[a] === true) {
               attributes = " " + a + attributes;
            } else {
                attributes = " " + a + "=\"" + options.hash[a] + "\"" + attributes;
            }
        }
        open = [openTag.slice(0, (openTag.length -1)), attributes, openTag.slice(openTag.length -1)].join("");

    } else {
        open = openTag;
    }

    out = open;
    let headingText = trimWhitespace(options.fn(this));
    out += headingText;
    out += closeTag;

    return out;
};