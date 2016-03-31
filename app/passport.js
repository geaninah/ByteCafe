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

  // create user strategy using mysql
  passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  function(req, email, password, done) {
    // check if the user already exists
    console.log("request to enrol " + email);
    connection.query("select * from users where users.user_email = ?", [email], function(err, rows) {
      // fail on catch sql error
      if (err)  return done(null, false, {message: "Sorry, something went wrong. Please try again later!"});
      // fail if user already exists
      if (rows.length) done(null, false, {message: "This email is already in use!"});
      else {
        // create our new user object
        var new_user = {
          user_email: email,
          user_name: null,
          user_disabled: 0,
          user_permission_store: 1,
          user_permission_pos:   0,
          user_permission_stock: 0,
          user_permission_admin: 0
        };
        // generate our bcrypt hash
        var hashed_password = bcrypt.hashSync(password, null, null)
        // add them to the user database (the defaults are set in the mysql database)
        var query = "insert into users ( user_email, user_password ) values (?,?)";
        var params = [new_user.user_email, hashed_password];
        connection.query(query, params, function(err, rows) {
          // fail on sql error
          if(err) {
            console.log(err);
            return done(null, false, {message: "Sorry, something went wrong. Please try again later!"});
          }
          // add our user id
          new_user.user_id = rows.insertId;
          // complete user registration & log in
          return done(null, new_user);
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
    console.log("checking login for: " + email);
    connection.query("select * from users where users.user_email = ?", [email], function(err, rows) {
      // catch sql error
      if(err) {
        console.log(err);
        return done(null, false, {message: "Sorry, something went wrong. Please try again later!"}); }
      // if no such user
      if(!rows.length)
        return done(null, false, {message: "Incorrect email or password!"});
      console.log(" acct exists");
      // This line gives errors - TO DO!!!
      var user = rows[0];
      // if users password is incorrect
      if(!bcrypt.compareSync(password, user.user_password))
        return done(null, false, {message: "Incorrect email or password!"});
      console.log(" pw accepted");
      // if users account is marked disabled
      if(user.disabled) return done(null, false, {message: "This account has been disabled."});
          console.log(req.body);

      // if user requested to remember them, save them a cookie!
      if (req.body.remember_me_box) return createAndSaveRememberCookie(done, req, user);
      // else just validate auth
      return done(null, user);
    });
  }));
}

// create our remember me cookie and insert the tokens into the database
var createAndSaveRememberCookie = function(done, req, user) {
  var res = req.res;
  var selector  = secure(48, {type: "Buffer"}).toString("base64");
  var validator = secure(48, {type: "Buffer"}).toString("base64");
  var query = "insert into remember_me_tokens (remember_me_token_user_id, remember_me_token_selector, "
            + "remember_me_token_validator, remember_me_token_expires) values (?, ?, ?, NOW() + INTERVAL 2 WEEK)";
  var params = [user.user_id, selector, validator];
  connection.query(query, params, function(err, rows) {
    res.cookie("rememberme", selector + "$" + validator, {httpOnly:true, maxAge:2 * 7 * 24 * 60 * 60 * 1000});
    return done(null, user);
  });
}
