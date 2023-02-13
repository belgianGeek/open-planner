module.exports = function createTasksTable(tableName, dbPool) {
  return new Promise(function(resolve, reject) {
    dbPool.query(`CREATE TABLE IF NOT EXISTS ${tableName} (
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
        reject(`Une erreur est survenue lors de la création de la table ${tableName} : ${err}`);
      } else {
        console.log(res);
        resolve(`La table ${tableName} existe déjà...`);
      }
    });
  });
}
