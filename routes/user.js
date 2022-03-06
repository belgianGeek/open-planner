const checkAuth = require('../modules/checkAuth');
const passport = require('passport');

module.exports = function(app) {
  app.get('/user', checkAuth, (req, res) => {
    let user = users.find(user => {
      return user.id === req.session.passport.user
    });

    console.log([user, req.session]);

    res.send({
      user: user
    });
  });
};
