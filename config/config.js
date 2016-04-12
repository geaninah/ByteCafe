// example configuration file
module.exports = {
  // http website port
  http_port: process.env.PORT || 80,

  // https website port
  tls_port: 443,

  // database configuration
  // https://github.com/felixge/node-mysql#pool-options
  database: {
    connectionLimit: 1,
    //acquireTimeout: 3000,
    //connectTimeout: 3000,
    host: process.env.DATABASE_HOSTNAME,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
  },

  sendGrid: {
    username: process.env.SENDGRID_USERNAME,
    password: process.env.SENDGRID_PASSWORD
  }
};
