var config = require("../config/config")
var sendGrid = require('sendgrid')(config.sendGrid.username, config.sendGrid.password);

function emailIsValid(email) {
    return /^[^ @]+@[^ @]+\.[^ @]+$/.test(email);
}

function sendMessage(email, subject, message) {
    var payload = {
        to: email,
        from: 'noreply@bytecafe.com',
        subject: subject,
        text: message
    };

    sendGrid.send(payload, function(error, response) {
        if (error) {
            console.error(error);
        }
    });
}

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

function sendMailValidation(email, subject) {
    var payload = {
        to: email,
        from: 'noreply@bytecafe.com',
        subject: subject,
        text: "Thank you for signing up! Here is the link to validate your email: http://bytecafe.azurewebsites.net/verify-email/" + email.hashCode()
    };

    sendGrid.send(payload, function(error, response) {
        if (error) {
            console.error(error);
        }
    });
}

var debug_sendMailValidation = function(email, subject) {
    var payload = {
        to: email,
        from: 'noreply@bytecafe.com',
        subject: subject,
        text: "Thank you for signing up! Here is the link to validate your email: http://bytecafe.azurewebsites.net/verify-email/" + email.hashCode()
    };

  console.log("");
  console.log("To:  " + payload.to);
  console.log("Sub: " + payload.subject);
  if(!emailIsValid(email)) console.log("== ADDRESS NOT VALID ==");
  console.log(payload.text);
  console.log("");
}

var real_sendmessage_function = function(email, subject, message) {
    if (!emailIsValid(email)) {
        return 'Email address "' + email + '" is not valid.';
    }

    sendMessage(email, subject, message);

    return 'Your message has been received.';
}

var debug_sendmessage_function = function(email, subject, message) {
  console.log("");
  console.log("To:  " + email);
  console.log("Sub: " + subject);
  if(!emailIsValid(email)) console.log("== ADDRESS NOT VALID ==");
  console.log(message);
  console.log("");
}

if (config.debug_email)
  module.exports = {
    sendMessage: debug_sendmessage_function,
    sendMailValidation: debug_sendMailValidation
  };
else
 module.exports = { sendMessage: real_sendmessage_function, sendMailValidation: sendMailValidation };
