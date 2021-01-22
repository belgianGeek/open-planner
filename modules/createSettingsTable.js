const process = require('process');

const createSettingsTable = (client, settings) => {
  let msg;
  return new Promise(function(resolve, reject) {
    client.query(`CREATE TABLE IF NOT EXISTS settings (
      library TEXT,
      mail_address TEXT,
      mail_content TEXT,
      smtp_user TEXT,
      smtp_host TEXT,
      smtp_passwd TEXT,
      pg_passwd TEXT,
      wallpaper TEXT
  )`, (err, res) => {
      if (err) {
        msg = `La création de la table 'settings' a échoué : ${JSON.stringify(err, null, 2)}`;
        reject(msg)
        return console.error(msg);
      } else {
        console.log('La table \'settings\' existe...');
        // If table is empty, fill in the default values
        client.query('SELECT * FROM settings')
          .then(res => {
            if (!res.rowCount) {
              console.log('Remplissage initial de la table \'settings\'...');
              let mailContent;
              client.query({
                  text: `INSERT INTO settings(library, mail_address, mail_content, smtp_user, smtp_host, smtp_passwd, pg_passwd, wallpaper) VALUES($1, $2, $3, $4, $5, $6, $7, $8)`,
                  values: [process.env.LIBRARY, process.env.MAIL_SENDER, `Le livre %TITLE%, que vous aviez demandé est à votre disposition à la bibliothèque pendant 10 jours. Une fois ce délai écoulé, nous nous réservons le droit de le renvoyer dans sa bibliothèque d'origine.\n\nBonne journée,\nBien à vous,\n%LIBRARY%`, process.env.MAIL_SENDER, process.env.SMTP_HOST, process.env.SMTP_PASSWD, process.env.PG_PASSWD, '../src/scss/wallpaper.jpg']
                })
                .then(res => {
                  msg = 'Remplissage de la table \'settings\' effectué avec succès !';
                  resolve(res);
                  return console.log(msg);
                })
                .catch(err => {
                  msg = `Une erreur est survenue lors du remplissage de la table 'settings : ${err}'`;
                  reject(msg);
                  return console.log(msg);
                })
            } else {
              return resolve(res);
            }
          })
          .catch(err => {
            console.log(`Une erreur est survenue lors de la vérification de la table 'settings' : ${err}`);
          });
      }
    });
  });
}

module.exports = createSettingsTable;
