const axios = require('axios');

const notify = (url, type, isImport = false, usersNb) => {
  axios({
    method: 'POST',
    url: url,
    data: {
      isImport: isImport,
      type: type,
      usersNb: usersNb
    }
  });
}

module.exports = notify;
