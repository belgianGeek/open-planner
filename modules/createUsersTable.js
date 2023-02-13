const path = require('path');

const createUsersTable = (tableName, dbPool) => {
  return new Promise(function(resolve, reject) {
    dbPool.query(`CREATE TABLE IF NOT EXISTS ${tableName} (
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
        reject(`Une erreur est survenue lors de la création de la table ${tableName} : ${err}`);
      } else {
        resolve(`La table ${tableName} existe déjà...`);
      }
    });
  });
}

module.exports = createUsersTable;
