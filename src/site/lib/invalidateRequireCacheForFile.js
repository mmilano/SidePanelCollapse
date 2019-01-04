// function: invalidate the node require cache for a file
// https://gist.github.com/adam-lynch/11037907

const path = require('path');

var requireNoCache = (function() {

    var _invalidateRequireCacheForFile = function(filePath) {
        delete require.cache[path.resolve(filePath)];
    };

    var requireNoCache = function(filePath) {
        _invalidateRequireCacheForFile(filePath);
        return require(filePath);
    };

    return requireNoCache;

})();

module.exports = requireNoCache;
