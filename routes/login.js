const passport = require('passport');
const jwt = require('jsonwebtoken');
const createJWTServerPrivateKey = require('../modules/createJWTServerPrivateKey.js');

module.exports = function (app) {
  app.post("/login", async (req, res, next) => {
    try {
      require('../config/auth.config.js').jwt_private_key;
    } catch (err) {
      console.error(err);
      createJWTServerPrivateKey()
      .then(res => console.log(res))
      .catch(err => console.error(err));
    } finally {
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
              const token = jwt.sign({
                id: user.user_id
              }, require('../config/auth.config.js').jwt_private_key, {
                // Set tokens to expires in 15 minutes
                expiresIn: 60 * 15
              });
  
              res.send({
                user: user,
                token: token
              });
            } else {
              console.trace("The user variable is undefined...");
            }
          });
        }
      )(req, res, next);
    }
  });
};
