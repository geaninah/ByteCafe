// main api logic
//
// 

// libraries
var express         = require("express");
var fs              = require("fs");
var path            = require("path");
var moment          = require("moment");
var databaseService = require("../services/databaseService");

// logic
module.exports = {
    // present some debug info 
    hello: function(req, res) {
        res.write("Hello World!\n");
        res.write("User: "    + process.env.USER + "\n");
        res.write("Dirname: " + __dirname        + "\n");
        res.end("ProcID: "    + process.pid      + "\n");
    },

    // fetch the terms and conditions
    terms: function(req, res) {
        res.sendFile(path.join(__dirname, "../config/terms.txt"));
    },

    // handle the authentication calls
    notImplemented: function(req, res) {
        res.end("Not implemented!");
    },

    // return status information
    status: function(req, res) {
        res.end("all good g\n");
    },

    // returns a list of cafes
    getCafes: function(req, res) {
        databaseService.getCafes(function(err, cafes){
            if(!err){
                res.end(JSON.stringify(cafes));
            }
        });
    },

    // returns information about a cafe
    getCafeInfo: function(req, res) {
        databaseService.getCafeInfo(function(err, cafes){
            if(!err){
                res.end(JSON.stringify(cafes));
            }
        }, req.cafeId);
    },

    // returns a list of products at a cafe
    getProducts: function(req, res) {
        databaseService.getProducts(function(err, products){
            if(!err){
                res.end(JSON.stringify(products));
            }
        }, req.cafeId);
    },

    // returns information about a products
    getProductInfo: function(req, res) {
        databaseService.getProductInfo(function(err, products){
            if(!err){
                res.end(JSON.stringify(products));
            }
        }, req.productId);
    },

    // returns queued orders at a cafe
    getOrders: function(req, res) {
        databaseService.getOrders(function(err, orders){
            if(!err){
                res.end(JSON.stringify(orders));
            }
        }, req.cafeId);
    },

    // returns information about a specific order
    getOrderInfo: function(req, res) {
        databaseService.getOrderInfo(function(err, orders){
            if(!err){
                res.end(JSON.stringify(orders));
            }
        }, req.orderId);
    },

    // returns basket information for a specific user
    getBasket: function(req, res) {
        databaseService.getBasket(function(err, basket){
            if(!err){
                res.end(JSON.stringify(basket));
            }
        }, req.userId);
    }
};
