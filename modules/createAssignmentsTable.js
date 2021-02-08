module.exports = function createAssignmentsTable(client, locations) {
  let table = `assignments`;
  client.query(`CREATE TABLE IF NOT EXISTS ${table} (
      id SERIAL PRIMARY KEY,
      id_user INT,
      id_location INT,
      CONSTRAINT id_location
        FOREIGN KEY(id_location)
	       REFERENCES locations(id)
	        ON DELETE CASCADE,
      CONSTRAINT id_user
        FOREIGN KEY(id_user)
    	   REFERENCES users(id)
    	    ON DELETE CASCADE
  )`, (err, res) => {
    if (err) {
      console.error(`Une erreur est survenue lors de la création de la table ${table} : ${err}`);
    } else {
      console.log(`La table ${table} existe déjà...`);
      client.query(`SELECT * FROM ${table}`)
        .then(res => {
          if (res.rowCount === 0 || res.rowCount === undefined || res.rowCount === null) {
            client.query(`INSERT INTO ${table}(id_user, id_location) SELECT id, location FROM users`)
              .then(res => {
                if (res.rowCount > 1) {
                  console.log(`${res.rowCount} enregistrements ont été ajoutés à la table ${table} ;-)`);
                } else {
                  console.log(`${res.rowCount} enregistrement a été ajouté à la table ${table} ;-)`);
                }
              });
          }
        });
    }
  });
}
