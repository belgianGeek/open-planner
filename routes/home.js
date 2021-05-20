module.exports = function(app, io, connString) {
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
  const updateSession = require('../modules/updateSession');

  app.get('/', checkAuth, async (req, res) => {
    let userSettings = await getSettings(app.pool);
    const response = await app.pool.query(`SELECT * FROM users`);
    let isFirstUserConfigured = false;
    if (response.rowCount) {
      isFirstUserConfigured = true;
    }

    let locations = await app.pool.query(`SELECT location_name, location_id FROM locations ORDER BY location_name`);

    res.render('index.ejs', {
      allowPasswordUpdate: userSettings.allowpasswordupdate,
      currentVersion: app.tag,
      isFirstUserConfigured: isFirstUserConfigured,
      isSearchPage: false,
      locations: locations.rows,
      instanceName: app.open_planner_instance_name,
      instance_description: app.open_planner_instance_description,
      page_type: 'Page d\'accueil',
      route: req.path,
      sendAttachments: userSettings.sendattachments,
      user: req.user
    });

    io.once('connection', io => {
      const sendUserData = () => {
        io.emit('user data', {
          firstname: req.user.firstname,
          location: req.user.location,
          name: req.user.name
        });
      }

      sendUserData();

      io.on('user data', () => {
        sendUserData();
      });

      io.emit('settings', userSettings);

      io.on('append data', async data => {
        if (data.table === 'tasks') {
          if (!data.sendattachment) {
            DBquery(app, io, 'INSERT INTO', data.table, {
              text: `INSERT INTO ${data.table}(applicant_name, applicant_firstname, comment,
                request_date, location_fk, status, user_fk, attachment) VALUES($1, $2, $3, $4, $5, $6, $7, $8)`,
              values: data.values
            });
          } else {
            DBquery(app, io, 'INSERT INTO', data.table, {
              text: `INSERT INTO ${data.table}(applicant_name, applicant_firstname, comment,
                request_date, location_fk, status, user_fk, attachment, attachment_src) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
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
        const users = await app.pool.query(`SELECT * FROM users LEFT JOIN locations
          ON users.location = locations.location_id ORDER BY name`);
        io.emit('users retrieved', users.rows);
      });

      io.on('get locations', async () => {
        const locations = await app.pool.query(`SELECT * FROM locations ORDER BY location_name`);
        io.emit('locations retrieved', locations.rows);
      });

      io.on('get history', async () => {
        const history = await app.pool.query(
          `SELECT * FROM tasks LEFT JOIN locations ON tasks.location_fk = locations.location_id WHERE
          tasks.applicant_name ILIKE $1 AND tasks.applicant_firstname ILIKE $2 ORDER BY tasks.request_date`,
          [req.user.name, req.user.firstname]
        );
        io.emit('history retrieved', history.rows);

        if (history.rowCount === 0) {
          notify(io, 'info');
        }
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
                const location = await app.pool.query(`SELECT location_name FROM locations WHERE location_id = $1`, [row.location_fk]);

                let status, applicant = '';
                if (row.status === 'done') {
                  status = 'Terminée';
                } else if (row.status === 'wip') {
                  status = 'En cours';
                } else {
                  status = 'Aucune attribution';
                }

                // Check if the task has been assigned
                if (row.firstname !== null && row.name !== null) {
                  applicant = `${row.firstname} ${row.name.toUpperCase()}`;
                } else {
                  applicant = 'Aucun';
                }

                data2write += `${row.task_id},${row.applicant_firstname} ${row.applicant_name.toUpperCase()},${row.request_date.toLocaleDateString('fr-BE')},${location.rows[0].location_name},${applicant},${row.comment.replace(/\'\'/, "'")},${status}\n`;

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
          exportDB(connString, app.file2download.path);

          io.emit('export successfull');
        }
      });

      mail(app, io);

      io.on('settings', settings => {
        // let values = [];
        query = ['UPDATE settings SET'];
        if (settings.allowpasswordupdate !== undefined) {
          // values.push(settings.allowpasswordupdate);
          // query.push(`allowpasswordupdate = '$${values.indexOf(settings.allowpasswordupdate) + 1}',`);
          query.push(`allowpasswordupdate = '${settings.allowpasswordupdate}',`);
        }

        if (settings.instance_name !== undefined) {
          // values.push(settings.instance_name);
          // query.push(`instance_name = '$${values.indexOf(settings.instance_name) + 1}',`);
          query.push(`instance_name = '${settings.instance_name}',`);
        }

        if (settings.instance_description !== undefined) {
          query.push(`instance_description = '${settings.instance_description}',`);
        }

        if (settings.sendmail !== undefined) {
          query.push(`sendmail = ${settings.sendmail},`);
        }

        if (settings.sendcc !== undefined) {
          query.push(`sendcc = ${settings.sendcc},`);
        }

        if (settings.sendattachments !== undefined) {
          query.push(`sendattachments = ${settings.sendattachments},`);
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
          if (record.setPassword && record.setType) {
            query = `UPDATE ${record.table} SET name = '${record.values[0]}', firstname = '${record.values[1]}', email = '${record.values[2]}', location = '${record.values[3]}', gender = '${record.values[4]}', type = '${record.values[5]}', password = '${await bcrypt.hash(record.values[6], 10)}' WHERE user_id = ${record.id}`;
          } else if (!record.setPassword && record.setType) {
            query = `UPDATE ${record.table} SET name = '${record.values[0]}', firstname = '${record.values[1]}', email = '${record.values[2]}', location = '${record.values[3]}', gender = '${record.values[4]}', type = '${record.values[5]}' WHERE user_id = ${record.id}`;
          } else if (record.setPassword && !record.setType) {
            query = `UPDATE ${record.table} SET name = '${record.values[0]}', firstname = '${record.values[1]}', email = '${record.values[2]}', location = '${record.values[3]}', gender = '${record.values[4]}', password = '${await bcrypt.hash(record.values[5], 10)}' WHERE user_id = ${record.id}`;
          } else {
            query = `UPDATE ${record.table} SET name = '${record.values[0]}', firstname = '${record.values[1]}', email = '${record.values[2]}', location = '${record.values[3]}', gender = '${record.values[4]}' WHERE user_id = ${record.id}`;
          }
        } else if (record.table === 'tasks') {
          if (!record.sendattachment) {
            query = `UPDATE ${record.table} SET applicant_name = '${record.values[0]}', applicant_firstname = '${record.values[1]}', comment = '${record.values[2]}', status = '${record.values[3]}', user_fk = ${record.values[4]} WHERE task_id = ${record.id}`;
          } else {
            query = `UPDATE ${record.table} SET applicant_name = '${record.values[0]}', applicant_firstname = '${record.values[1]}', comment = '${record.values[2]}', status = '${record.values[3]}', user_fk = ${record.values[4]}, attachment = ${record.values[5]}, attachment_src = '${record.values[6]}' WHERE task_id = ${record.id}`;
          }
        } else {
          query = `UPDATE ${record.table} SET location_name = '${record.values[0]}', location_mail = '${record.values[1]}' WHERE location_id = ${record.id}`;
        }

        DBquery(app, io, 'UPDATE', record.table, {
          text: query
        }).then(() => {
          getUsers(app, passport);

          // Only update the user session if he's not an admin (an admin can edit other users' info)
          if (req.user.type !== 'admin') {
            updateSession(io, req, record);
          }
        });
      });
    });
  })
}
