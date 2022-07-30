const fs = require('fs');

const existPath = (path, data, callback) => {
  fs.stat(path, (err, stats) => {
    if (err) {
      if (path.match(/\.\/\w.+\/$/)) {
        fs.mkdir(path, (err) => {
          if (err) throw err;
        });
      } else {
        fs.writeFile(path, data, 'utf-8', (err) => {
          if (err) throw err;
        });
      }
    }

    // Exécuter le callback uniquement s'il est défini
    if (callback) {
      callback();
    }
  });
}

module.exports = existPath;
