module.exports = function(app) {
  app.get('/locations', async (req, res) => {
      const locations = await app.pool.query('SELECT location_id,location_name FROM locations');
      res.send(locations.rows);
    });
}
