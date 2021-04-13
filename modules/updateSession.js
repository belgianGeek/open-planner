const notify = require('./notify');

const updateSession = (io, req, data) => {
  if (req.user.name !== undefined) {
    req.user.name = data.values[0];
  }

  if (req.user.firstname !== undefined) {
    req.user.firstname = data.values[1];
  }

  if (req.user.email !== undefined) {
    req.user.email = data.values[2];
  }

  if (req.user.location !== undefined) {
    req.user.location = data.values[3];
  }

  if (req.user.gender !== undefined) {
    req.user.gender = data.values[4];
  }

  if (data.setType) {
    if (req.user.type !== undefined) {
      req.user.type = data.values[5];
    }
  }

  req.login(req.user, err => {
    if (err) {
      console.log(err);
      notify(io, 'failure');
    }
  });
}

module.exports = updateSession;
