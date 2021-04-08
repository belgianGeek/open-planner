module.exports = function createTasksTable(pool) {
  let table = `tasks`;
  return new Promise(function(resolve, reject) {
    pool.query(`CREATE TABLE IF NOT EXISTS ${table} (
      task_id SERIAL PRIMARY KEY,
      applicant_name TEXT,
      applicant_firstname TEXT,
      request_date TIMESTAMPTZ,
      location_fk INT,
      user_fk INT,
      comment TEXT,
      status TEXT,
      attachment BOOLEAN,
      attachment_src TEXT,
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
        reject(`Une erreur est survenue lors de la création de la table ${table} : ${err}`);
      } else {
        resolve(`La table ${table} existe déjà...`);
      }
    });
  });
}
