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

    app.get("/api/cafes",                     isLoggedInAPI, api.getCafes);
    app.get("/api/cafes/:cafeId",             isLoggedInAPI, api.getCafeInfo);
    app.get("/api/cafes/:cafeId/products",    isLoggedInAPI, api.getProducts);
    app.get("/api/cafes/:cafeId/orders",      isLoggedInAPI, api.getOrderInfo);
    app.get("/api/products/:productId",       isLoggedInAPI, api.getOrders);
    app.get("/api/orders/:orderId",           isLoggedInAPI, api.getOrderInfo);
    app.get("/api/basket",                    isLoggedInAPI, api.getBasket);
    //app.get("/api/tables",                    api.getTables);
    
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
      GLOBAL.connection.query("delete from remember_me_tokens where token_selector = ?", 
                              [req.cookies.rememberme.split("$")[0]],
                              function(err, rows){
                                console.log(err);
      });
      res.clearCookie("rememberme");
      req.logout();
      req.flash("loginMessage", "You've successfully logged out!");
      res.redirect("/");
    });

    // serves calls for forgotten password
    app.get("/forgot", function(req, res) {
        res.render('forgot', {
            user: req.user,
            forgot_message: req.flash("forgotMessage")
        });
    });

    app.post("/forgot", passport.authenticate("local-forgot",{
        successRedirect: "/",
        failureRedirect: "/",
        failureFlash: true
    }));

    // serve the main pages
    app.get("/", function(req, res) {
        if(req.isAuthenticated()) { res.redirect("/cafes"); return }
        res.render("index.ejs", {message: req.flash("error")});
    });

    // serve cafe list
    app.get("/cafes", isLoggedIn, function(req, res) {
        database.getCafes(function(err, cafes) {
            res.render("menu.ejs", {cafes: cafes, user: req.user});
        });
    });

    // serve cafe products
    app.get("/cafe/:cafeId", isLoggedIn, function(req, res) {
        database.getCafes(function(err, cafes) {
            database.getCafeInfo(function(err, infos) {
                database.getProducts(function(err, products) {
                    console.log({cafe: infos, products: products});
                    res.render("cafe.ejs", {cafes:cafes, user: req.user, cafe: infos, products: products});
                }, req.params.cafeId);
            }, req.params.cafeId);
        });
    });

    // serve basket
    app.get("/basket", isLoggedIn, function(req, res) {
        database.getBasket(function(err, basket) {
            database.getCafes(function(err, cafes) {
                res.render("basket.ejs", {basket: basket, cafes: cafes, user: req.user});
            });
        }, req.user.user_id);
    });

    app.get("/tables", isLoggedIn, function(req, res) {
        database.getCafes(function(err, cafes) {
            res.render("table_html.ejs", {cafes: cafes, user: req.user});
        });
    });

    app.get("/pos", isLoggedIn, function(req, res) {
        database.getCafes(function(err, cafes) {
            res.render("POS_side.ejs", {cafes: cafes, user: req.user});
        });
    });

    app.get("/account", isLoggedIn, function(req, res) {
        database.getCafes(function(err, cafes) {
            res.render("account-details.ejs", {cafes: cafes, user: req.user});
        });
    });
};

function isLoggedIn(req, res, next) {
  if(req.isAuthenticated())
    return next();
  req.flash("loginMessage", "Please log in!");
  res.redirect("/");
}

function isLoggedInAPI (req, res, next) {
  if(req.isAuthenticated())
    return next();
  res.status(401);
  res.end(JSON.stringify({error: true, message: "Unauthorized: please POST email=<your-email>&password=<your-password> to /auth/login"}));
}
