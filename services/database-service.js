// libraires
var mysql = require('mysql');

// load configuration
var config = require("../config/config");

// setup our database connection
var connection = mysql.createConnection(config.database);
connection.connect(function(err) {
  if (err) {
    console.error("Error connecting to database" + err);
    process.exit(1);
    return
  }
  console.log("Connected to database with id " + connection.threadId);
});

var end = function() {
  connection.end();
}

// returns the cafes list
var getCafes = function(callback){
    var query = 'select cafe_id, cafe_name, cafe_image_url, cafe_avaliable from cafes';

    connection.query(query, function(err, cafes){
        if(err){
            console.log(err);
        } else {
            callback(err, cafes);
        }
    });
};

// returns information about a cafe
// TODO: refine query getCafeInfo
var getCafeInfo = function(callback, cafeId){
    var query = 'select * from cafes where cafe_id = ?';
    var parameters = [cafeId];
    connection.query(query, parameters, function(err, cafes){
        if(err)           return callback(err, null);
        if(!cafes.length) return callback(null, null);
        else              return callback(null, cafes[0]);
    });
};

// returns the products at a cafe
var getProducts = function(callback, cafeId){
    var query = 'select products.product_id, products.product_name, products.product_category_id, products.product_price, products.product_image_url from products where products.product_purchasable and products.product_id in ( select cafe_products.cafe_product_product_id from cafe_products where cafe_products.cafe_product_cafe_id = ? and cafe_products.cafe_product_purchasable and cafe_products.cafe_product_stock > 0 )';
    var parameters = [cafeId];

    connection.query(query, parameters, function(err, products){
        if(err){
            console.log(err);
        }else{
            callback(err, products);
        }
    });
};

// returns information about a product
// TODO: refine query getProductInfo
var getProductInfo = function(callback, productId){
    var query = 'select * from products where product_id = ?';
    var parameters = [productId];

    connection.query(query, parameters, function(err, products){
        if(err){
            console.log(err);
        }else{
            var product = products[0];
            callback(err, product);
        }
    });
};

// gets the queued orders at a cafe
// TODO: refine query getOrders
var getOrders = function(callback, cafeId){
    var query = 'select * from orders where cafe_id = ?';
    var parameters = [cafeId];

    connection.query(query, parameters, function(err, orders){
        if(err){
            console.log(err);
        }else{
            callback(err, orders);
        }
    });
};

// gets information about an order
// TODO: refine query getOrderInfo
var getOrderInfo = function(callback, orderId) {
    var query = 'select * from orders where order_id = ?';
    var parameters = [orderId];

    connection.query(query, parameters, function(err, orders) {
        if(err) {
            console.log(err);
        } else {
            var order = orders[0];
            callback(err, order);
        }
    });
};

// fetches a users basket
var getBasket = function (callback, user_id) {
    var query = 'select basket_items.basket_item_cafe_id, basket_items.basket_item_product_id, products.product_name, products.product_price, cafes.cafe_name, basket_items.basket_item_amount from basket_items, products, cafes where basket_item_user_id = ? and basket_items.basket_item_product_id = products.product_id and basket_items.basket_item_cafe_id = cafes.cafe_id';
    var parameters = [user_id];

    connection.query(query, parameters, function(err, basket) {
        if(err) {
            console.log(err);
        } else {
            var basketItems = basket[0];
            callback(err, basket);
        }
    });
};

// return a user by their email address
var getUserByEmail = function(email, callback) {
  var query = "select * from users where users.user_email = ?";
  var params = [email];
  connection.query(query, params, function(err, users) {
    if (err) return callback(err, null);
    else return callback(null, users);
  });
}

// return a user by their user_id
// TODO refine query
var getUserByID = function(user_id, callback) {
  var query = "select * from users where users.user_id = ?";
  var params = [user_id];
  connection.query(query, params, function(err, users) {
    if (err) return callback(err, null);
    else return callback(null, users);
  });
}

// add a user to the database
// hardcoded to add a standard permission_cafe only user
var enrolNewUser = function(user_email, user_password, callback) {
  var query = "insert into users ( user_email, user_password ) values (?,?)";
  var params = [user_email, user_password];
  connection.query(query, params, function(err, users) {
    if (err) return callback(err, null);
    else return callback(null, users);
  });
}

// adds a remember me token to the remember
var addRememberMeToken = function(user_id, selector, validator, callback) {
  var query = "insert into remember_me_tokens (remember_me_token_user_id, remember_me_token_selector, "
            + "remember_me_token_validator, remember_me_token_expires) values (?, ?, ?, NOW() + INTERVAL 2 WEEK)";
  var params = [user_id, selector, validator];
  connection.query(query, params, function(err, tokens) {
    if (err) return callback(err, null);
    else return callback(null, tokens);
  });
}

var getRememberMeToken = function(selector, callback) {
  var query = "select * from remember_me_tokens where remember_me_token_selector = ?";
  var params = [selector];
  connection.query(query, params, function(err, tokens) {
    if (err) return callback(err, null);
    else return callback(null, tokens);
  });
}

var deleteRememberMeToken = function(selector, callback) {
  var query = "delete from remember_me_tokens where remember_me_token_selector = ?";
  var params = [selector];
  connection.query(query, params, function(err, tokens) {
    if (err) return callback(err, null);
    else return callback(null, tokens);
  });
}

var addUser = function(username, email, password, userDisabled, userStore, userPos, userStock, userAdmin, callback){
    var query = 'insert into users (user_name, user_email, user_password, user_disabled, user_permission_store, user_permission_pos, user_permission_stock, user_permission_admin) values (?, ?, ?, ?, ?, ?, ?, ?)';
    var parameters = [username, email, password, userDisabled, userStore, userPos, userStock, userAdmin];
    connection.query(query, parameters, function(result, err){
        if(err){
            console.log(err);
        }
        else{
            callback(result, err);
        }
    });
};

var deleteUser = function(user_id, callback){
    var query = 'delete from users where user_id = ?';
    var parameters = [user_id];
    connection.query(query, parameters, function(result, err){
        if(err){
            console.log(err);
        }
        else{
            callback(result, err);
        }
    });
};

var editUser = function(username, email, password, userDisabled, userStore, userPos, userStock, userAdmin, userId, callback){
    var query = 'update users set user_name = ?, user_email = ?, user_password = ?, user_disabled = ?, user_permission_store = ?, user_permission_pos = ?, user_permission_stock = ?, user_permission_admin = ? where user_id = ?';
    var parameters = [username, email, password, userDisabled, userStore, userPos, userStock, userAdmin, userId];
    connection.query(query, parameters, function(result, err){
        if(err){
            console.log(err);
        }
        else{
            callback(result, err);
        }
    });
};

module.exports = {
    end: end,
    getCafes: getCafes,
    getCafeInfo: getCafeInfo,
    getProducts: getProducts,
    getProductInfo: getProductInfo,
    getOrders: getOrders,
    getOrderInfo: getOrderInfo,
    getBasket: getBasket,
    getUserByEmail: getUserByEmail,
    getUserByID: getUserByID,
    enrolNewUser: enrolNewUser,
    addRememberMeToken: addRememberMeToken,
    getRememberMeToken: getRememberMeToken,
    deleteRememberMeToken: deleteRememberMeToken,
    addUser: addUser,
    deleteUser: deleteUser,
    editUser: editUser
};






