// libraries
var LocalStrategy  = require("passport-local").Strategy;
var mysql          = require("mysql");
var bcrypt         = require("bcrypt-nodejs");

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
      if (err)  return done(null, false, req.flash("signupMessage", "error creating account, please try again later"));
      // fail if user already exists
      if (rows.length) done(null, false, req.flash("signupMessage", "email in use"));
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
            return done(null, false, req.flash("signupMessage", "error creating account, please try again later"));
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
      if(err) { console.log(err); return done(null, false, req.flash("loginMessage", "error logging in, please try again later")); } 
      // if no such user
      if(!rows.length) return done(null, false, req.flash("loginMessage", "email or pass incorrect"));
      console.log(" acct exists");
      var user = rows[0];
      // if users password is incorrect
      if(!bcrypt.compareSync(password, user.password)) return done(null, false, req.flash("loginMessage", "email or pass incorrect"));
      console.log(" pw accepted");
      // if users account is marked disabled
      if(user.disabled) return done(null, false, req.flash("loginMessage", "account disabled"));
      return done(null, user);
    }); 
  }));
};


