module.exports = function(app) {
  const appendData = require('../modules/appendData');
  const checkNotAuth = require('../modules/checkNotAuth');
  const createSettingsTable = require('../modules/createSettingsTable');
  const DBquery = require('../modules/DBquery');
  const getUsers = require('../modules/getUsers');
  const passport = require('passport');

  app.post('/login', checkNotAuth, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  }));
};
