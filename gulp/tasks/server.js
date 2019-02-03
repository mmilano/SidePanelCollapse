// gulp task file
//
// simple node server for dev
// along with simple utility function to show current IP address

const gulp =          require("gulp");

// webservers
const connect =       require("gulp-connect");
// const browserSync =   require("browser-sync").create("dev"); // create a browser sync instance with name "dev"

const networkInterfaces = require("os").networkInterfaces();

const siteBuildRoot = "./build/";


function findAddress() {
    let ip_main, ip, address;
    if (typeof networkInterfaces["en4"] !== "undefined") {
        ip_main = networkInterfaces["en4"];  // ethernet cableconsole.log ("ip_eth: ", ip_eth);
        ip = ip_main.find(netInterface => netInterface.family === "IPv4");
        address = ip.address;
    } else if (typeof networkInterfaces["en0"] !== "undefined") {
        ip_main = networkInterfaces["en0"];  // wifi
        ip = ip_main.find(netInterface => netInterface.family === "IPv4");
        address = ip.address;
    };
    return address;
}

let currentAddress = findAddress();
console.log ("***** current IP address:", currentAddress);


// note: host 0.0.0.0 allows a browser to view the built site at
// http://localhost:9191 OR http://[current IP address]:9191 (on macOS),
// & http://[current IP address]:9191 from a virtual (win10) machine.
// original source of this suggestion:
// https://stackoverflow.com/questions/10158771/access-localhost-on-the-main-machine-from-vmware-workstation-8-for-asp-net-devel/10159420#10159420

const serverOptions = {
    name: "dev",
    port: 9191,
    host: "0.0.0.0",
    defaultFile: "index.html",
    root: siteBuildRoot,
    directoryListing: {
      enable: false,
      path: "./"
    },
};

function webserver(done) {
    connect.server(serverOptions);
    done();
}

gulp.task("webserver", webserver);
