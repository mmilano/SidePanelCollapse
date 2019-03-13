// *****
// handlebars helper module
//
// debug info
//
// @param argument1, argument2: optional values passed to the helper to also display
//
// usage: {{debug argument1, argument2}}
// *****

module.exports = function(argument1, argument2) {
    let val;
    let i;

    console.log("DEBUG ====================");
    console.log("Current Context");
    console.log(this);
    console.log("====================");


    val = (typeof argument1 === "undefined") ? false : argument1;
    if (val) {

        console.log ("ARGUMENT 1:");
        if (typeof val === "object") {

           for (i in val) {
                let k = val[i];
                console.log(i + ":" + k);
            };

        } else {
            console.log("value:", val);

        }
    }

    val = (typeof argument2 === "undefined") ? false : argument2;
    if (val) {
        console.log ("ARGUMENT 2:");
        if (typeof val === "object") {

           for (i in val) {
                let k = val[i];
                console.log(i + ":" + k);
            };

        } else {
            console.log("value:", val);

        }
    }

    console.log("end debug ====================");
    console.log("\r");
};