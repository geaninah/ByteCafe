// libraries
var LocalStrategy  = require("passport-local").Strategy;
var mysql          = require("mysql");
var bcrypt         = require("bcrypt-nodejs");
var express = require('express');
var RememberMeStrategy = require('passport-remember-me').Strategy;

// load config
var config         = require("../config/config.js");

// get our mysql connection
var connection = GLOBAL.connection;

module.exports = function(passport) {

  // turn a user into an id
  passport.serializeUser(function(user, done) {
    done(null, user.user_id);
  });

  // turn an id into a user
  passport.deserializeUser(function(id, done) {
    connection.query("select * from users where users.user_id = ? ", [id], function(err, rows) {
      // This line gives errors - TO DO!!!
      var user = rows[0];
      done(err, user);
    });
  });

  // strategy to use when creating a new user
  passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  function(req, email, password, done) {
    // check if the user already exists
    console.log("request to enrol "+email);
    connection.query("select * from users where users.email = ?", [email], function(err, rows) {
      // fail on catch sql error
      if (err)  return done(null, false, req.flash("signupMessage", "Sorry, something went wrong. Please try again later!"));
      // fail if user already exists
      if (rows.length) done(null, false, req.flash("signupMessage", "This email is already in use!"));
      else {
        // create our new user object
        var newUser = {
          email: email,
          password: bcrypt.hashSync(password, null, null),
          disabled: 0,
          permission_store: 1,
          permission_pos:   0,
          permission_stock: 0,
          permission_admin: 0
        };
        // add them to the user database (the defaults are set in the mysql database)
        connection.query("insert into users ( email, password ) values (?,?)",
                         [newUser.email, newUser.password],
                         function(err, rows) {
          // fail on sql error
          if(err) {
            console.log(err);
            return done(null, false, req.flash("signupMessage", "Sorry, something went wrong. Please try again later!"));
          }

          // add our user id
          newUser.user_id = rows.insertId;
          return(done, newUser);
        });
      }
    });
  }));

  // login strategy using mysql
  passport.use("local-login", new LocalStrategy({
    usernameField: "email",
    passwordField: "password",
    passReqToCallback: true
  },
  function(req, email, password, done) {
    // check if our user exists
    console.log("checking login for: "+email);
    connection.query("select * from users where users.email = ?", [email], function(err, rows) {
      // catch sql error
      if(err) { console.log(err); return done(null, false, req.flash("loginMessage", "Sorry, something went wrong. Please try again later!")); } 
      // if no such user
      if(!rows.length) return done(null, false, req.flash("loginMessage", "Incorrect email or password!"));
      console.log(" acct exists");
      // This line gives errors - TO DO!!!
      var user = rows[0];
      // if users password is incorrect
      if(!bcrypt.compareSync(password, user.password)) return done(null, false, req.flash("loginMessage", "Incorrect email or password!"));
      console.log(" pw accepted");
      // if users account is marked disabled
      if(user.disabled) return done(null, false, req.flash("loginMessage", "The account was disabled."));
      return done(null, user);
    }); 
  }));

  // rememberme strategy

  passport.use(new RememberMeStrategy(
  function(token, done) {
    Token.consume(token, function (err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      return done(null, user);
    });
  },

  function(user, done) {
    var token = utils.generateToken(64);
    Token.save(token, { userId: user.id }, function(err) {
      if (err) { return done(err); }
      return done(null, token);
    });
  }
  ));

};

// The following code generates the initial token:

/*

app.post('/auth/login', 
  passport.authenticate('local-login', { failureRedirect: '/auth/login', failureFlash: true }),
  function(req, res, next) {
    // issue a remember me cookie if the option was checked
    if (!req.body.remember_me_box) { return next(); }

    var token = utils.generateToken(64);
    Token.save(token, { userId: req.user.id }, function(err) {
      if (err) { return done(err); }
      res.cookie('remember_me', token, { path: '/', httpOnly: true, maxAge: 604800000 }); // 7 days
      return next();
    });
  },
  function(req, res) {
    res.redirect('/');
  });

*/ 

// BUT I cannot get it running because I do not have the app.configure thing I showed you
// Hence, it gives errors.

// I think that the remember me strategy above should work once we get the app.post running.
// At least, it does not break anything, which is always a good sign. 

// This is the code that configures the app (according to the documentation):

/*

var app = express();
app.configure(function() {
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.session({ secret: 'keyboard cat' }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(passport.authenticate('remember-me'));
  app.use(app.router);
});

*/

