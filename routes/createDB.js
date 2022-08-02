module.exports = function(app, io) {
  const createSettingsTable = require('../modules/createSettingsTable');

  const initUsers = require('../modules/initUsers');
  const notify = require('../modules/notify');

  app.post('/createdb', (req, res) => {
    createSettingsTable(app.pool, req.body)
      .then(() => req.flash('success', 'success'))
      .catch(() => req.flash('error', 'failure'));
  });
};
