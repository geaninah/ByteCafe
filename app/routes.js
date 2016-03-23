// import libraries
var express = require("express");
var fs = require("fs");
var moment = require("moment");
var databaseService = require("../services/databaseService");

// export the routes that the app should follow
module.exports = function(app) {
    app.use("/api/hello", function(req, res) {
        res.write("Hello World!\n");
        res.write("User: " + process.env.USERNAME + "\n");
        res.end("ProcID: " + process.pid + "\n");
    });

    // fetch the terms and conditions
    app.get("/api/terms", function(req, res) {
        res.sendfile("config/terms.txt");
    });

    // handle the authentication calls
    app.use("/auth*", function(req, res) {
        res.end("Not implemented!");
    });

    // handle misc calls
    // log any /robots.txt calls
    app.get("/robots.txt", function(req, res, next) {
        var logLine = req.connection.remoteAddress + " - " + moment().format("MM/DD/YY HH:MM:SS")
            + ": " + req.headers['user-agent'] + "\n";
        fs.appendFile("logs/robots_requests", logLine);
        next(); // then use the default handler
    });

    // serve the static pages
    app.use("/", express.static("html"));

    app.get("/api/status", function(req, res) {
        res.send(databaseService.getStatusInformation());
    });

    app.get("/api/cafes", function(req, res) {
        databaseService.getCafes(function(err, cafes){
            if(!err){
                res.send(cafes);
            }
        });
    });

    app.get("/api/cafes/:cafeId", function(req, res) {
        databaseService.getCafeInfo(function(err, cafes){
            if(!err){
                res.send(cafes);
            }
        }, req.cafeId);
    });

    app.get("/api/cafes/:cafeId/products", function(req, res) {
        databaseService.getProducts(function(err, products){
            if(!err){
                res.send(products);
            }
        }, req.cafeId);
    });

    app.get("/api/products/:productId", function(req, res) {
        databaseService.getProductInfo(function(err, products){
            if(!err){
                res.send(products);
            }
        }, req.productId);
    });

    app.get("/api/cafes/:cafeId/orders", function(req, res) {
        databaseService.getOrders(function(err, orders){
            if(!err){
                res.send(orders);
            }
        }, req.cafeId);
    });

    app.get("/api/orders/:orderId", function(req, res) {
        databaseService.getOrderInfo(function(err, orders){
            if(!err){
                res.send(orders);
            }
        }, req.orderId);
    });
};
