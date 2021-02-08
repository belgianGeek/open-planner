const path = require('path');

const createUsersTable = client => {
  let table = 'users';
  client.query(`CREATE TABLE IF NOT EXISTS ${table} (
    id SERIAL PRIMARY KEY,
    name TEXT,
    firstname TEXT,
    email TEXT,
    location INT,
    gender TEXT,
    CONSTRAINT location
      FOREIGN KEY(location)
       REFERENCES locations(id)
        ON DELETE CASCADE
  )`, (err, res) => {
      if (err) {
        console.error(`Une erreur est survenue lors de la création de la table ${table} : ${err}`);
      } else {
        console.log(`La table ${table} existe déjà...`);
        client.query(`SELECT * FROM ${table}`)
          .then(res => {
            if (res.rowCount === 0 || res.rowCount === undefined || res.rowCount === null) {
              client.query(`COPY ${table}(name, firstname, email, location, gender) FROM '/${table}.csv' DELIMITER ',' CSV HEADER`)
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

module.exports = createUsersTable;
