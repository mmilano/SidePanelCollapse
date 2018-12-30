// gulp task file

const gulp =          require("gulp");

// webservers
const connect =       require("gulp-connect");
// const browserSync =   require("browser-sync").create("dev"); // create a browser sync instance with name "dev"

const networkInterfaces = require("os").networkInterfaces();


const siteBuildRoot = "./build/";


// figure out the current IP adress
// and then use that for configuring the webserver

// networkinterfaces:
// en0: wifi
// en4: ethernet

let currentAddress;
let ip_main, ip;

if (typeof networkInterfaces["en4"] !== "undefined") {
    ip_main = networkInterfaces["en4"];  // ethernet cableconsole.log ("ip_eth: ", ip_eth);
    ip = ip_main.find(netInterface => netInterface.family === "IPv4");
    currentAddress = ip.address;
} else if (typeof networkInterfaces["en0"] !== "undefined") {
    ip_main = networkInterfaces["en0"];  // wifi
    ip = ip_main.find(netInterface => netInterface.family === "IPv4");
    currentAddress = ip.address;
}

// console.log ("currentAddress:", currentAddress);


// webserver
// simple node server for dev

const serverOptions = {
    name: "dev",
    port: 9191,
    host: "127.0.0.1",
    defaultFile: "index.html",
    root: siteBuildRoot,
    directoryListing: {
      enable: false,
      path: "./"
    },
//     debug: true
};

gulp.task("webserver", function webserver(done) {
    connect.server(serverOptions);
    done();
});


const browseSyncOptions = {
    port: 9191,
    ui: {
        port: 8181
    },
    server: {
        baseDir: siteBuildRoot,
        serveStaticOptions: {
            extensions: ["html"]
        }
    },
    logLevel: "silent",
    logFileChanges: false,
    online: true,
    // Don't show any notifications in the browser
    notify: false,
    // Wait for a specified window of event-silence before sending any reload events
    reloadDebounce: 200,
    // Don't append timestamps to injected files
    timestamps: false
};

// gulp.task('browser-sync', function(done) {
//     browserSync.init ({
//         browseSyncOptions
//     });
//     done();
// });