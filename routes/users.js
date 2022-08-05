module.exports = function(app) {
  app.get('/users', async (req, res) => {
    const listUsers = await app.pool.query(`
      SELECT
        u.user_id,
        u.name,
        u.firstname,
        u.email,
        u.location,
        u.gender,
        u.type,
        l.location_id,
        l.location_name
       FROM users u
       LEFT JOIN locations l
       ON u.location = l.location_id ORDER BY u.name`);

    res.send(listUsers.rows);
  });
}
