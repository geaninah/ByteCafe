// import libraries
var api      = require("./api.js");
var express  = require("express");
var database = require("../services/databaseService.js");

// export the routes that the app should follow
module.exports = function(app, passport) {

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
    app.get("/api/basket",                    api.getBasket);
    
    // serve static content
    app.use("/images",                        express.static("resources/images"));
    app.use("/css",                           express.static("resources/css"));

    // authentication calls
    app.post("/auth/login", passport.authenticate("local-login", {
      successRedirect: "/cafes",
      failureRedirect: "/",
      failureFlash: true  
    }));

    app.post("/auth/signup", passport.authenticate('local-signup',{
      successRedirect: "/cafes",
      failureRedirect: "/",
      failureFlash: true  
    }));

    app.get("/auth/logout", function(req, res) {
      req.logout();
      req.flash("loginMessage", "You've successfully logged out!");
      res.redirect("/");
    });

    // serve the main pages
    app.get("/", function(req, res) {
        res.render("index.ejs", {
            login_message: req.flash("loginMessage"),
            signup_message: req.flash("signupMessage")
        });
    });

    // serve cafe list
    app.get("/cafes", isLoggedIn, function(req, res) {
        database.getCafes(function(err, cafes) {
            res.render("menu.ejs", {cafes: cafes, user: req.user});
        });
    });

    // serve cafe products
    app.get("/cafe/:cafeId", isLoggedIn, function(req, res) {
        database.getCafeInfo(function(err, infos) {
            database.getProducts(function(err, products) {
                console.log({cafe: infos, products: products});
                res.render("cafe.ejs", {cafe: infos, products: products});
            }, req.params.cafeId);
        }, req.params.cafeId);
    });

    // serve basket
    app.get("/basket", isLoggedIn, function(req, res) {
        database.getBasket(function(err, basket) {
            database.getCafes(function(err, cafes) {
                res.render("basket.ejs", {basket: basket, cafes: cafes, user: req.user});
            });
        });
    });
};

function isLoggedIn(req, res, next) {
  if(req.isAuthenticated())
    return next();
  req.flash("loginMessage", "Please log in!");
  res.redirect("/");
}
