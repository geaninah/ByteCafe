// main api logic

// libraries
var express         = require("express");
var fs              = require("fs");
var path            = require("path");
var moment          = require("moment");

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
    }
  }
};
