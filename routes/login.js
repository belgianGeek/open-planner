const passport = require("passport");
// const fs = require('fs');

module.exports = function (app) {
  app.post("/login", async (req, res, next) => {
    passport.authenticate(
      "local",
      {
        successRedirect: "/",
        failureRedirect: "/login",
        failureFlash: true,
      },
      (err, user, info) => {
        if (err) {
          return next(err);
        }

        if (!user) {
          return res.send({
            user: user,
            info: info,
          });
        }

        req.login(user, (err) => {
          if (err || !user) {
            console.trace(err);
          } else if (user !== undefined) {
            const userToken = res.cookie("token", user.user_id, {
              httpOnly: true,
            });

            res.send({
              user: user,
            });
          } else {
            console.trace("The user variable is undefined...");
          }
        });
      }
    )(req, res, next);
  });
};
