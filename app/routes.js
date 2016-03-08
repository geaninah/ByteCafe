// import librarys
var express = require("express");
var fs      = require("fs");
var moment  = require("moment");

// export the routes that the app should follow
module.exports = function(app) {

// handle the api calls
  // handy test page test page
  app.use("/api/hello", function(req, res) {
    res.write("Hello World!\n");
    res.write("User: " + process.env.USERNAME + "\n");
    res.end("ProcID: " + process.pid          + "\n");
  });

  // fetch the terms and conditions
  app.get("/api/terms", function(req, res) {
    res.sendfile("config/terms.txt");
  });

// handle the authentication calls
  // not implemented yet
  app.use("/auth*", function(req, res) {
    res.end("Not implemented!");
  });


// handle misc calls
  // log any /robots.txt calls
  app.get("/robots.txt", function(req, res, next) {
    var logLine = req.connection.remoteAddress + " - " + moment().format("MM/DD/YY HH:MM:SS")
                  + ": " + req.headers['user-agent'] + "\n";
    fs.appendFile("logs/robots_requests", logLine);
    next(); // then use the default handler
  });


 // serve the static pages
 app.use("/", express.static("html"));
};
