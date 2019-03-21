// panini/handlebars js module
//
// invalidate the node require cache for a file
// original source: https://gist.github.com/adam-lynch/11037907

const path = require("path");

var requireNoCache = function(filePath) {
    "use strict";

    function _invalidateRequireCacheForFile(filePath) {
        delete require.cache[path.resolve(filePath)];
    }

    _invalidateRequireCacheForFile(filePath);
    return require(filePath);
};

module.exports = requireNoCache;