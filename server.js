// load librarys and tools
var express = require("express");
var morgan  = require("morgan");

// setup express app
var app = express();
var port = process.env.PORT || 8080;
app.use(morgan("dev"));

// test page
app.get("/", function(req, res) {
  res.end("Hello world!");
});

// start server
app.listen(port);
