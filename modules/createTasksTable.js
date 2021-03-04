module.exports = function createTasksTable(client) {
  let table = `tasks`;
  client.query(`CREATE TABLE IF NOT EXISTS ${table} (
      task_id SERIAL PRIMARY KEY,
      applicant_name TEXT,
      applicant_firstname TEXT,
      request_date TIMESTAMPTZ,
      location_fk INT,
      user_fk INT,
      comment TEXT,
      status TEXT,
      CONSTRAINT location_fk
        FOREIGN KEY(location_fk)
	       REFERENCES locations(location_id)
	        ON DELETE CASCADE,
      CONSTRAINT user_fk
        FOREIGN KEY(user_fk)
    	   REFERENCES users(user_id)
    	    ON DELETE CASCADE
  )`, (err, res) => {
    if (err) {
      console.error(`Une erreur est survenue lors de la création de la table ${table} : ${err}`);
    } else {
      console.log(`La table ${table} existe déjà...`);
    }
  });
}
