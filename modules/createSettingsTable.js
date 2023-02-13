const createSettingsTable = (dbPool, data) => {
  let msg;
  return new Promise(function(resolve, reject) {
    dbPool.query(`CREATE TABLE IF NOT EXISTS settings (
      displaymyrequestsmenu BOOLEAN,
      instance_name TEXT,
      instance_description TEXT,
      sender TEXT,
      mail_address TEXT,
      smtp_user TEXT,
      smtp_host TEXT,
      smtp_passwd TEXT,
      wallpaper TEXT,
      allowpasswordupdate BOOLEAN,
      sendattachments BOOLEAN,
      sendcc BOOLEAN,
      sendmail BOOLEAN
  )`, (err, res) => {
      if (err) {
        msg = `La création de la table 'settings' a échoué : ${err}`;
        reject(msg)
        return console.error(msg);
      } else {
        console.log(res);
        console.log('La table \'settings\' a été créée.');
        // If table is empty, fill in the default values
        dbPool.query('SELECT * FROM settings')
          .then(settings => {
            if (!settings.rowCount) {
              console.log('Remplissage initial de la table \'settings\'...');
              let mailContent;
              dbPool.query({
                  text: `INSERT INTO settings(instance_name, instance_description, sender, mail_address, smtp_user, smtp_host, smtp_passwd, wallpaper, allowpasswordupdate, sendattachments, sendcc, sendmail, displaymyrequestsmenu) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
                  values: [data.instance, data.instance_description, data.sender, data.smtp_user, data.smtp_user, data.smtp_host, data.smtp_passwd, '../src/scss/wallpaper.jpg', true, true, true, true, true]
                })
                .then(res => {
                  msg = 'Remplissage de la table \'settings\' effectué avec succès !';
                  resolve(res.rows[0]);
                  return console.log(msg);
                })
                .catch(err => {
                  msg = `Une erreur est survenue lors du remplissage de la table 'settings : ${err}'`;
                  reject(msg);
                  return console.log(msg);
                })
            } else {
              return resolve(settings.rows[0]);
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
