const randomBytes = require("crypto").randomBytes;
const fs = require("fs-extra");
const existPath = require("./existPath.js");

const createJWTServerPrivateKey = () => {
  return new Promise((resolve, reject) => {
    const privateKey = randomBytes(100).toString("hex");

  existPath("./config/", () => {
    fs.writeFile(
      "./config/auth.config.js",
      `
    module.exports = {
        jwt_private_key: '${privateKey}'
    };
    `,
      (err) => {
        if (err) {
          reject(
            `An error occurred while creating the server JWT private key : ${err}`
          );
        } else {
          resolve(
            "The server's JWT private key was successfully created. Please see the auth.config.js config file for details."
          );
        }
      }
    );
  });
  });
};

module.exports = createJWTServerPrivateKey;
