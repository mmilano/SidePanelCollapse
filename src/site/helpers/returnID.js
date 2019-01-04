// *****
// handlebars helper module
//
// simple return of object.key's value
//
// @param {object} object: the source object
// @param {string} id: the key to look for in the object
// @returns the value of id

module.exports = function(object, id) {
    return object[id];
};