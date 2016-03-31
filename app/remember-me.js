// middleware to log the user in if they have a valid rememberme cookie
module.exports = function(req, res, next) {
  // if the user isn't logged in but /does/ have a rememberme cookie
  if(!req.isAuthenticated() && typeof req.cookies.rememberme != "undefined") {
    var selector  = req.cookies.rememberme.split("$")[0];
    var validator = req.cookies.rememberme.split("$")[1];
    query = "select * from remember_me_tokens where remember_me_token_selector = ?";
    params = [selector];
    // try to find our guy in the database
    GLOBAL.connection.query(query, params, function(err, rows){
      // fail if no token found (and delete cookie)
      if (!rows[0]) { res.clearCookie("rememberme"); return next(); }
      // ensure the validator is correct
      if (validator == rows[0].remember_me_token_validator) {
        // load the user from the database
        connection.query("select user_id, user_name, user_email, user_disabled, "
                        +"user_permission_store, user_permission_pos, user_permission_stock, "
                        +"user_permission_admin from users where users.user_id = ?",
                        [rows[0].token_user_id], function(err, users) {
          var user = users[0];
          // log the user in
          req.login(user, function(err) {
            // fail on error
            if (err) return next(err);
            console.log("transparently logged in:" + user.user_email);
            return next();
          });
        });
      } else { // if validator is incorrect
        res.clearCookie("rememberme");
        return next();
      }
    });
  } else { // if alreadly logged in or no cookie
    return next();
  }
}
