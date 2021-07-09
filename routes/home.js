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
  const updateTask = require('../modules/updateTask');

  app.get('/', checkAuth, async (req, res) => {
    let userSettings = await getSettings(app.pool);
    const response = await app.pool.query(`
      SELECT
        u.user_id,
        u.name,
        u.firstname,
        u.gender,
        u.email,
        u.location,
        u.type
      FROM users u`);

    let isFirstUserConfigured = false;
    if (response.rowCount) {
      isFirstUserConfigured = true;
    }

    let locations = await app.pool.query(`SELECT location_name, location_id FROM locations ORDER BY location_name`);

    res.render('index.ejs', {
      allowPasswordUpdate: userSettings.allowpasswordupdate,
      currentVersion: app.tag,
      displayMyRequestsMenu: userSettings.displaymyrequestsmenu,
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
                request_date, location_fk, status, attachment) VALUES($1, $2, $3, $4, $5, $6, $7)`,
              values: data.values
            });
          } else {
            DBquery(app, io, 'INSERT INTO', data.table, {
              text: `INSERT INTO ${data.table}(applicant_name, applicant_firstname, comment,
                request_date, location_fk, status, attachment, attachment_src) VALUES($1, $2, $3, $4, $5, $6, $7, $8)`,
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
        const users = await app.pool.query(`
          SELECT
            u.name,
            u.firstname,
            u.email,
            u.location,
            u.gender,
            u.type
           FROM users u
           LEFT JOIN locations l
           ON u.location = l.location_id ORDER BY u.name`);
        io.emit('users retrieved', users.rows);
      });

      io.on('get locations', async () => {
        const locations = await app.pool.query(`
          SELECT
            l.location_id,
            l.location_name,
            l.location_mail
          FROM locations l ORDER BY l.location_name`);
        io.emit('locations retrieved', locations.rows);
      });

      io.on('get history', async () => {
        const history = await app.pool.query(
          `SELECT
            t.task_id,
            t.applicant_name,
            t.applicant_firstname,
            t.request_date,
            t.location_fk,
            t.user_fk,
            t.comment,
            t.status,
            t.attachment,
            t.attachment_src,
            u.user_id,
            u.name,
            u.firstname,
            l.location_id,
            l.location_name
          FROM tasks t
          LEFT JOIN locations l ON t.location_fk = l.location_id
          LEFT JOIN users u ON t.user_fk = u.user_id
          WHERE t.applicant_name ILIKE $1 AND t.applicant_firstname ILIKE $2 ORDER BY t.request_date`,
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
        } else if (data.table === 'tasks') {
          deleteData(app, io, 'task_id', data);
        }
      });

      io.on('export db', format => {
        emptyDir('exports');

        if (format === 'csv') {
          const table = 'tasks';
          const filename = table + '-' + new Date().toUTCString().replace(/[\s,]/g, '-') + '.csv';
          DBquery(app, io, 'SELECT', table, {
              text: `
                SELECT
                 t.task_id,
                 t.applicant_name,
                 t.applicant_firstname,
                 t.request_date,
                 t.location_fk,
                 t.user_fk,
                 t.comment,
                 t.status
                FROM tasks t LEFT JOIN users u ON t.user_fk = u.user_id ORDER BY t.task_id`
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
        let values = [];
        let query = ['UPDATE settings SET'];

        if (settings.allowpasswordupdate !== undefined) {
          values.push(settings.allowpasswordupdate);
          query.push(`allowpasswordupdate = $${values.indexOf(settings.allowpasswordupdate) + 1},`);
        }

        if (settings.displaymyrequestsmenu !== undefined) {
          values.push(settings.displaymyrequestsmenu);
          query.push(`displaymyrequestsmenu = $${values.indexOf(settings.displaymyrequestsmenu) + 1},`);
        }

        if (settings.instance_name !== undefined) {
          values.push(settings.instance_name);
          query.push(`instance_name = $${values.indexOf(settings.instance_name) + 1},`);
        }

        if (settings.instance_description !== undefined) {
          values.push(settings.instance_description);
          query.push(`instance_description = $${values.indexOf(settings.instance_description) + 1},`);
        }

        if (settings.sendmail !== undefined) {
          values.push(settings.sendmail);
          query.push(`sendmail = $${values.indexOf(settings.sendmail) + 1},`);
        }

        if (settings.sendcc !== undefined) {
          values.push(settings.sendcc);
          query.push(`sendcc = $${values.indexOf(settings.sendcc) + 1},`);
        }

        if (settings.sendattachments !== undefined) {
          values.push(settings.sendattachments);
          query.push(`sendattachments = $${values.indexOf(settings.sendattachments) + 1},`);
        }

        if (settings.sender !== undefined) {
          values.push(settings.sender);
          query.push(`sender = $${values.indexOf(settings.sender) + 1},`);
        }

        if (settings.smtp_passwd !== undefined) {
          values.push(settings.smtp_passwd);
          query.push(`smtp_passwd = $${values.indexOf(settings.smtp_passwd) + 1},`);
        }

        if (settings.smtp_user !== undefined) {
          values.push(settings.smtp_user);
          query.push(`smtp_user = $${values.indexOf(settings.smtp_user) + 1},`);
        }

        if (settings.smtp_host !== undefined) {
          values.push(settings.smtp_host);
          query.push(`smtp_host = $${values.indexOf(settings.smtp_host) + 1},`);
        }

        DBquery(app, io, 'UPDATE', 'settings', {
          name: 'update-settings',
          text: query.join(' ').replace(/,$/, ''),
          values: values
        });
      });

      io.on('update', async record => {
        let query = {};

        if (record.table === 'users') {
          query.name = 'update-user';

          if (record.setPassword && record.setType) {
            query = {
              text: `UPDATE ${record.table} SET name = $1, firstname = $2, email = $3, location = $4,
              gender = $5, type = $6, password = $7 WHERE user_id = ${record.id}`,
              values: [
                record.values[0], record.values[1], record.values[2], record.values[3], record.values[4],
                record.values[5], await bcrypt.hash(record.values[6], 10)
              ]
            };
          } else if (!record.setPassword && record.setType) {
            query = {
              text: `UPDATE ${record.table} SET name = $1, firstname = $2, email = $3, location = $4, gender = $5, type = $6 WHERE user_id = ${record.id}`,
              values: record.values
            };
          } else if (record.setPassword && !record.setType) {
            query = {
              text: `UPDATE ${record.table} SET name = $1, firstname = $2, email = $3, location = $4, gender = $5, password = $6 WHERE user_id = ${record.id}`,
              values: [
                record.values[0], record.values[1], record.values[2], record.values[3], record.values[4],
                await bcrypt.hash(record.values[5], 10)
              ]
            };
          } else {
            query = {
              text: `UPDATE ${record.table} SET name = $1, firstname = $2, email = $3, location = $4, gender = $5 WHERE user_id = ${record.id}`,
              values: [record.values[0], record.values[1], record.values[2], record.values[3], record.values[4]]
            };
          }
        } else if (record.table === 'tasks') {
          query = await updateTask(query, record);
        } else {
          query.name = 'update-location';

          query = {
            text: `UPDATE ${record.table} SET location_name = $1, location_mail = $2 WHERE location_id = ${record.id}`,
            values: [record.values[0], record.values[1]]
          }
        }

        DBquery(app, io, 'UPDATE', record.table, query)
          .then(() => {
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
