var database = require("./database-service");

var callback = function (err, result){
    if(err){
        console.log(err);
    }else{
        console.log(result);
    } 
};

database.getOrdersByUserId(2, callback);
