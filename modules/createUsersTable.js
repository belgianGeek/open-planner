const path = require('path');

const createUsersTable = client => {
  let table = 'users';
  client.query(`CREATE TABLE IF NOT EXISTS ${table} (
    user_id SERIAL PRIMARY KEY,
    name TEXT,
    firstname TEXT,
    email TEXT,
    location INT,
    gender TEXT,
    password VARCHAR(100),
    type VARCHAR(20),
    CONSTRAINT location
      FOREIGN KEY(location)
       REFERENCES locations(location_id)
        ON DELETE CASCADE
  )`, (err, res) => {
    if (err) {
      console.error(`Une erreur est survenue lors de la création de la table ${table} : ${err}`);
    } else {
      console.log(`La table ${table} existe déjà...`);
    }
  });
}

module.exports = createUsersTable;
