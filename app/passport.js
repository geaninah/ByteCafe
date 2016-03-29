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
      if (err)  return done(null, false, {message: "Sorry, something went wrong. Please try again later!"});
      // fail if user already exists
      if (rows.length) done(null, false, {message: "This email is already in use!"});
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
            return done(null, false, {message: "Sorry, something went wrong. Please try again later!"});
          }

          // add our user id
          newUser.user_id = rows.insertId;
          return done(null, user);
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
      if(!bcrypt.compareSync(password, user.password))
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

  // forgotten password logic
  passport.use("local-forgot", new LocalStrategy({
    usernameField: "email",
    passwordField: "password",
    passReqToCallback: true
  },
  function(req, email) {
    async.waterfall([
      function(done) {
        // generate a 64 char unique string
        var token = secure(48,{type: "Buffer"}).toString("base64");
        done(null, token);
      },
      function(token, done) {
        // ensure that the user is valid
        console.log("Password reset requested for " + email);
        connection.query("select * from users where users.email = ?", [email], function(err, rows) {
          // catch sql error
          if(err) { console.log(err); return done(null, false, {message: "Sorry, something went wrong. Please try again later!"}); } 
          // if no such user
          if(!rows.length) return done(null, false, {message: "This email address is not associated with any account!"});
          console.log("acct exists");
          var user = rows[0];  
          // if users account is marked disabled
          if(user.disabled) return done(null, false, {message: "This account has been disabled."});
          
          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

          user.save(function(err) {
            done(err, token, user);
          });
        }); 
      },       
      function(token, user, done) {
          var transport = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // use SSL
            auth: {
              user: 'user@gmail.com',
              pass: 'pass'
            }
          });
            var mailOptions = {
                to: user.email,
                from: "password_reset_no_reply@demo.com",
                subject: "Password Reset",
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            transporter.sendMail(mailOptions, function(err, info){
              if(err){
                return console.log(err);
              }
              console.log('Message sent: ' + info.response);
            });

            smtpTransport.sendMail(mailOptions, function(err) {
                req.flash('error', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                done(err, 'done');
            });
        }
    ], function(err) {
        if (err) return next(err);
        res.redirect('/');
    });
    })); 

}

// create our remember me cookie and insert the tokens into the database
var createAndSaveRememberCookie = function(done, req, user) {
  var res = req.res;
  var selector  = secure(48, {type: "Buffer"}).toString("base64");
  var validator = secure(48, {type: "Buffer"}).toString("base64");
  var query = "insert into remember_me_tokens (token_user_id, token_selector, token_validator, token_expires) "
            + "values (?, ?, ?, NOW() + INTERVAL 2 WEEK)";
  var params = [user.user_id, selector, validator];
  connection.query(query, params, function(err, rows) {
    res.cookie("rememberme", selector + "$" + validator, {httpOnly:true, maxAge:2 * 7 * 24 * 60 * 60 * 1000});
    return done(null, user);
  });
}
