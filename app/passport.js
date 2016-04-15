// libraries
var LocalStrategy  = require("passport-local").Strategy;
var mysql          = require("mysql");
var bcrypt         = require("bcrypt-nodejs");
var express        = require('express');
var crypto         = require('crypto');
var async          = require('async');
var nodemailer     = require('nodemailer');
var secure         = require("secure-random");

// load config
var config         = require("../config/config");

String.prototype.hashCode = function() {
  var hash = 0, i, chr, len;
  if (this.length === 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

// export our passport configuration function
module.exports = function(passport, database, email_service) {

  // turn a user into an id
  passport.serializeUser(function(user, done) {
    done(null, user.user_id);
  });

  // turn an id into a user
  passport.deserializeUser(function(id, done) {
    database.getUserByID(id, function(err, rows) {
      if (err) return done(err);
      var user = rows[0];           // FIXME This line gives errors
      delete user.user_password;    // we don't need the users password
      done(null, user);
    });
  });

  // create user strategy using mysql
  passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  }, function(req, email, password, done) {
    // check if the user already exists
    database.getUserByEmail(email, function(err, rows) {
      // fail on catch sql error
      if (err)  return done(null, false, {message: "Sorry, something went wrong. Please try again later!"});
      // fail if user already exists
      if (rows.length) return done(null, false, {message: "This email is already in use!"});
      else {
        // generate our bcrypt hash
        bcrypt.hash(password, null, null, function(err, hashed_password) {
          // add them to the user database (the defaults are set in the mysql database)
          database.enrolNewUser(email, hashed_password, function(err, rows) {
            // fail on sql error
            if(err) {
              console.log(err);
              return done(null, false, {message: "Sorry, something went wrong. Please try again later!"});
            }
            // create our new user object
            var new_user = {
              user_id: rows.insertId,
              user_email: email,
              user_name: null,
              user_disabled: 0,
              user_permission_store: 1,
              user_permission_pos:   0,
              user_permission_stock: 0,
              user_permission_admin: 0,
              user_token: email.hashCode
            };
            // complete user registration & log in
            email_service.sendMailValidation(email, 'Please confirm e-mail'); 
            return done(null, false, "Please check your email");
          });
        });
      }
    });
  }));

  // login strategy using mysql
  passport.use("local-login", new LocalStrategy({
    usernameField: "email",
    passwordField: "password",
    passReqToCallback: true
  }, function(req, email, password, done) {
    // check if our user exists
    database.getUserByEmail(email, function(err, rows) {
      // catch sql error
      if(err) {
        console.log(err);
        return done(null, false, {message: "Sorry, something went wrong. Please try again later!"});
      }
      // if no such user
      if(!rows.length)
        return done(null, false, {message: "Incorrect email or password!"});
      // FIXME: This line gives errors
      var user = rows[0];
      // if users password is incorrect
      bcrypt.compare(password, user.user_password, function(err, valid_password) {
        // catch bcrypt error
        if(err) {
          console.log(err);
          return done(null, false, {message: "Sorry, something went wrong. Please try again later!"});
        }
        if(!valid_password)
          return done(null, false, {message: "Incorrect email or password!"});
        // no point keeping the users password in memory past this point
        delete user.user_password;
        // if users account is marked disabled
        if(user.disabled) return done(null, false, {message: "This account has been disabled."});
        if(!user.user_verified_email) return done(null, false, {message: "Your must verify your email address."});

        // if user requested to remember them, save them a cookie!
        if (req.body.remember_me_box) return createAndSaveRememberCookie(done, req, user);
        // else just validate auth
        else return done(null, user);
      });
    });
  }));

  // create our remember me cookie and insert the tokens into the database
  var createAndSaveRememberCookie = function(done, req, user) {
    var res = req.res;
    var selector  = secure(48, {type: "Buffer"}).toString("base64");
    var validator = secure(48, {type: "Buffer"}).toString("base64");
    database.addRememberMeToken(user.user_id, selector, validator, function(err, rows) {
      if (err) {
        console.log("Error adding rememberme token" + err);
        return done(null, user); // we don't need to fail on error here
      }
      res.cookie("rememberme", selector + "$" + validator, {
        httpOnly: true,
        maxAge: 2 * 7 * 24 * 60 * 60 * 1000 // 2 weeks
      });
      return done(null, user);
    });
  }
}
