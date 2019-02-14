// *****
// handlebars helper module
//
// debug info
//
// @param optionalValue1, optionalValue2: optional values passed to the helper to also display
// *****

module.exports = function(optionalValue1, optionalValue2) {

    console.log("====================");
    console.log("Current Context");
    console.log(this);

    if (optionalValue1) {
        console.log("Value 1:");
        console.log("===========");
        console.log(optionalValue1);
    }

    if (optionalValue2) {
        console.log("Value 2:");
        console.log("===========");
        console.log(optionalValue2);
    }

    console.log("end debug ====================");
    console.log("\r");
};