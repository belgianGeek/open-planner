const createLocationsTable = (tableName, dbPool) => {
  return new Promise(function(resolve, reject) {
    dbPool.query(`CREATE TABLE IF NOT EXISTS ${tableName} (
    location_id SERIAL PRIMARY KEY,
    location_name TEXT,
    location_mail TEXT)`, (err, res) => {
      if (err) {
        reject(`Une erreur est survenue lors de la création de la table ${tableName} : ${err}`);
      } else {
        resolve(`La table ${tableName} existe déjà...`);
      }
    });
  });
}

module.exports = createLocationsTable;
