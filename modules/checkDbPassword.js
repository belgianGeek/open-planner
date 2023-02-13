const fs = require('fs-extra');

const checkForPassword = config => {
    if (fs.existsSync(".passwd")) {
      config.password = fs.readFileSync(".passwd", {
        encoding: "utf-8",
      });
  
      config.password = config.password.replace(/[\n\r\s]/g, "");
  
      config.connectionString = `postgresql://${config.user}:${config.password}@${config.host}:5432/${config.database}`;
    } else {
      config.connectionString = `postgresql://${config.user}@${config.host}:5432/${config.database}`;
    }

    return config;
  };

module.exports = checkForPassword;