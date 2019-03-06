// *****
// handlebars block helper module
//
// generate <h2> heading element
// automatically title case the heading text
//
// supports any of the following
// <h2>simple title</h2>
// <h2 id="section2" class="fomoco">less simple title</h2>


const basepath = process.cwd();
const trimWhitespace = require( basepath + "/src_demo/site/lib/trim");

const titlecase = require("ap-style-title-case");

module.exports = function(attr, options) {
    "use strict";

    let out, open;

    const openTag =  "<h2>";
    const closeTag = "</h2>";

    // allow for arbitrary number of attributes passed as arguments
    if (!options || !options.fn) {
        options = arguments[arguments.length-1];
    }

    // if there are attributes, parse the attributes passed and construct the opening tag
    // otherwise just use default
    if (options.hash && Object.keys(options.hash).length > 0) {
        let attributes = "";

        // iterate through the options
        // if parameter passed in is "attribute=true" format, handle that as a special case of a single name attribute
        // otherwise, express as: attribute="value"
        for (var a in (options.hash)) {
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