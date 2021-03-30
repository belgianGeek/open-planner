const path = require('path');

const createLocationsTable = client => {
  let table = 'locations';
  client.query(`CREATE TABLE IF NOT EXISTS ${table} (
    location_id SERIAL PRIMARY KEY,
    location_name TEXT,
    location_mail TEXT)`, (err, res) => {
    if (err) {
      console.error(`Une erreur est survenue lors de la création de la table ${table} : ${err}`);
    } else {
      console.log(`La table ${table} existe déjà...`);
    }
  });
}

module.exports = createLocationsTable;
