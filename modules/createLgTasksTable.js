module.exports = function createLgTasksTable(client) {
  let table = 'lg_tasks';
  client.query(`CREATE TABLE IF NOT EXISTS ${table} (` +
    'id SERIAL,' +
    'username TEXT,' +
    'request_date TIMESTAMPTZ,' +
    'site TEXT,' +
    'comment TEXT,' +
    'statut TEXT)', (err, res) => {
      if (err) {
        console.error(`Une erreur best survenue lors de la création de la table ${table} : ${JSON.stringify(err, null, 2)}`);
      } else {
        console.log(`La table ${table} existe déjà...`);
      }
    });
}
