const passport = require('passport');

module.exports = function(app) {
  app.post('/login', async (req, res, next) => {
    // const users = await app.pool.query('SELECT * FROM users');

    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(400).send([user, "Cannot log in", info]);
      }

      req.login(user, err => {
        if (err || !user) {
          console.trace(err);
        } else if (user !== undefined) {
          // user = users.rows.find(user => {
          //   return user.id === req.session.passport.user;
          // });

          res.send({
            user: user,
            message: "Logged in"
          });
        } else {
          console.trace('The user variable is undefined...');
        }
      });
    })(req, res, next);
  });
};
