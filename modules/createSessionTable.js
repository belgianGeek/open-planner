const createSessionTable = dbPool => {
  let msg;
  return new Promise(function(resolve, reject) {
    dbPool.query(`CREATE TABLE IF NOT EXISTS public.session (
      sid character varying PRIMARY KEY NOT NULL,
      sess json NOT NULL,
      expire timestamp(6) without time zone NOT NULL
  )`, (err, res) => {
      if (err) {
        msg = `La création de la table 'session' a échoué : ${err}`;
        reject(msg)
        return console.error(msg);
      } else {
        console.log('La table \'session\' a été créée.');
        return resolve(res);
      }
    });
  });
}

module.exports = createSessionTable;
