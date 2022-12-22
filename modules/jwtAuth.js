// const { appendFile } = require("fs-extra");
const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const pool = require('../index.js').pool;
// const db = require("../models");

verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({
      message: "No token provided!"
    });
  }

  jwt.verify(token, config.jwt_private_key, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized!"
      });
    }
    req.userId = decoded.id;
    next();
  });
};

checkUserRole = (req, res, next) => {
    pool.query(`SELECT type FROM users WHERE user_id = ${req.userId}`)
    .then(type => {
        console.trace(type.rows())
    })
    .catch(err => console.trace(err));
}

// isModeratorOrAdmin = (req, res, next) => {
//   User.findByPk(req.userId).then(user => {
//     user.getRoles().then(roles => {
//       for (let i = 0; i < roles.length; i++) {
//         if (roles[i].name === "moderator") {
//           next();
//           return;
//         }

//         if (roles[i].name === "admin") {
//           next();
//           return;
//         }
//       }

//       res.status(403).send({
//         message: "Require Moderator or Admin Role!"
//       });
//     });
//   });
// };

const authJwt = {
  verifyToken: verifyToken,
  checkUserRole: checkUserRole
};

module.exports = authJwt;
