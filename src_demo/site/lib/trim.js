// panini/handlebars js module
//
// will trim out whitespace and linebreaks from the given text, and
// reduces all multiple spaces down to single space.
//
// @param string
// @returns string

const trimSpace = (text) => {
    let t = text.trim();  // javscript string.trim() method: front and trailing space
    t = t.replace(/\s+/g, " ");  // replace all linebreaks w/1 space
    t = t.replace(/\s\s+/g, " ");  // replace all multiple spaces w/1 space
    return t;
};

module.exports = trimSpace;