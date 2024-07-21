const cote = require('cote');

const emailCounter = {};

// Create a new responder (server)
const responder = new cote.Responder({ name: 'ratelimiter' });

responder.on('user', (req, cb) => {
  const email = req.email;

  if (emailCounter[email]) {
    emailCounter[email]++;
  } else {
    emailCounter[email] = 1;

    // Set a timeout to remove the email after 1 minute
    setTimeout(() => {
      emailCounter[email]--;
    }, 60000);
  }

  cb(null, emailCounter[email]);
});