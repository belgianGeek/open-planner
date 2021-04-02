const getSettings = async client => {
  const response = await client.query('SELECT * FROM settings');
  return response.rows[0];
};

module.exports = getSettings;
