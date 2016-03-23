// load libraries and tools
var express = require("express");
var morgan  = require("morgan");

// load our configuration
var config = require("./config/config.js")
var port = config.http_port;

// setup express app
var app = express();
var port = process.env.PORT || 8080;
app.use(morgan("dev"));

// setup routes
require("./app/routes.js")(app);

// start server
app.listen(port);
