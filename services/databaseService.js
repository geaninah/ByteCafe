getStatusInformation = function(){
    return 'getStatusInformation';
};

getCafes = function(){
    return 'getCafes';
};

getCafeInfo = function(cafeId){
    return 'getCafeInfo';
};

getProducts = function(cafeId){
    return 'getProducts';
};

getProductInfo = function(productId){
    return 'getProductInfo';
};

getOrders = function(cafeId){
    return 'getOrders';
};

getOrderInformation = function(orderId){
    return 'getOrderInformation';
};

module.exports = {
    getStatusInformation: getStatusInformation,
    getCafes: getCafes,
    getCafeInfo: getCafeInfo,
    getProducts: getProducts,
    getProductInfo: getProductInfo,
    getOrders: getOrders,
    getOrderInformation: getOrderInformation
};