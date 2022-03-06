const cors = require('cors');

module.exports = function(app) {
  app.get('/users', cors(), async (req, res) => {
    const DBusers = await app.pool.query(`
      SELECT
        u.user_id,
        u.name,
        u.firstname,
        u.gender,
        u.email,
        u.location,
        u.type
      FROM users u`);

    res.send(DBusers.rows);
  });
}
