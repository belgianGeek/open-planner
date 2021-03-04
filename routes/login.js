module.exports = function(app, io) {
  const appendUser = require('../modules/appendUser');
  const checkNotAuth = require('../modules/checkNotAuth');
  const DBquery = require('../modules/DBquery');
  const env = require('dotenv').config();
  const getUsers = require('../modules/getUsers');
  const notify = require('../modules/notify');
  const passport = require('passport');
  const process = require('process');

  app.get('/login', checkNotAuth, async (req, res) => {
      const response = await app.client.query(`SELECT * FROM users`);
      if (response.rowCount) {
        res.render('login.ejs', {
          firstUser: false,
          locations: process.env.LOCATIONS.split(','),
          programName: process.env.PROGRAM_NAME
        });
      } else {
        res.render('login.ejs', {
          firstUser: true,
          locations: process.env.LOCATIONS.split(','),
          programName: process.env.PROGRAM_NAME
        });
      }

      io.on('connection', io => {
        io.on('append data', async data => {
          appendUser(app, data, io);
        });
      });
    })

    .post('/login', checkNotAuth, passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/login',
      failureFlash: true
    }));
};