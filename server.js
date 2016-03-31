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

var rememberme   = require("./app/remember-me");


// load our configuration
var config = require("./config/config")
var port = config.http_port;

// setup our db connection
GLOBAL.connection = mysql.createConnection(config.database);
GLOBAL.connection.connect(function(err) {
  if (err) {
    console.error("Error connecting to database" + err);
    process.exit(1);
    return
  }
  console.log("Connected as id "+GLOBAL.connection.threadId);
});

// make sure we disconnect cleanly on any kind of quit
death(function(signal, err) {
  // additional graves...
  console.log("closing database connection");
  GLOBAL.connection.end();
  console.log("closed");
  console.log("Quitting, goodbye");
  process.exit();
});

// setup passport
require("./app/passport")(passport);

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
app.use(rememberme);

// setup routes
require("./app/routes")(app, passport);

// start server
console.log("Listening on port " + port);
app.listen(port);
