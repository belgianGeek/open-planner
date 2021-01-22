const path = require('path');

const createUsersTable = client => {
  client.query('CREATE TABLE IF NOT EXISTS readers (' +
    'name TEXT,' +
    'firstname TEXT,' +
    'email TEXT,' +
    'gender TEXT)', (err, res) => {
      if (err) {
        console.error(`Une erreur est survenue lors de la création de la table users : ${JSON.stringify(err, null, 2)}`);
      } else {
        console.log('La table users existe déjà...');
        client.query('SELECT * FROM readers')
          .then(res => {
            if (res.rowCount === 0 || res.rowCount === undefined || res.rowCount === null) {
              client.query(`COPY readers(name, firstname, email, gender) FROM '/users.csv' DELIMITER ',' CSV HEADER`)
                .then(res => {
                  if (res.rowCount > 0) {
                    console.log(`${res.rowCount} enregistrements ont été ajoutés à la table users ;-)`);
                  } else {
                    console.log(`${res.rowCount} enregistrement a été ajouté à la table users ;-)`);
                  }
                })
                .catch(err => {
                  console.error(`Une erreur est survenue lors du remplissage de la table users : ${err}`);
                });
            } else {
              console.log('La table users est déjà remplie ;-)');
            }
          });
      }
    });
}

module.exports = createUsersTable;
