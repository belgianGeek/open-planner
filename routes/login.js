const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const createJWTServerPrivateKey = require("../modules/createJWTServerPrivateKey.js");

module.exports = function (app, pgClient) {
  app.post("/login", async (req, res, next) => {
    try {
      require("../config/auth.config.js").jwt_private_key;
    } catch (err) {
      console.error(err);
      createJWTServerPrivateKey()
        .then((res) => console.log(res))
        .catch((err) => console.error(err));
    } finally {
      const user = await pgClient.query(
        `SELECT email, firstname, gender, location, name, password, type, user_id FROM users WHERE email ILIKE '${req.body.email}'`
      );

      // Avoid duplicates
      if (user.rows.length === 0) {
        res.send(
          "Nobody registered with this email address. Please check the email address and password you entered are valid."
        );
      } else if (user.rows.length === 1) {
        try {
          if (await bcrypt.compare(req.body.password, user.rows[0].password)) {
            const token = jwt.sign(
              {
                id: user.rows[0].user_id,
              },
              require("../config/auth.config.js").jwt_private_key,
              {
                // Set tokens to expires in 15 minutes
                expiresIn: 60 * 15,
              }
            );

            res.send({
              user: user.rows[0],
              token: token,
            });
          } else {
              res.send('Incorrect password. Please try again');
          }
        } catch (err) {
          console.error(`Authentication error : ${err}`);
        }
      } else if (user.rows.length > 1) {
        res.send(
          "There is more than one user linked to this address. For security reasons, you cannot log in. Please contact your administrator to fix this issue."
        );
      }
    }
  });
};
