module.exports = function(app) {
  app.pool.query(`
    ALTER TABLE settings
    ADD COLUMN IF NOT EXISTS displaymyrequestsmenu BOOLEAN
    `)
    .then(() => app.pool.query(`UPDATE settings SET displaymyrequestsmenu = true`))
    .catch(err => console.error(err));
};
