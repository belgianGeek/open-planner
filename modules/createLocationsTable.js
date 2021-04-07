const path = require('path');

const createLocationsTable = pool => {
  let table = 'locations';
  return new Promise(function(resolve, reject) {
    pool.query(`CREATE TABLE IF NOT EXISTS ${table} (
    location_id SERIAL PRIMARY KEY,
    location_name TEXT,
    location_mail TEXT)`, (err, res) => {
      if (err) {
        reject(`Une erreur est survenue lors de la création de la table ${table} : ${err}`);
      } else {
        resolve(`La table ${table} existe déjà...`);
      }
    });
  });
}

module.exports = createLocationsTable;
