const path = require('path');

const createLocationsTable = (client, locations) => {
  let table = 'locations';
  client.query(`CREATE TABLE IF NOT EXISTS ${table} (
    id SERIAL PRIMARY KEY,
    name TEXT)`, (err, res) => {
      if (err) {
        console.error(`Une erreur est survenue lors de la création de la table ${table} : ${err}`);
      } else {
        console.log(`La table ${table} existe déjà...`);
        client.query(`SELECT * FROM ${table}`)
          .then(res => {
            if (res.rowCount === 0 || res.rowCount === undefined || res.rowCount === null) {
              let locations2add = '';

              for (let location of locations) {
                locations2add += `('${location.trim()}')  `;
              }

              client.query(`INSERT INTO ${table}(name) VALUES${locations2add.split('  ').join(',').replace(/,$/, '')}`)
                .then(res => {
                  if (res.rowCount > 1) {
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
