module.exports = function(app) {
  app.pool.query(`
    ALTER TABLE settings
    ADD COLUMN IF NOT EXISTS displaymyrequestsmenu BOOLEAN,
    ADD COLUMN IF NOT EXISTS sendrequestdeletionmail BOOLEAN,
    ADD COLUMN IF NOT EXISTS allowsearchpageaccess BOOLEAN
    `)
    .then(() => app.pool.query(`UPDATE settings SET displaymyrequestsmenu = true, sendrequestdeletionmail = true, allowsearchpageaccess = true`))
    .catch(err => console.error(`Error updating Open Planner : ${err}`));
};
