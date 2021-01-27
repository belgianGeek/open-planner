module.exports = function createTasksTables(client, locations) {
  for (const [i, site] of locations.entries()) {
    let table = `site${i + 1}_tasks`;
    client.query(`CREATE TABLE IF NOT EXISTS ${table} (` +
      'id SERIAL PRIMARY KEY,' +
      'applicant_name TEXT,' +
      'applicant_firstname TEXT,' +
      'request_date TIMESTAMPTZ,' +
      'location TEXT,' +
      'comment TEXT,' +
      'assigned_worker TEXT,' +
      'status TEXT)', (err, res) => {
        if (err) {
          console.error(`Une erreur best survenue lors de la création de la table ${table} : ${JSON.stringify(err, null, 2)}`);
        } else {
          console.log(`La table ${table} existe déjà...`);
        }
      });
  }
}
