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

if (config.debug_email) module.exports = { sendMessage: debug_sendmessage_function };
else                    module.exports = { sendMessage: real_sendmessage_function };
