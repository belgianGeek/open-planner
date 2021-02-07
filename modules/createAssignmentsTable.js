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
    }
  });
}
