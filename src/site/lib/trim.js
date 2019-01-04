// panini/handlebars js module
//
// will trim out whitespace and linebreaks from the given text.
// reduces all multiple spaces down to single space.

var trimSpace = function(text) {
    "use strict";

    let temp = text.trim();  // trim front and trailing space
    temp = temp.replace(/\s+/g, " ");  // reduce all linebreaks w/1 space
    temp = temp.replace(/\s\s+/g, " ");  // replace all multiple spaces w/1 space
    return temp;
};

module.exports = trimSpace;