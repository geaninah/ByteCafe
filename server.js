// load librarys and tools
var express = require("express");

// setup express app
var app = express();
var port = process.env.PORT || 8080;

// test page
app.get("/", function(req, res) {
  res.end("Hello world!");
});

// start server
app.listen(port);
