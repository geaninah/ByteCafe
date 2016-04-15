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
  app.get("/api/account/update",                isLoggedInAPI, api.updateAccount);
  app.get("/api/admin/user/update",             isLoggedInAPI, api.admin.assert, api.admin.updateUser);
  app.get("/api/productManager/products/update",isLoggedInAPI, api.productManager.assert, api.productManager.updateProduct);
  app.get("/api/admin/user/create",             isLoggedInAPI, api.admin.assert, api.admin.createUser);
  app.get("/api/admin/user/delete",             isLoggedInAPI, api.admin.assert, api.admin.removeUser);
  app.get("/api/admin/cafes/update",            isLoggedInAPI, api.admin.assert, api.admin.updateCafe);
  app.get("/api/admin/cafes/delete",            isLoggedInAPI, api.admin.assert, api.admin.removeCafe);
  app.get("/api/admin/cafes/create",            isLoggedInAPI, api.admin.assert, api.admin.createCafe);
  app.get("/api/productManager/product/create", isLoggedInAPI, api.productManager.assert, api.productManager.createProduct);
  app.get("/api/productManager/product/delete", isLoggedInAPI, api.productManager.assert, api.productManager.removeProduct);
  app.get("/api/productManager/category/create",isLoggedInAPI, api.productManager.assert, api.productManager.createCategory);
  app.get("/api/productManager/category/delete",isLoggedInAPI, api.productManager.assert, api.productManager.removeCategory);

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

  // fetches the basket, calculates total and renders fake paypal screen
  app.get("/checkout/paypal", isLoggedIn, function(req, res) {
    database.getBasket(function(err, basket) {
      var total_price = 0;
      basket.forEach(function(basket_item) {
        console.log(total_price)
        total_price += basket_item.basket_item_amount * basket_item.product_price;
      });
      res.render("fake_paypal.ejs", {themoney: total_price, basket: basket});
    }, req.user.user_id);
  });

  // confims the order, and adds the basket contents to the
  app.get("/checkout/paypal/success", isLoggedIn, function(req, res){
    database.getBasket(function(err, basket) {
      var total_price = 0;
      basket.forEach(function(basket_item) {
        total_price += basket_item.basket_item_amount * basket_item.product_price;
      });
      total_price = total_price.toFixed(2);
      database.addOrder(req.user.user_id, 2, "paypalStringGoesHere", total_price, function(err, rows) {
        // our order id
        var order_id = rows.insertId;
        res.redirect("/checkout/success/" + order_id);
        basket.forEach(function(item) {
          database.addOrderItems(order_id, item.basket_item_product_id, item.basket_item_cafe_id, item.basket_item_amount, function(err, rows){});
          database.deleteBasketItems(req.user.user_id, item.basket_item_product_id, item.basket_item_cafe_id, function(err, rows){});
        });
      });
    }, req.user.user_id);
  });

  // paypal process has failed, do nothing
  app.get("/checkout/paypal/fail", isLoggedIn, function(req, res) {
    database.getCafes(function(err, cafes) {
      res.render("order_failed.ejs", {cafes: cafes, user: req.user, error: req.query.error || 3});
    });
  });

  app.get("/checkout/success/:orderId", isLoggedIn, function(req, res) {
    database.getCafes(function(err, cafes) {
      res.render("order_completed.ejs", {cafes: cafes, user: req.user, order_id: req.params.orderId});
    });
  });

  app.get("/orders", isLoggedIn, function(req, res) {
    database.getCafes(function(err, cafes){
      database.getOrdersByUserId(req.user.user_id, function(err, orders) {
        console.log(orders);
        res.render("order_list.ejs", {cafes: cafes, orders: orders, user: req.user});
      });
    });
  });

  app.get("/order/:orderId", isLoggedIn, function(req, res) {
    database.getCafes(function(err, cafes) {
      database.getOrder(req.params.orderId, function(err, order) {
        // make sure the user is allowed to view the basket
        if (order[0].order_user_id != req.user.user_id) {
          res.status(403);
          console.log("User check failed: " + order[0].order_user_id + " - " + req.user.user_id)
          return res.end("Sorry, you are not allowed to see this order");
        }
        database.getOrderItemsExtraData(req.params.orderId, function(err, items) {
          var order_contents = {};
          items.forEach(function(item) {
            order_contents[item.order_item_cafe_id] = order_contents[item.order_item_cafe_id] || [];
            order_contents[item.order_item_cafe_id].push({
              product_id: item.order_item_product_id,
              name: item.product_name,
              price: item.product_price,
              cafe_id: item.order_item_cafe_id,
              cafe_name: item.cafe_name,
              amount: item.order_item_amount
            });
          });
          res.render("order.ejs", {cafes: cafes, order: order[0], order_items: order_contents, user: req.user});
        });
      });
    });
  });

  app.get("/tables", isLoggedIn, function(req, res) {
    database.getCafes(function(err, cafes) {
      res.render("table_html.ejs", {cafes: cafes, user: req.user});
    });
  });

  // route for point of sale interface
  app.get("/pos", isLoggedIn, function(req, res) {
    database.getCafes(function(err, cafes) {
      res.render("POS_side.ejs", {cafes: cafes, user: req.user});
    });
  });

  // account management page
  app.get("/account", isLoggedIn, function(req, res) {
    database.getCafes(function(err, cafes) {
      res.render("account_details.ejs", {cafes: cafes, user: req.user});
    });
  });

  // administrators user management page
  app.get("/usr_mng", isLoggedIn, function(req, res) {
    database.getCafes(function(err, cafes) {
      database.getAllUsers(function(err, users){
        res.render("user_mng.ejs", {users: users, cafes: cafes, user: req.user});
      });
    });
  });

  app.get("/product_mng", isLoggedIn, function(req, res) {
    database.getCafes(function(err, cafes) {
      database.getAllProducts(function(err, products){
        database.getAllCategories(function(err, categories){
          res.render("product_mng.ejs", {categories: categories, products: products, cafes: cafes, user: req.user});
        });
      });
    });
  });

  app.get("/cafe_mng", isLoggedIn, function(req, res) {
    database.getAllCafes(function(err, cafes){
      res.render("cafe_mng.ejs", {cafes: cafes, user: req.user});
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
