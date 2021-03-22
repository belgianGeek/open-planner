module.exports = function(app, io) {
  const appendData = require('../modules/appendData');
  const checkNotAuth = require('../modules/checkNotAuth');
  const DBquery = require('../modules/DBquery');
  const env = require('dotenv').config();
  const getUsers = require('../modules/getUsers');
  const notify = require('../modules/notify');
  const passport = require('passport');
  const process = require('process');

  app.get('/login', checkNotAuth, async (req, res) => {
      const response = await app.client.query(`SELECT * FROM users`);
      // If there are already registered users, displey the login screen
      if (response.rowCount) {
        res.render('login.ejs', {
          firstUser: false,
          locations: process.env.LOCATIONS.split(','),
          programName: process.env.PROGRAM_NAME
        });
      } else {
        // Else, display the registration form
        res.render('login.ejs', {
          firstUser: true,
          locations: process.env.LOCATIONS.split(','),
          programName: process.env.PROGRAM_NAME
        });

        io.on('connection', io => {
          io.on('append data', async data => {
            const users = await app.client.query('SELECT * FROM users');
            try {
              // Only append a new user if there is not any users recorded in the DB yet
              if (users.rows.length === 0) {
                appendData(app, data, io);
              }
            } catch (e) {
              console.trace(e);
            }
          });
        });
      }
    })

    .post('/login', checkNotAuth, passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/login',
      failureFlash: true
    }));
};
