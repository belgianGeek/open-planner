module.exports = function createTasksTable(client) {
    let table = `tasks`;
    client.query(`CREATE TABLE IF NOT EXISTS ${table} (
      id SERIAL PRIMARY KEY,
      applicant_name TEXT,
      applicant_firstname TEXT,
      request_date TIMESTAMPTZ,
      assignment_fk INT,
      comment TEXT,
      status TEXT,
      CONSTRAINT assignment_fk
        FOREIGN KEY(assignment_fk)
	       REFERENCES assignments(id)
	        ON DELETE CASCADE
  )`, (err, res) => {
      if (err) {
        console.error(`Une erreur est survenue lors de la création de la table ${table} : ${err}`);
      } else {
        console.log(`La table ${table} existe déjà...`);
      }
    });
}
