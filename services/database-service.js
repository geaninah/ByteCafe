// libraires
var mysql = require('mysql');

// load configuration
var config = require("../config/config");

// setup our database connection
var connection = mysql.createPool(config.database);

// do a test connection
connection.getConnection(function(err, con) {
  if (err) {
    console.log("FATAL: Error connecting to database");
    console.log(err);
    connection.end();
    process.exit(1);
  } else {
    con.release();
  }
});

// close all connections
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

// returns all the users and all their information
var getAllUsers = function(callback){
    var query = 'select * from users';

    connection.query(query, function(err, users){
        if(err){
            console.log(err);
        } else {
            callback(err, users);
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
    var query = 'select products.product_id, products.product_name, products.product_category_id, products.product_price, products.product_image_url, products.product_description from products where products.product_purchasable and products.product_id in ( select cafe_products.cafe_product_product_id from cafe_products where cafe_products.cafe_product_cafe_id = ? and cafe_products.cafe_product_purchasable and cafe_products.cafe_product_stock > 0 )';
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
var getProductInfo = function(productId, callback){
    var query = 'select * from products where products.product_id = ?';
    var parameters = [productId];

    connection.query(query, parameters, function(err, result){
        if(err){ console.log(err); }
        else { return callback(err, result); }
    });
};

// gets the queued orders at a cafe
// TODO: refine query getOrders
var getOrders = function(callback, cafeId){
    var query = 'select * from orders where order_cafe_id = ?';
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
};

String.prototype.hashCode = function() {
  var hash = 0, i, chr, len;
  if (this.length === 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

// add a user to the database
// hardcoded to add a standard permission_cafe only user
var enrolNewUser = function(user_email, user_password, callback) {
  var hash = user_email.hashCode();
  var query = "insert into users ( user_email, user_password, user_token ) values (?, ?, ?)";
  var params = [user_email, user_password, hash];
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

var updatePassword = function(user_id, password, callback){
    var query = 'update users set user_password = ? where user_id = ?';
    var parameters = [password, user_id];
    connection.query(query, parameters, function(err, rows){
        if(err){
            console.log(err);
        }
        else{
            callback(err, rows);
        }
    });
};

var addUser = function(username, email, password, userDisabled, userStore, userPos, userStock, userAdmin, callback){
    var query = 'insert into users (user_name, user_email, user_password, user_disabled, user_permission_store, user_permission_pos, user_permission_stock, user_permission_admin) values (?, ?, ?, ?, ?, ?, ?, ?)';
    var parameters = [username, email, password, userDisabled, userStore, userPos, userStock, userAdmin];
    connection.query(query, parameters, function(err, result){
        if(err){
            console.log(err);
        }
        else{
            callback(err, result);
        }
    });
};

var deleteUser = function(user_id, callback){
    var query = 'delete from users where user_id = ?';
    var parameters = [user_id];
    connection.query(query, parameters, function(err, result){
        if(err){
            console.log(err);
        }
        else{
            callback(err, result);
        }
    });
};

var editUser = function(username, email, password, userDisabled, userStore, userPos, userStock, userAdmin, userVerified, userId, callback){
    var query = 'update users set user_name = ?, user_email = ?, user_password = ?, user_disabled = ?, user_permission_store = ?, user_permission_pos = ?, user_permission_stock = ?, user_permission_admin = ?, user_verified_email = ? where user_id = ?';
    var parameters = [username, email, password, userDisabled, userStore, userPos, userStock, userAdmin, userVerified, userId];
    connection.query(query, parameters, function(err, result){
        if(err){
            console.log(err);
        }
        else{
            callback(err, result);
        }
    });
};

var addProduct = function(name, categoryId, price, description, image_url, purchasable, callback){
    var query = 'insert into products (product_name, product_category_id, product_price, product_description, product_image_url, product_purchasable) values (?, ?, ?, ?, ?, ?)';
    var parameters = [name, categoryId, price, description, image_url, purchasable];
    connection.query(query, parameters, function(err, result){
        if(err){
            console.log(err);
        }
        else{
            callback(err, result);
        }
    });
};

var deleteProduct = function(product_id, callback){
    var query = 'delete from products where product_id = ?';
    var parameters = [product_id];
    connection.query(query, parameters, function(err, result){
        if(err){
            console.log(err);
        }
        else{
            callback(err, result);
        }
    });
};

var editProduct = function(name, categoryId, price, description, image_url, purchasable, productId, callback){
    var query = 'update products set product_name = ?, product_category_id = ?, product_price = ?, product_description = ?, product_image_url = ?, product_purchasable = ? where product_id = ?';
    var parameters = [name, categoryId, price, description, image_url, purchasable, productId];
    connection.query(query, parameters, function(err, result){
        if(err){
            console.log(err);
        }
        else{
            callback(err, result);
        }
    });
};

var getAllProducts = function(callback){
    var query = 'select * from products';

    connection.query(query, function(err, products){
        if(err){
            console.log(err);
        } else {
            callback(err, products);
        }
    });
}

var addCafe = function(name, description, mapLocation, address, openingTimes, imageUrl, available, callback){
    var query = 'insert into cafes (cafe_name, cafe_description, cafe_map_location, cafe_address, cafe_opening_times, cafe_image_url, cafe_avaliable) values (?, ?, ?, ?, ?, ?, ?)';
    var parameters = [name, description, mapLocation, address, openingTimes, imageUrl, available];
    connection.query(query, parameters, function(err, result){
        if(err){
            console.log(err);
        }
        else{
            callback(err, result);
        }
    });
};

var deleteCafe = function(cafe_id, callback){
    var query = 'delete from cafes where cafe_id = ?';
    var parameters = [cafe_id];
    connection.query(query, parameters, function(err, result){
        if(err){
            console.log(err);
        }
        else{
            callback(err, result);
        }
    });
};

var editCafe = function(name, description, mapLocation, address, openingTimes, imageUrl, available, cafeId, callback){
    var query = 'update cafes set cafe_name = ?, cafe_description = ?, cafe_map_location = ?, cafe_address = ?, cafe_opening_times = ?, cafe_image_url = ?, cafe_avaliable = ? where cafe_id = ?';
    var parameters = [name, description, mapLocation, address, openingTimes, imageUrl, available, cafeId];
    connection.query(query, parameters, function(err, result){
        if(err){
            console.log(err);
        }
        else{
            callback(err, result);
        }
    });
};

var addNutritionalFlag = function(productId, type, value, callback){
    var query = 'insert into nutritional_flags (nutritional_flag_product_id, nutritional_flag_type, nutritional_flag_value) values (?, ?, ?)';
    var parameters = [productId, type, value];
    connection.query(query, parameters, function(err, result){
        if(err){
            console.log(err);
        }
        else{
            callback(err, result);
        }
    });
};

var deleteNutritionalFlag = function(productId, type, callback){
    var query = 'delete from nutritional_flags where nutritional_flag_product_id = ? and nutritional_flag_type = ?';
    var parameters = [productId, type];
    connection.query(query, parameters, function(err, result){
        if(err){
            console.log(err);
        }
        else{
            callback(err, result);
        }
    });
};

var editNutritionalFlag = function(value, productId, type, callback){
    var query = 'update nutritional_flags set nutritional_flag_value = ? where nutritional_flag_product_id = ? and nutritional_flag_type = ?';
    var parameters = [value, productId, type];
    connection.query(query, parameters, function(err, result){
        if(err){
            console.log(err);
        }
        else{
            callback(err, result);
        }
    });
};

var getNutritionalFlag = function(productId, type, callback){
    var query = 'select * from nutritional_flags where nutritional_flag_product_id = ? and nutritional_flag_type = ?';
    var parameters = [productId, type];
    connection.query(query, parameters, function(err, result){
        if(err){
            console.log(err);
        }
        else{
            callback(err, result);
        }
    });
};

var getNutritionalFlags = function(productId, callback){
    var query = 'select * from nutritional_flags where nutritional_flag_product_id = ?';
    var parameters = [productId];
    connection.query(query, parameters, function(err, result){
        if(err){
            console.log(err);
        }
        else{
            callback(err, result);
        }
    });
};

var addOrder = function(cafeId, userId, orderStatus, paypal, cost, callback){
    var query = 'insert into orders (order_cafe_id, order_user_id, order_date , order_status, order_paypal_transaction, order_cost) values (?, ?, now(), ?, ?, ?)';
    var parameters = [cafeId, userId, orderStatus, paypal, cost];
    connection.query(query, parameters, function(err, result){
        if(err){
            console.log(err);
        }
        else{
            callback(err, result);
        }
    });
};

var deleteOrder = function(orderId, callback){
    var query = 'delete from orders where  order_id = ?';
    var parameters = [orderId];
    connection.query(query, parameters, function(err, result){
        if(err){
            console.log(err);
        }
        else{
            callback(err, result);
        }
    });
};

var editOrder = function(cafeId, userId, orderStatus, paypal, cost, orderId, callback){
    var query = 'update orders set order_cafe_id = ?, order_user_id = ?, order_status = ?, order_paypal_transaction = ?, order_cost = ? where order_id = ?';
    var parameters = [cafeId, userId, orderStatus, paypal, cost, orderId];
    connection.query(query, parameters, function(err, result){
        if(err){
            console.log(err);
        }
        else{
            callback(err, result);
        }
    });
};

var getOrder = function(orderId, callback){
    var query = 'select * from orders where order_id = ?';
    var parameters = [orderId];
    connection.query(query, parameters, function(err, result){
        if(err){
            console.log(err);
        }
        else{
            callback(err, result);
        }
    });
};

var addCategory = function(name, callback){
    var query = 'insert into categories(category_name) values (?)';
    var parameters = [name];
    connection.query(query, parameters, function(err, result){
        if(err){
            console.log(err);
        }
        else{
            callback(err, result);
        }
    });
};

var deleteCategory = function(categoryId, callback){
    var query = 'delete from categories where category_id = ?';
    var parameters = [categoryId];
    connection.query(query, parameters, function(err, result){
        if(err){
            console.log(err);
        }
        else{
            callback(err, result);
        }
    });
};

var editCategory = function(categoryId, name, parentId, callback){
    var query = 'update categories set category_name = ?, category_parent_id = ? where category_id = ?';
    var parameters = [name, parentId, categoryId];
    connection.query(query, parameters, function(err, result){
        if(err){
            console.log(err);
        }
        else{
            callback(err, result);
        }
    });
};

var getCategory = function(categoryId, callback){
    var query = 'select * from categories where category_id = ?';
    var parameters = [categoryId];
    connection.query(query, parameters, function(err, result){
        if(err){
            console.log(err);
        }
        else{
            callback(err, result);
        }
    });
};

var getAllCategories = function(callback){
    var query = 'select * from categories';
    connection.query(query, function(err, result) {
        if(err) { console.log(err); callback(err, result); }
        else { callback(err, result); }
    });
};

var addCafeProduct = function(cafeId, productId, stock, purchasable, callback){
    var query = 'insert into cafe_products(cafe_product_cafe_id, cafe_product_product_id, cafe_product_stock, cafe_product_purchasable) values (?, ?, ?, ?)';
    var parameters = [cafeId, productId, stock, purchasable];
    connection.query(query, parameters, function(err, result){
        if(err){
            console.log(err);
        }
        else{
            callback(err, result);
        }
    });
};

var deleteCafeProduct = function(cafeId, productId, callback){
    var query = 'delete from cafe_products where cafe_product_cafe_id = ? and cafe_product_product_id = ?';
    var parameters = [cafeId, productId];
    connection.query(query, parameters, function(err, result){
        if(err){
            console.log(err);
        }
        else{
            callback(err, result);
        }
    });
};

var editCafeProduct = function(stock, purchasable, cafeId, productId, callback){
    var query = 'update cafe_products set cafe_product_stock = ?, cafe_product_purchasable = ? where cafe_product_cafe_id = ? and cafe_product_product_id = ?';
    var parameters = [stock, purchasable, cafeId, productId];
    connection.query(query, parameters, function(err, result){
        if(err){
            console.log(err);
        }
        else{
            callback(err, result);
        }
    });
};

var getCafeProduct = function(cafeId, productId){
    var query = 'select * from cafe_products where cafe_product_cafe_id = ? and cafe_product_product_id = ?';
    var parameters = [cafeId, productId];
    connection.query(query, parameters, function(err, result){
        if(err){
            console.log(err);
        }
        else{
            callback(err, result);
        }
    });
};

var addBasketItems = function(userId, productId, cafeId, amount, callback){
    var query = 'insert into basket_items(basket_item_user_id, basket_item_product_id, basket_item_cafe_id, basket_item_amount) values (?, ?, ?, ?)';
    var parameters = [userId, productId, cafeId, amount];
    connection.query(query, parameters, function(err, result){
        if(err){
            console.log(err);
        }
        else{
            callback(err, result);
        }
    });
};

var deleteBasketItems = function(userId, productId, cafeId, callback){
    var query = 'delete from basket_items where basket_item_user_id = ? and basket_item_product_id = ? and basket_item_cafe_id = ?';
    var parameters = [userId, productId, cafeId];
    connection.query(query, parameters, function(err, result){
        if(err){
            console.log(err);
        }
        else{
            callback(err, result);
        }
    });
};

var editBasketItems = function(amount, cafeId, userId, productId, callback){
    var query = 'update basket_items set basket_item_amount = ? where basket_item_cafe_id = ? and basket_item_user_id = ? and basket_item_product_id = ?';
    var parameters = [amount, cafeId, userId, productId];
    connection.query(query, parameters, function(err, result){
        if(err) console.log(err);
        return callback(err, result);
    });
};

var getBasketItems = function(userId, callback){
    var query = 'select * from basket_items where basket_item_user_id = ?';
    var parameters = [userId];
    connection.query(query, parameters, function(err, result){
        if(err){
            console.log(err);
        }
        else{
            callback(err, result);
        }
    });
};

var addOrderItems = function(orderId, productId, cafeId, amount, callback){
    var query = 'insert into order_items(order_item_order_id, order_item_product_id, order_item_cafe_id, order_item_amount) values (?, ?, ?, ?)';
    var parameters = [orderId, productId, cafeId, amount];
    connection.query(query, parameters, function(err, result) {
        if(err){
            console.log(err);
        }
        else {
            callback(err, result);
        }
    });
};


var deleteOrderItems = function(orderId, productId, callback){
    var query = 'delete from order_items where order_item_order_id = ? and order_item_product_id = ?';
    var parameters = [orderId, productId];
    connection.query(query, parameters, function(err, result){
        if(err){
            console.log(err);
        }
        else{
            callback(err, result);
        }
    });
};

var editOrderItems = function(cafeId, amount, productId, orderId, callback){
    var query = 'update order_items set order_item_cafe_id = ?, order_item_amount = ?, order_item_product_id = ? where order_item_order_id = ?';
    var parameters = [cafeId, amount, productId, orderId];
    connection.query(query, parameters, function(err, result){
        if(err){
            console.log(err);
        }
        else{
            callback(err, result);
        }
    });
};

var getOrderItems = function(orderId, callback){
    var query = 'select * from order_items where order_item_order_id = ?';
    var parameters = [orderId];
    connection.query(query, parameters, function(err, result){
        if(err){
            console.log(err);
        }
        else{
            callback(err, result);
        }
    });
};

var getOrdersByUserId = function(userId, callback){
    var query = 'select * from orders where order_user_id = ?';
    var parameters = [userId];
    connection.query(query, parameters, function(err, result){
        if(err){
            console.log(err);
        }
        else{
            callback(err, result);
        }
    });
};

var addPasswordResetToken = function(user_email, token, callback) {
    getUserByEmail(user_email, function(err, rows) {
        if(rows.length) { // FIXME TypeError: Cannot read property 'length' of null
            var user = rows[0];
            var query = "insert into password_reset_tokens "
                      + "(password_reset_token_user_id, password_reset_token_validator, password_reset_token_expires)"
                      + "values (?, ?, NOW() + INTERVAL 30 MINUTE)";
            var params = [user.user_id, token];
            connection.query(query, params, function(err, rows) {
                if (err) { console.log(err); return callback(err); }
                else     { return callback(err, rows); }
            });
        } else {
          return callback("no-user");
        }
    });
};

var getPasswordResetToken = function(token, callback) {
  var query = 'select * from password_reset_tokens where password_reset_token_validator = ? and password_reset_token_expires > NOW()';
  var parameters = [token];
  connection.query(query, parameters, function(err, rows){
    if(err){
      return console.log(err);
    } else {
      return callback(err, rows);
    }
  });
};

var consumePasswordResetToken = function(user_id, callback) {
  var query = 'delete from password_reset_tokens where password_reset_token_user_id = ?';
  var parameters = [user_id];
  connection.query(query, parameters, function(err, rows) {
    if(err) {
      console.log(err);
      return
    } else {
      return callback(err, rows);
    }
  });
};

var verifyEmail = function(token, callback){
    var query = 'update users set user_verified_email = 1 where user_token = ?';
    var parameters = [token];
    connection.query(query, parameters, function(err, result) {
        if(err){
            console.log(err);
        }
        else {
            callback(err);
        }
    });
};

module.exports = {
    end: end,
    getCafes: getCafes,
    getAllUsers: getAllUsers,
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
    updatePassword: updatePassword,
    addUser: addUser,
    deleteUser: deleteUser,
    editUser: editUser,
    addProduct: addProduct,
    deleteProduct: deleteProduct,
    editProduct: editProduct,
    getAllProducts: getAllProducts,
    addCafe: addCafe,
    deleteCafe: deleteCafe,
    editCafe: editCafe,
    addNutritionalFlag: addNutritionalFlag,
    deleteNutritionalFlag: deleteNutritionalFlag,
    editNutritionalFlag: editNutritionalFlag,
    getNutritionalFlag: getNutritionalFlag,
    getNutritionalFlags: getNutritionalFlags,
    addOrder: addOrder,
    deleteOrder: deleteOrder,
    editOrder: editOrder,
    getOrder: getOrder,
    addCategory: addCategory,
    deleteCategory: deleteCategory,
    editCategory: editCategory,
    getCategory: getCategory,
    getAllCategories: getAllCategories,
    addCafeProduct: addCafeProduct,
    deleteCafeProduct: deleteCafeProduct,
    editCafeProduct: editCafeProduct,
    getCafeProduct: getCafeProduct,
    addBasketItems: addBasketItems,
    deleteBasketItems: deleteBasketItems,
    editBasketItems: editBasketItems,
    getBasketItems: getBasketItems,
    addOrderItems: addOrderItems,
    deleteOrderItems: deleteOrderItems,
    editOrderItems: editOrderItems,
    getOrderItems: getOrderItems,
    getOrdersByUserId: getOrdersByUserId,
    addPasswordResetToken: addPasswordResetToken,
    getPasswordResetToken: getPasswordResetToken,
    consumePasswordResetToken: consumePasswordResetToken,
    verifyEmail: verifyEmail
};
