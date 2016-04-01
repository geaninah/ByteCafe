// load libraries and tools
var express      = require("express");
var session      = require("express-session");
var cookieParser = require("cookie-parser");
var bodyParser   = require("body-parser");
var passport     = require("passport");
var flash        = require("connect-flash");
var morgan       = require("morgan");
var mysql        = require("mysql");
var death        = require("death");

// load our remember me middleware
var rememberme   = require("./app/remember-me.js");

// load our configuration
var config = require("./config/config.js")
var port = config.http_port;

// load our database and email providers
var database = require("./services/database-service.js");
var email    = require("./services/email-service.js");

// make sure we disconnect cleanly on any kind of quit
death(function(signal, err) {
  // additional graves...
  console.log("Cleaning up:")
  console.log("Closing database connection");
  database.end();
  console.log("Quitting, goodbye");
  process.exit();
});

// setup passport
require("./app/passport.js")(passport, database);

// setup express app
var app = express();
app.use(morgan("dev"));
app.set("x-powered-by", false);
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(session({
  secret: "well its not secret anymore",
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(rememberme(database));

// setup routes
require("./app/routes.js")(app, passport, database, email);

// start server
// TODO: setup and enforce https
console.log("Listening on port " + port);
app.listen(port);
