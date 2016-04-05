// main api logic

// libraries
var express         = require("express");
var fs              = require("fs");
var path            = require("path");
var moment          = require("moment");
var secure          = require("secure-random");
var bcrypt         = require("bcrypt-nodejs");

// main api functionality
module.exports = function (database, email) {
  return {
    // present some debug info
    hello: function(req, res) {
      res.header("Content-Type", "text/plain; charset=utf-8");
      res.write("Hello World!\n");
      res.write("User: "    + process.env.USER + "\n");
      res.write("Dirname: " + __dirname        + "\n");
      res.end("ProcID: "    + process.pid      + "\n");
    },

    // fetch the terms and conditions
    terms: function(req, res) {
      res.header("Content-Type", "text/html; charset=utf-8");
      res.sendFile(path.join(__dirname, "../config/terms.txt"));
    },

    // placeholder for not implemented functionality
    notImplemented: function(req, res) {
      res.header("Content-Type", "text/plain; charset=utf-8");
      res.end("Not implemented!\n");
    },

    // return status information
    status: function(req, res) {
      res.header("Content-Type", "text/plain; charset=utf-8");
      res.end("all good g\n");
    },

    // generate a password reset token, add it to the database and email it
    resetPassword(req, res) {
      // deliberately fail
      if (req.query.email === "force-fail") {
        res.header("Content-Type", "application/json; charset=utf-8");
        res.end(JSON.stringify({status:0, message: "Error sending email"}));
        return
      }

      // check email address is an actual email address
      if (req.query.email === "force-fail") {
        res.header("Content-Type", "application/json; charset=utf-8");
        res.end(JSON.stringify({status:0, message: "Error sending email"}));
        return
      }

      var validator = secure(48, {type: "Buffer"}).toString("base64"); // HACK
      var url_friendly_validator = validator.replace(/\+/g,".").replace(/\//g, "_").replace(/=/g, "-");
      database.addPasswordResetToken(req.query.email, validator, function(err, rows) {
        if (err === "no-user") {
          var message = "You (or someone else) has entered this email when attempting to reset the password of a bytecafe account, however we do not have an account tied to this email address.\n\nIf you are a bytecafe customer and were expecting this email, make sure that you reset your password with the email address that you signed up with.\n\nIf you were not expecting this email it is safe to ignore it.\n\nKind regards,\n\nbytecafe programmers";
        } else {
          var message = "You (or someone else) has requested to reset the password of your bytecafe account.\n\nTo do so, visit the link below\n\nhttp://"+req.headers.host+"/auth/reset?token="+url_friendly_validator+"\n\nIf this was not you, it is safe to ignore this email. \n\nKind regards,\n\nbytecafe programmers";
        }
        email.sendMessage(req.query.email, "Bytecafe password reset", message);
        res.header("Content-Type", "application/json; charset=utf-8");
        res.end(JSON.stringify({status:1, message: "Email sent"}));
      });
    },

    verifyResetToken(req, res, next) {
      var actual_token = req.query.token.replace(/\./g,"+").replace(/_/g, "/").replace(/-/g, "="); // HACK
      database.getPasswordResetToken(actual_token, function(err, rows){
        if(!rows.length) {
          res.status(401);
          res.header("Content-Type", "text/plain; charset=utf-8");
          res.end("Token is incorrect, try resetting your password again");
        } else {
          return next();
        }
      });
    },

    // same as above but with post requests
    verifyResetTokenPost(req, res, next) {
      var actual_token = req.body.token.replace(/\./g,"+").replace(/_/g, "/").replace(/-/g, "="); // HACK
      database.getPasswordResetToken(actual_token, function(err, rows){
        if(!rows.length) {
          res.status(401);
          res.header("Content-Type", "text/plain; charset=utf-8");
          res.end("Token is incorrect, try resetting your password again");
        } else {
          return next();
        }
      });
    },

    // resets a password from a reset token and a password
    updatePassword(req, res) {
      var actual_token = req.body.token.replace(/\./g,"+").replace(/_/g, "/").replace(/-/g, "="); // HACK
      var password = req.body.password;
      if(password == "") {
        res.header("Content-Type", "application/json; charset=utf-8");
        res.end(JSON.stringify({status:0, message:"Password cannot be blank"}));
        return
      }
      database.getPasswordResetToken(actual_token, function(err, rows) {
        var hashed_password = bcrypt.hashSync(password, null, null);
        database.consumePasswordResetToken(rows[0].password_reset_token_user_id, function(err){
          if(err) {
            res.end(JSON.stringify({status:0, message:"Failed to change password"}));
            console.log(err);
            return;
          }
          database.updatePassword(rows[0].password_reset_token_user_id, hashed_password, function(err, rows) {
            res.header("Content-Type", "application/json; charset=utf-8");
            if(err) {
              res.end(JSON.stringify({status:0, message:"Failed to change password"}));
              console.log(err);
              return;
            }
            res.end(JSON.stringify({status:1, message:"Password successfully reset"}));

          });
        });
      });
    },

    // returns a list of cafes
    getCafes: function(req, res) {
      database.getCafes(function(err, cafes){
        if(!err){
          res.header("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify(cafes));
        }
      });
    },

    // returns information about a cafe
    getCafeInfo: function(req, res) {
      database.getCafeInfo(function(err, cafes){
        if(!err){
          res.header("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify(cafes));
        }
      }, req.params.cafeId);
    },

    // returns a list of products at a cafe
    getProducts: function(req, res) {
      database.getProducts(function(err, products){
        if(!err){
          res.header("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify(products));
        }
      }, req.params.cafeId);
    },

    // returns information about a products
    getProductInfo: function(req, res) {
      database.getProductInfo(function(err, products){
        if(!err){
          res.header("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify(products));
        }
      }, req.params.productId);
    },

    // returns nutritional information about a product
    getNutrition: function (req, res) {
      database.getNutritionalFlags(req.params.productId, function(err, rows) {
        if(!err) {
          res.header("Content-Type", "application/json; charset=utf-8");
          var response = {};
          var allergens = [];
          rows.forEach(function(row){
            if(row.nutritional_flag_type.startsWith("gda")) {
              response[row.nutritional_flag_type] = row.nutritional_flag_value;
            } else if (row.nutritional_flag_type === "allergen") {
              allergens.push(row.nutritional_flag_value);
            }
          });
          response.allergens = allergens;
          res.end(JSON.stringify(response));
        }
      });
    },

    // returns queued orders at a cafe
    getOrders: function(req, res) {
      database.getOrders(function(err, orders){
        if(!err){
          res.header("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify(orders));
        }
      }, req.params.cafeId);
    },

    // returns information about a specific order
    getOrderInfo: function(req, res) {
      database.getOrderInfo(function(err, orders){
        if(!err){
          res.header("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify(orders));
        }
      }, req.params.orderId);
    },

    // returns basket information for a specific user
    getBasket: function(req, res) {
      database.getBasket(function(err, basket){
        if(!err){
          res.header("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify(basket));
        }
      }, req.user.user_id);
    },

    // modifies the contents of a users basket
    editBasket: function(req, res) {
      res.header("Content-Type", "text/plain; charset=utf-8");
      res.end("Not done yet :c");
    }
  }
};
