// *****
// handlebars helper module
//
// title case the input

const titlecase = require("ap-style-title-case");

module.exports = function(str) {
    "use strict";

    return titlecase(str);
};