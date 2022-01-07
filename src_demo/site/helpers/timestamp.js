// *****
// handlebars helper module
//
// simple return of a datastamp
//
// @returns the datestamp

module.exports = function() {
    let nowDate = new Date();
    return nowDate.toDateString();
};