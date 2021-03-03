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
      client.query(`SELECT * FROM ${table}`)
        .then(res => {
          if (res.rowCount === 0 || res.rowCount === null) {
            client.query(`COPY ${table}(location_name, location_mail) FROM '/${table}.csv' DELIMITER ',' CSV HEADER`)
              .then(res => {
                if (res.rowCount > 0) {
                  console.log(`${res.rowCount} enregistrements ont été ajoutés à la table ${table} ;-)`);
                } else {
                  console.log(`${res.rowCount} enregistrement a été ajouté à la table ${table} ;-)`);
                }
              })
              .catch(err => {
                console.error(`Une erreur est survenue lors du remplissage de la table ${table} : ${err}`);
              });
          } else {
            console.log(`La table ${table} est déjà remplie ;-)`);
          }
        });
    }
  });
}

module.exports = createLocationsTable;
