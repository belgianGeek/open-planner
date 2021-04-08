const path = require('path');

const createUsersTable = pool => {
  let table = 'users';
  return new Promise(function(resolve, reject) {
    pool.query(`CREATE TABLE IF NOT EXISTS ${table} (
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
        reject(`Une erreur est survenue lors de la création de la table ${table} : ${err}`);
      } else {
        resolve(`La table ${table} existe déjà...`);
      }
    });
  });
}

module.exports = createUsersTable;
