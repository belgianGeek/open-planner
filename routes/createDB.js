module.exports = function(app, io) {
  const createSettingsTable = require('../modules/createSettingsTable');

  const getUsers = require('../modules/getUsers');
  const notify = require('../modules/notify');

  app.post('/createdb', (req, res) => {
    createSettingsTable(app.client, req.body)
      .then(() => req.flash('success', 'success'))
      .catch(() => req.flash('error', 'failure'));
  });
};
