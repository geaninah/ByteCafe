// import libraries
var api      = require("./api.js");
var express  = require("express");
var database = require("../services/databaseService.js");

// export the routes that the app should follow
module.exports = function(app) {

    // api calls
    app.get("/api/hello",                     api.hello);
    app.get("/api/terms",                     api.terms);
    app.get("/api/status",                    api.status);

    app.get("/api/cafes",                     api.getCafes);
    app.get("/api/cafes/:cafeId",             api.getCafeInfo);
    app.get("/api/cafes/:cafeId/products",    api.getProducts);
    app.get("/api/cafes/:cafeId/orders",      api.getOrderInfo);
    app.get("/api/products/:productId",       api.getOrders);
    app.get("/api/orders/:orderId",           api.getOrderInfo);
    
    // authentication calls
    app.use("/auth*",                         api.notImplemented);

    // serve static content
    app.use("/images",                        express.static("resources/images"));
    app.use("/css",                           express.static("resources/css"));

    // serve the main pages
    app.get("/", function(req, res) {
        res.render("index.ejs");
    });

    app.get("/cafes", function(req, res) {
         database.getCafes(function(err, cafes) {
            res.render("menu.ejs", {cafes});
        });
    });

    app.get("/cafe/:cafeId", function(req, res) {

    });
};
