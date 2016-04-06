// example configuration file
module.exports = {
  // http website port
  http_port: 8080,

  // https website port
  tls_port: 8443,

  // database configuration 
  database: {
    host: "eu-cdbr-azure-west-d.cloudapp.net",
    port: 3306,
    user: "bc4a04064f12a2",
    password: "5da0c7c9",
    database: "bytecafedb"
  },

  debug_email: true,

  sendGrid: {
    username: process.env.SENDGRID_USERNAME,
    password: process.env.SENDGRID_PASSWORD
  }
};
