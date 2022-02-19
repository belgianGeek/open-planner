module.exports = function(app, io) {
  const bcrypt = require('bcrypt');
  const check4updates = require('../modules/check4updates');
  const checkAuth = require('../modules/checkAuth');
  const deleteData = require('../modules/deleteData');
  const DBquery = require('../modules/DBquery');
  const getSettings = require('../modules/getSettings');
  const mail = require('../modules/mail');
  const notify = require('../modules/notify');
  const passport = require('passport');

  app.get('/search', checkAuth, async (req, res) => {
    let userSettings = await getSettings(app.pool);

    // Check if the user is authorized to access to search page
    if (userSettings.allowsearchpageaccess || req.user.type !== 'guest') {
      let locations = await app.pool.query(`SELECT location_name, location_id FROM locations ORDER BY location_name`);
      app.pool.query(`SELECT user_id, name, firstname, type FROM users`)
        .then(data => {
          res.render('search.ejs', {
            currentVersion: app.tag,
            locations: locations.rows,
            isSearchPage: true,
            instanceName: app.open_planner_instance_name,
            instance_description: app.open_planner_instance_description,
            page_type: 'Module de recherche',
            route: req.path,
            sendAttachments: userSettings.sendattachments,
            sendcc: userSettings.sendcc,
            sendmail: userSettings.sendmail,
            users: data.rows,
            user: req.user
          });
        })
        .catch(err => console.trace(err));

      let query = '';

      io.once('connection', io => {
        io.emit('settings', userSettings);

        io.on('search', data => {
          if (data.location !== undefined) {
            if (!data.getApplicant) {
              query = {
                text: `SELECT
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
              u.type
            FROM tasks t
            LEFT JOIN users u ON t.user_fk = u.user_id
            WHERE t.location_fk = $1
            ORDER BY ${data.sortCriteria}`,
                values: [data.location]
              };
            } else {
              query = {
                text: `SELECT
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
              u.type
            FROM tasks t
            LEFT JOIN users u ON t.user_fk = u.user_id
            WHERE t.applicant_name ILIKE $1 AND t.location_fk = $2
            ORDER BY ${data.sortCriteria}`,
                values: [`%${data.applicant_name}%`, data.location]
              };
            }
          } else {
            if (!data.getApplicant) {
              query = {
                text: `SELECT
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
              u.type,
              l.location_id,
              l.location_name
            FROM tasks t
            LEFT JOIN locations l ON t.location_fk = l.location_id
            LEFT JOIN users u ON t.user_fk = u.user_id
            ORDER BY ${data.sortCriteria}`
              };
            } else {
              query = {
                text: `SELECT
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
              u.type,
              l.location_id,
              l.location_name
            FROM tasks t
            LEFT JOIN locations l ON t.location_fk = l.location_id
            LEFT JOIN users u ON t.user_fk = u.user_id WHERE t.applicant_name ILIKE $1 ORDER BY ${data.sortCriteria}`,
                values: [`%${data.applicant_name}%`]
              }
            }
          }

          // Disable automatic notifications for the first request in case it does not return any results
          DBquery(app, io, 'SELECT', 'tasks', query, false)
            .then(res => {
              if (res.rowCount > 0) {
                io.emit('search results', res.rows);
              } else if (res.rowCount === 0) {
                notify(io, 'info');
              }
            });
        });

        check4updates(io, app.tag);

        io.on('update', record => {
          query.name = 'update-task';

          if (!record.sendattachment) {
            query = {
              text: `UPDATE ${record.table} SET applicant_name = $1, applicant_firstname = $2, comment = $3, status = $4, user_fk = $5, attachment = $6 WHERE task_id = $7`,
              values: record.values.concat(record.id)
            }
            console.log(query);
          } else {
            query = {
              text: `UPDATE ${record.table} SET applicant_name = $1, applicant_firstname = $2, comment = $3, status = $4, user_fk = $5, attachment = $6, attachment_src = $7 WHERE task_id = $8`,
              values: record.values.concat(record.id)
            }
          }

          DBquery(app, io, 'UPDATE', record.table, query);
        });

        io.on('delete data', data => {
          deleteData(app, io, 'task_id', data, passport);
        });

        mail(app, io);
      });
    } else {
      const errorMessages = [
        "Désolé jeune novice, l'accès à cette page t'est refusé",
        "À cette page tu n'as pas accès, jeune Padawan",
        `Seuls les Chevaliers Jedi peuvent accéder à ce lieu, Padawan ${req.user.name}`
      ];

      res.status(403).render('404.ejs', {
        msg: errorMessages[Math.floor(Math.random() * errorMessages.length)],
        instanceName: app.open_planner_instance_name,
        instance_description: app.open_planner_instance_description,
        page_type: 'Accès non autorisé',
        route: req.path
      });
    }
  });
};
