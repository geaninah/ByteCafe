// libraires
var mysql = require('mysql');

// load configuration
var config = require("../config/config.js")

// create database connection
var connection = GLOBAL.connection;

var getCafes = function(callback){
    var query = 'select cafe_id, name, image_url from cafes';

    connection.query(query, function(err, cafes){
        if(err){
            console.log(err);
        }else{
            callback(err, cafes);
        }
    });
};

var getCafeInfo = function(callback, cafeId){
    var query = 'select * from cafes where cafe_id = ?';
    var parameters = [cafeId];

    connection.query(query, parameters, function(err, cafes){
        if(err) {
            console.log(err);
        } else if (cafes) {
            var cafe = cafes[0];
            callback(err, cafe);
        } else {
            callback(err, []);
        }
    });
};

var getProducts = function(callback, cafeId){
    var query = 'select products.product_id, products.name, products.category_id, products.price, products.image_url from products where products.purchasable and products.product_id in ( select cafe_products.product_id from cafe_products where cafe_products.cafe_id = ? and cafe_products.purchasable and cafe_products.stock > 0 )';
    var parameters = [cafeId];

    connection.query(query, parameters, function(err, products){
        if(err){
            console.log(err);
        }else{
            callback(err, products);
        }
    });
};

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

var getOrderInfo = function(callback, orderId){
    var query = 'select * from orders where order_id = ?';
    var parameters = [orderId];

    connection.query(query, parameters, function(err, orders){
        if(err){
            console.log(err);
        }else{
            var order = orders[0];
            callback(err, order);
        }
    });
};

module.exports = {
    getCafes: getCafes,
    getCafeInfo: getCafeInfo,
    getProducts: getProducts,
    getProductInfo: getProductInfo,
    getOrders: getOrders,
    getOrderInfo: getOrderInfo
};
