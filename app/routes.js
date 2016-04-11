// import libraries
var express  = require("express");

// export the routes that the app should follow
module.exports = function(app, passport, rememberme, database, email) {
  // initialize our api
  var api = require("./api.js")(database, email);

  // api calls
  app.get("/api/hello",                         api.hello);
  app.get("/api/terms",                         api.terms);
  app.get("/api/status",                        api.status);

  // cafe calls
  app.get("/api/cafes",                         isLoggedInAPI, api.getCafes);
  app.get("/api/cafes/:cafeId",                 isLoggedInAPI, api.getCafeInfo);
  app.get("/api/cafes/:cafeId/products",        isLoggedInAPI, api.getProducts);
  app.get("/api/cafes/:cafeId/orders",          isLoggedInAPI, api.getOrders);
  app.get("/api/products/:productId",           isLoggedInAPI, api.getProductInfo);
  app.get("/api/products/:productId/nutrition", isLoggedInAPI, api.getNutrition);
  app.get("/api/orders/:orderId",               isLoggedInAPI, api.getOrderInfo);
  app.get("/api/basket",                        isLoggedInAPI, api.getBasket);
  app.get("/api/basket/edit",                   isLoggedInAPI, api.editBasket);

  // admin panel calls
  app.get("/api/admin/user/update",             isLoggedInAPI, api.admin.assert, api.admin.updateUser);

  // serve static content
  app.use("/images",                            express.static("resources/images"));
  app.use("/css",                               express.static("resources/css"));

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

  app.get("/auth/logout", rememberme.logout, function(req, res) {
    req.logout();
    req.flash("loginMessage", "You've successfully logged out!");
    res.redirect("/");
  });

  // serves calls for forgotten password
  app.get("/auth/forgot", api.resetPassword);
  app.get("/auth/reset", api.verifyResetToken, function(req, res) {
    res.render("reset_pass.ejs", {token: req.query.token});
  });
  app.post("/auth/reset", api.verifyResetTokenPost, api.updatePassword);

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

  app.get("/verify-email/:token", function(req, res){
    database.verifyEmail(req.params.token, function(err){
      res.redirect("/cafes");
    });
  });

  // serve cafe products
  app.get("/cafe/:cafeId", isLoggedIn, function(req, res) {
    database.getCafes(function(err, cafes) {
      database.getCafeInfo(function(err, infos) {
        database.getProducts(function(err, products) {
          database.getAllCategories(function(err, categories) {
            res.render("cafe.ejs", {
              cafe: infos,
              cafes: cafes,
              user: req.user,
              categories: categories,
              products: products
            });
          });
        }, req.params.cafeId);
      }, req.params.cafeId);
    });
  });

  // serve basket
  app.get("/basket", isLoggedIn, function(req, res) {
    database.getBasket(function(err, basket) {
      var basket_contents = {};
      basket.forEach(function(item) {
        basket_contents[item.basket_item_cafe_id] = basket_contents[item.basket_item_cafe_id] || [];
        basket_contents[item.basket_item_cafe_id].push({
          product_id: item.basket_item_product_id,
          name: item.product_name,
          price: item.product_price,
          cafe_id: item.basket_item_cafe_id,
          cafe_name: item.cafe_name,
          amount: item.basket_item_amount
        });
      });
      database.getCafes(function(err, cafes) {
        res.render("basket.ejs", {basket: basket_contents, cafes: cafes, user: req.user});
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

  app.get("/usr_mng", isLoggedIn, function(req, res) {
    database.getCafes(function(err, cafes) {
      database.getAllUsers(function(err, users){
        res.render("user_mng.ejs", {users: users, cafes: cafes, user: req.user});
      });
    });
  });
};

// perform valid user check for serving browsers
function isLoggedIn(req, res, next) {
  if(req.isAuthenticated())
    return next();
  req.flash("error", "Please log in!");
  res.redirect("/");
}

// perform valid user check for serving api calls
function isLoggedInAPI (req, res, next) {
  if(req.isAuthenticated())
    return next();
  res.status(401);
  res.end(JSON.stringify({
    error: true,
    message: "Unauthorized: please POST "
           + "email=<your-email>&password=<your-password> to /auth/login"
  }));
}
