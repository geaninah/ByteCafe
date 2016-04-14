// middleware to log the user in transparently if they have a valid rememberme cookie
module.exports.init = function(database) {
  // transparent login general middlewear
  module.exports.login = function(req, res, next) {
    // if the user isn't logged in but /does/ have a rememberme cookie
    if(!req.isAuthenticated() && typeof req.cookies.rememberme != "undefined") {
      var selector  = req.cookies.rememberme.split("$")[0];
      var validator = req.cookies.rememberme.split("$")[1];
      // try to find our guy in the database
      database.getRememberMeToken(selector, function(err, rows){
        // fail if no token found (and delete cookie)
        if (!rows) { res.clearCookie("rememberme"); return next(); }
        if (!rows.length) { res.clearCookie("rememberme"); return next(); }
        // ensure the validator is correct
        if (validator == rows[0].remember_me_token_validator) {
          // load the user from the database
          database.getUserByID(rows[0].remember_me_token_user_id, function(err, users) {
            if(!users) { return next(); }
            if(!users.length) { return next(); }
            var user = users[0];
            // log the user in
            req.login(user, function(err) {
              // fail on error
              if (err) return next(err);
              console.log("Transparently logged in: " + user.user_email);
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
  } // transparent_login

  // export our logout function
  module.exports.logout = function(req, res, next) {
    // if client is maintaining a remember me cookie
    if(req.cookies.rememberme) {
      var selector = req.cookies.rememberme.split("$")[0];
      database.deleteRememberMeToken(selector, function(err, rows) {
        if(err) console.log(err); // doesn't particularly matter if this fails
      });
      res.clearCookie("rememberme");
    }
    return next();
  };
};
