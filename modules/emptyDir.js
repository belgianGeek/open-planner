const fs = require('fs-extra');

const emptyDir = path => {
  let files = fs.readdirSync(path);
  for (const [i, file] of files.entries()) {
    if (path.match(/\/$/m)) {
      fs.unlink(`${path}${file}`);
    } else {
      fs.unlink(`${path}/${file}`)
    }
  }
}

module.exports = emptyDir;
