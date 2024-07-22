const express = require('express');

const app = express();

const emailCounter = {};

app.post('/user/:email', (req, res) => {
  const email = req.params.email;

  if (emailCounter[email]) {
    emailCounter[email]++;
  } else {
    emailCounter[email] = 1;

    // Set a timeout to remove the email after 1 minute
    setTimeout(() => {
      emailCounter[email]--;
    }, 60000);
  }

  res.json({ attempts: emailCounter[email] });
});

app.listen(3003);