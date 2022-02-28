const env = require('dotenv');
env.config();

var mailgun = require('mailgun-js')({apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN});

exports.sendEmail = async function (to, subject, text, request) {
  var data = {
    from: process.env.MAILGUN_FROM,
    to: to,
    subject: subject,
    text: text
  };
   
  mailgun.messages().send(data, function (error, body) {
    console.log(body);
    console.log(error);
  });
};

exports.passwordResetEmail = async function (passwordResetUrl, request) {
  return `
    Dear User, 

    Somebody has requested password reset for your account.

    Please follow this link to reset your password: ${passwordResetUrl}

    If you did not request the password reset, ignore this email.

    Kind Regards, 
    Krypto
  `
};

exports.alertEmail = async function (text, request) {
  return `
    Dear User, 

    The following alert has been triggered: 
    ${text}

    This alert has now been fired and will need to be reset in the dashboard if you would like to receive an alert for it again.

    Kind Regards, 
    Krypto
  `
};