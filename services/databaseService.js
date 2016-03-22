var mysql = require('mysql');

var connection = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
});

var getStatusInformation = function(){
    return 'getStatusInformation';
};

var getCafes = function(callback){
    var query = 'select name, address from cafes';

    connection.query(query, function(err, cafes){
        if(err){
            console.log(err);
        }else{
            callback(err, cafes);
        }
    });
};

var getCafeInfo = function(callback, cafeId){
    var query = 'select name, description, map_location, address, image_url from cafes where cafe_id = ?';
    var parameters = [cafeId];

    connection.query(query, parameters, function(err, cafes){
        if(err){
            console.log(err);
        }else{
            var cafe = cafes[0];
            callback(err, cafe);
        }
    });
};

var getProducts = function(callback, cafeId){
    var query = 'select products.name from products, cafe_products where cafe_products.cafe_id = ?';
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
    var query = 'select description from products where product_id = ?';
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
    var query = 'select order_id from orders where cafe_id = ?';
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
    var query = 'select status from orders where order_id = ?';
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
    getStatusInformation: getStatusInformation,
    getCafes: getCafes,
    getCafeInfo: getCafeInfo,
    getProducts: getProducts,
    getProductInfo: getProductInfo,
    getOrders: getOrders,
    getOrderInfo: getOrderInfo
};