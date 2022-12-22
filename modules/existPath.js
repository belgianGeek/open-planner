const fs = require("fs");

const existPath = (path, data, callback) => {
  if (typeof data === "undefined") {
    callback = data;
    data = null;
  }

  fs.stat(path, (err) => {
    if (err) {
      if (path.match(/\.\/\w.+\/$/)) {
        try {
          fs.mkdirSync(path);
        } catch (err) {
          console.log(err);
        }
      } else {
        try {
          if (typeof data !== "null") {
            fs.writeFileSync(path, data);
          } else {
            console.log(
              `The file ${path} wasn't created because the 'data' argument is null.`
            );
          }
        } catch (err) {
          console.log(err);
        }
      }

      // Exécuter le callback uniquement s'il est défini
      if (callback) {
        callback();
      }

      if (typeof data === "function") {
        data();
      }
    }
  });
};

module.exports = existPath;
