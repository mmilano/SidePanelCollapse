// *****
// handlebars helper module
//
// simple return of a datastamp
//
// @returns the datestamp

module.exports = () => {
    return new Date().toDateString();
};