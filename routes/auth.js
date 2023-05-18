const jwt = require("jsonwebtoken");

module.exports = function (app) {
  app.post("/api/checkAuth", async (req, res, next) => {
    jwt.verify(
      req.body.token,
      require("../config/auth.config.js").jwt_private_key,
      (err, decodedToken) => {
        if (err) {
          console.error(`The given JWT token is invalid : ${err}`);
          res.send(`The given JWT token is invalid : ${err}`);
        } else {
          res.send("Token verification succeeded");
        }
      }
    );
  });
};
