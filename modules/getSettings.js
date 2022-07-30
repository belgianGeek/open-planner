const getSettings = async pool => {
  const response = await pool.query('SELECT * FROM settings');
  return response.rows[0];
};

module.exports = getSettings;
