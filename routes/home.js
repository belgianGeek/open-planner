module.exports = function(app, io) {
  const appendData = require('../modules/appendData');
  const bcrypt = require('bcrypt');
  const check4updates = require('../modules/check4updates');
  const checkAuth = require('../modules/checkAuth');
  const deleteData = require('../modules/deleteData');
  const DBquery = require('../modules/DBquery');
  const exportDB = require('../modules/exportDB');
  const emptyDir = require('../modules/emptyDir');
  const fs = require('fs-extra');
  const getSettings = require('../modules/getSettings');
  const getUsers = require('../modules/getUsers');
  const mail = require('../modules/mail');
  const notify = require('../modules/notify');
  const path = require('path');
  const passport = require('passport');

  app.get('/', checkAuth, async (req, res) => {
    let userSettings = await getSettings(app.client);
    const response = await app.client.query(`SELECT * FROM users`);
    let isFirstUserConfigured = false;
    if (response.rowCount) {
      isFirstUserConfigured = true;
    }

    let locations = await app.client.query(`SELECT location_name, location_id FROM locations ORDER BY location_name`);

    res.render('index.ejs', {
      currentVersion: app.tag,
      isFirstUserConfigured: isFirstUserConfigured,
      isSearchPage: false,
      locations: locations.rows,
      instanceName: app.open_planner_instance_name,
      user: req.user
    });

    io.once('connection', io => {
      io.emit('username', {
        firstname: req.user.firstname,
        name: req.user.name
      });

      io.emit('settings', userSettings);

      io.on('append data', async data => {
        if (data.table === 'tasks') {
          if (!data.sendAttachment) {
            DBquery(app, io, 'INSERT INTO', data.table, {
              text: `INSERT INTO ${data.table}(applicant_name, applicant_firstname, comment, request_date, location_fk, status, attachment) VALUES($1, $2, $3, $4, $5, $6, $7)`,
              values: data.values
            });
          } else {
            DBquery(app, io, 'INSERT INTO', data.table, {
              text: `INSERT INTO ${data.table}(applicant_name, applicant_firstname, comment, request_date, location_fk, status, attachment, attachment_src) VALUES($1, $2, $3, $4, $5, $6, $7, $8)`,
              values: data.values
            });
          }
        } else if (data.table === 'users' || data.table === 'locations') {
          appendData(app, data, io);
        } else {
          console.error(`Unable to append data : ${data.table} is not supported or does not exist`);
        }
      });

      io.on('get users', async () => {
        const users = await app.client.query(`SELECT * FROM users INNER JOIN locations ON users.location = locations.location_id ORDER BY name`);
        io.emit('users retrieved', users.rows);
      });

      io.on('get locations', async () => {
        const locations = await app.client.query(`SELECT * FROM locations ORDER BY location_name`);
        io.emit('locations retrieved', locations.rows);
      });

      check4updates(io, app.tag);

      io.on('delete data', data => {
        if (data.table === 'users') {
          deleteData(app, io, 'user_id', data, passport);
        } else if (data.table === 'locations') {
          deleteData(app, io, 'location_id', data);
        }
      });

      io.on('export db', format => {
        emptyDir('exports');

        if (format === 'csv') {
          const table = 'tasks';
          const filename = table + '-' + new Date().toUTCString().replace(/[\s,]/g, '-') + '.csv';
          DBquery(app, io, 'SELECT', table, {
              text: `SELECT * FROM tasks LEFT JOIN users ON tasks.user_fk = users.user_id ORDER BY tasks.task_id`
            })
            .then(async res => {
              let data2write = 'Identifiant de la tâche,Demandeur,Date de la demande,Implantation concernée par la demande,Utilisateur chargé de la tâche,Objet de la demande,Statut\n';

              for (const [i, row] of res.rows.entries()) {
                const location = await app.client.query(`SELECT location_name FROM locations WHERE location_id = ${row.location_fk}`);

                let status = '';
                if (row.status === 'done') {
                  status = 'Terminée';
                } else if (row.status === 'wip') {
                  status = 'En cours';
                } else {
                  status = 'Aucune attribution';
                }

                data2write += `${row.task_id},${row.applicant_firstname} ${row.applicant_name.toUpperCase()},${row.request_date.toLocaleDateString('fr-BE')},${location.rows[0].location_name},${row.firstname} ${row.name.toUpperCase()},${row.comment.replace(/\'\'/, "'")},${status}\n`;

                if (i === res.rows.length - 1) {
                  fs.writeFile(path.join(__dirname, '../exports/' + filename), data2write, (err) => {
                    if (!err) {
                      notify(io, 'success');
                      app.file2download.path = `exports/${filename}`;
                      app.file2download.name = filename;

                      io.emit('export successfull');
                    } else {
                      console.trace(err);
                    }
                  });
                }
              }
            })
            .catch(err => {
              console.error(`Une erreur est survenue lors de l'export de la table ${table} : ${err}`);
            });
        } else if (format === 'pgsql') {
          app.file2download.path = `exports/planner-${new Date().toUTCString().replace(/\s/g, '-')}.pgsql`;
          app.file2download.name = `planner-${new Date().toUTCString().replace(/\s/g, '-')}.pgsql`;
          exportDB(app.file2download.path);

          io.emit('export successfull');
        }
      });

      mail(app, io);

      io.on('settings', settings => {
        query = ['UPDATE settings SET'];
        if (settings.sendmail !== undefined) {
          query.push(`sendmail = ${settings.sendmail},`);
        }

        if (settings.sendcc !== undefined) {
          query.push(`sendcc = ${settings.sendcc},`);
        }

        if (settings.sender !== undefined) {
          query.push(`sender = '${settings.sender}',`);
        }

        if (settings.smtp_passwd !== undefined) {
          query.push(`smtp_passwd = '${settings.smtp_passwd}',`);
        }

        if (settings.smtp_user !== undefined) {
          query.push(`smtp_user = '${settings.smtp_user}',`);
        }

        if (settings.smtp_host !== undefined) {
          query.push(`smtp_host = '${settings.smtp_host}',`);
        }

        DBquery(app, io, 'UPDATE', 'settings', {
          text: query.join(' ').replace(/,$/, '')
        });
      });

      io.on('update', async record => {
        if (record.table === 'users') {
          if (record.setPassword) {
            query = `UPDATE ${record.table} SET name = '${record.values[0]}', firstname = '${record.values[1]}', email = '${record.values[2]}', location = '${record.values[3]}', gender = '${record.values[4]}', type = '${record.values[5]}', password = '${await bcrypt.hash(record.values[6], 10)}' WHERE user_id = ${record.id}`;
          } else {
            query = `UPDATE ${record.table} SET name = '${record.values[0]}', firstname = '${record.values[1]}', email = '${record.values[2]}', location = '${record.values[3]}', gender = '${record.values[4]}', type = '${record.values[5]}' WHERE user_id = ${record.id}`;
          }
        } else {
          query = `UPDATE ${record.table} SET location_name = '${record.values[0]}', location_mail = '${record.values[1]}' WHERE location_id = ${record.id}`;
        }

        console.log(`\n${query}`);
        DBquery(app, io, 'UPDATE', record.table, {
          text: query
        }).then(() => getUsers(app, passport));
      });
    });
  })
}
