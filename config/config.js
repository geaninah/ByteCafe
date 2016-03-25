// example configuration file
module.exports = {

  // http website port
  http_port: 8080,

  // https website port
  tls_port: 8443,

  // database configuration 
  // https://github.com/felixge/node-mysql#connection-options
  database: {
    host: "db-example", port: 3306,
    user: "bc6ff1fcf576f6", password: "db0c4205",
    database: "bytecafedb"
  }
};
