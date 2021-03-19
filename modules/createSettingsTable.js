const process = require('process');

const createSettingsTable = client => {
  let msg;
  return new Promise(function(resolve, reject) {
    client.query(`CREATE TABLE IF NOT EXISTS settings (
      sender TEXT,
      mail_address TEXT,
      smtp_user TEXT,
      smtp_host TEXT,
      smtp_passwd TEXT,
      wallpaper TEXT,
      sendcc BOOLEAN,
      sendmail BOOLEAN
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
                  text: `INSERT INTO settings(sender, mail_address, smtp_user, smtp_host, smtp_passwd, wallpaper, sendcc, sendmail) VALUES($1, $2, $3, $4, $5, $6, $7, $8)`,
                  values: [process.env.MAIL_SENDER, process.env.SMTP_USER, process.env.SMTP_USER, process.env.SMTP_HOST, process.env.SMTP_PASSWD, '../src/scss/wallpaper.jpg', true, true]
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
