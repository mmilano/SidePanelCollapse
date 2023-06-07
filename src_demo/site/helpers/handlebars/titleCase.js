// *****
// handlebars helper module
//
// title case the input
//
// @param string
// @returns string
"use strict";

const titlecase = require("ap-style-title-case");

module.exports = (str) => titlecase(str);