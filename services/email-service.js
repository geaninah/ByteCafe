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

module.exports = {
    sendMessage: function(email, subject, message) {
        if (!emailIsValid(email)) {
            return 'Email address "' + email + '" is not valid.';
        }

        sendMessage(email, subject, message);

        return 'Your message has been received.';
    }
};