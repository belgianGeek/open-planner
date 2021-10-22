module.exports = function(app) {
  app.pool.query(`
    ALTER TABLE settings
    ADD COLUMN IF NOT EXISTS displaymyrequestsmenu BOOLEAN,
    ADD COLUMN IF NOT EXISTS sendrequestdeletionmail BOOLEAN
    `)
    .then(() => app.pool.query(`UPDATE settings SET displaymyrequestsmenu = true, sendrequestdeletionmail = true`))
    .catch(err => console.error(err));
};
