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
var path         = require("path");

// load our configuration
var config = require("./config/config")
var port = config.http_port;

// setup our logger
var logger = require("./services/logger-service");
var log    = logger.init(path.join(__dirname, "logs"), email);
log(3, "Server", "Starting server");

// load our database, email and log providers
var database = require("./services/database-service");
var email    = require("./services/email-service");


// load our remember me middleware
var rememberme   = require("./app/remember-me");
rememberme.init(database);

// make sure we disconnect the database cleanly on any kind of quit
death(function(signal, err) {
  // additional graves...
  log(3, "Server", "Stopping server");
  console.log("Cleaning up:")
  console.log("Closing database connection");
  database.end();
  console.log("Quitting, goodbye");
  process.exit();
});

// setup passport
require("./app/passport")(passport, database, email);



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
app.use(rememberme.login);

// setup routes
log(3, "Server", "Initializing routes");
require("./app/routes")(app, passport, rememberme, database, email, log);

// start server
// TODO: setup and enforce https
log(3, "Server", "Startup complete, waiting for connections on port " + port);
console.log("Listening on port " + port);
app.listen(port);
