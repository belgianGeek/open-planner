const passport = require('passport');

module.exports = function(app) {
  app.post('/login', (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(400).send([user, "Cannot log in", info]);
      }

      req.login(user, err => {
        res.send("Logged in");
      });
    })(req, res, next);
  });
};
