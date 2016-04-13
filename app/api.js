// main api logic

// libraries
var express         = require("express");
var fs              = require("fs");
var path            = require("path");
var moment          = require("moment");
var secure          = require("secure-random");
var bcrypt          = require("bcrypt-nodejs");

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
    resetPassword: function(req, res) {
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

    verifyResetToken: function(req, res, next) {
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
    verifyResetTokenPost: function(req, res, next) {
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
    updatePassword: function(req, res) {
      var actual_token = req.body.token.replace(/\./g,"+").replace(/_/g, "/").replace(/-/g, "="); // HACK
      var password = req.body.password;
      if(password == "") {
        res.header("Content-Type", "application/json; charset=utf-8");
        res.end(JSON.stringify({status:0, message: "Password cannot be blank"}));
        return
      }
      database.getPasswordResetToken(actual_token, function(err, rows) {
        var hashed_password = bcrypt.hashSync(password, null, null);
        database.consumePasswordResetToken(rows[0].password_reset_token_user_id, function(err){
          if(err) {
            res.end(JSON.stringify({status:0, message: "Failed to change password"}));
            console.log(err);
            return;
          }
          database.updatePassword(rows[0].password_reset_token_user_id, hashed_password, function(err, rows) {
            res.header("Content-Type", "application/json; charset=utf-8");
            if(err) {
              res.end(JSON.stringify({status: 0, message: "Failed to change password"}));
              console.log(err);
              return;
            }
            res.end(JSON.stringify({status: 1, message: "Password successfully reset"}));
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

    // modifies the contents of a users basket TODO
    editBasket: function(req, res) {
      var amount = req.query.amount;
      var product_id = req.query.product_id;
      var cafe_id = req.query.cafe_id;
      // ensure input is valid
      // HACK change the a(nubmer) regex and code to something more sensible
      if(!/^(\-|a)?\d+$/.test(amount) || isNaN(product_id) || isNaN(cafe_id)) {
        res.header("Content-Type", "application/json; charset=utf-8");
        res.end(JSON.stringify({status: 0, message: "Invalid input" }));
      } else {
        product_id = Number(product_id);
        cafe_id = Number(cafe_id);
        database.getBasketItems(req.user.user_id, function(err, rows) {
          var basket_item = null;
          var new_amount = null;
          var old_amount = null;
          rows.forEach(function(row) {
            if(row.basket_item_product_id == product_id && row.basket_item_cafe_id == cafe_id) {
              old_amount = row.basket_item_amount;
              basket_item = row;
            }
          });

          if(!basket_item) {
            old_amount = 0;
          }
          if(amount.startsWith("a"))
            new_amount = Number(old_amount) + Number(amount.slice(1));
          else if(amount.startsWith("-"))
            new_amount = Number(old_amount) - amount.slice(1);
          else
            new_amount = Number(amount);
          if (new_amount < 0) new_amount = 0;

          res.header("Content-Type", "application/json; charset=utf-8");
          // if we're deleting an item
          if (new_amount == 0) {
            database.deleteBasketItems(req.user.user_id, product_id, cafe_id, function(err, rows) {
              if (err) {
                console.log(err);
                return res.end(JSON.stringify({status: 1, old_amount: old_amount, new_amount: new_amount, message: "Failed, please try again later" }));
              }
              return res.end(JSON.stringify({status: 1, old_amount: old_amount, new_amount: 0, message: "Updated" }));
            });
          }

          // if we're adding a new item
          else if (old_amount == 0) {
            database.addBasketItems(req.user.user_id, product_id, cafe_id, new_amount, function(err, rows) {
              if (err) {
                console.log(err);
                return res.end(JSON.stringify({status: 0, old_amount: old_amount, new_amount: old_amount, message: "Failed, please try again later" }));
              }
              return res.end(JSON.stringify({status: 1, old_amount: old_amount, new_amount: new_amount, message: "Updated" }));
            });
          }

          // if we're updating the amount of an existing item
          else {
            database.editBasketItems(new_amount, cafe_id, req.user.user_id, product_id, function(err, rows) {
              if (err) {
                console.log(err);
                return res.end(JSON.stringify({status: 0, old_amount: old_amount, new_amount: old_amount, message: "Failed, please try again later" }));
              }
              return res.end(JSON.stringify({status: 1, old_amount: old_amount, new_amount: new_amount, message: "Updated" }));
            });
          }
        });
      }
    },

    // admin functions
    admin: {
      // used to ensure the user is an administrator
      assert: function(req, res, next) {
        if (req.user.user_permission_admin != 1) {
          res.status(403);
          res.end(JSON.stringify({status: 0, message: "Permission denied"}));
        } else {
          return next();
        }
      },

      // update user information
      updateUser: function(req, res) {
        res.header("Content-Type", "application/json; charset=utf-8");
        var params = req.query;
        if (!params.id || !params.name || !params.email || !params.disabled || !params.permission_pos || !params.permission_store || !params.permission_stock || !params.permission_admin  || !params.verified_email)
          return res.end(JSON.stringify({status: 0, message: "Invalid input, all fields must be specified" }));
        if (isNaN(params.id) || isNaN(params.disabled) || isNaN(params.permission_pos) || isNaN(params.permission_store) || isNaN(params.permission_stock) || isNaN(params.permission_admin) || isNaN(params.verified_email))
          return res.end(JSON.stringify({status: 0, message: "Invalid input, id, user_disabled, user_verified_email and user_permission_* must be numbers" }));
        database.getUserByID(params.id, function(err, rows) {
          if(err) {console.log(err); return res.end(JSON.stringify({status: 0, message: "Server side exception"}));}
          if(!rows.length) return res.end(JSON.stringify({status: 0, message: "User does not exist"}));
          if(!params.password) {
            params.password = rows[0].user_password;
          } else {
            params.password = bcrypt.hashSync(params.password, null, null);
          }
          database.editUser(params.name, params.email, params.password, params.disabled, params.permission_store, params.permission_pos, params.permission_stock, params.permission_admin, params.verified_email, params.id, function(err, rows) {
            if(err) {console.log(err); return res.end(JSON.stringify({status: 0, message: "Server side exception"}));}
            return res.end(JSON.stringify({status: 1, message: "User updated" }));
          });
        });
      }
    },

    // update user information
    updateAccount: function(req, res) {
      res.header("Content-Type", "application/json; charset=utf-8");
      var params = req.query;
      if (!params.id || !params.name || !params.email || !params.disabled || !params.permission_pos || !params.permission_store || !params.permission_stock || !params.permission_admin  || !params.verified_email)
        return res.end(JSON.stringify({status: 0, message: "Invalid input, all fields must be specified" }));
      if (isNaN(params.id) || isNaN(params.disabled) || isNaN(params.permission_pos) || isNaN(params.permission_store) || isNaN(params.permission_stock) || isNaN(params.permission_admin) || isNaN(params.verified_email))
        return res.end(JSON.stringify({status: 0, message: "Invalid input, id, user_disabled, user_verified_email and user_permission_* must be numbers" }));
      database.getUserByID(params.id, function(err, rows) {
        if(err) {console.log(err); return res.end(JSON.stringify({status: 0, message: "Server side exception"}));}
        if(!rows.length) return res.end(JSON.stringify({status: 0, message: "User does not exist"}));
        if(!params.password) {
          params.password = rows[0].user_password;
        } else {
          params.password = bcrypt.hashSync(params.password, null, null);
        }
        database.editUser(params.name, params.email, params.password, params.disabled, params.permission_store, params.permission_pos, params.permission_stock, params.permission_admin, params.verified_email, params.id, function(err, rows) {
          if(err) {console.log(err); return res.end(JSON.stringify({status: 0, message: "Server side exception"}));}
          return res.end(JSON.stringify({status: 1, message: "User updated" }));
        });
      });
    }
  }
};
