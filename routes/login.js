const passport = require('passport');

module.exports = function(app) {
  app.get('/login', async (req, res, next) => {
      passport.authenticate("local", (err, user, info) => {
        if (err) {
          return next(err);
        }

        if (!user) {
          return res.send({
            user: user,
            info: info
          });

          res.send('connection', {
            user: user,
            info: info
          });
        }

        req.login(user, err => {
          if (err || !user) {
            console.trace(err);
          } else if (user !== undefined) {
            res.send({
              user: user,
              message: "Logged in"
            });

            res.send('connection successfull', {
              user: user,
              message: "Logged in"
            })
          } else {
            console.trace('The user variable is undefined...');
          }
        });
      })(req, res, next);
  });
};
