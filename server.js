// load libraries and tools
var express = require("express");
var morgan  = require("morgan");
var mysql   = require("mysql");


// load our configuration
var config = require("./config/config.js")
var port = config.http_port;

// setup express app
var app = express();
var port = process.env.PORT || 8080;
app.use(morgan("dev"));
app.set("x-powered-by", false);
app.set("view engine", "ejs");

// setup routes
require("./app/routes.js")(app);

// start server
console.log("Listening on port " + port);
app.listen(port);
