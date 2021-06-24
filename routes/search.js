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
    let locations = await app.pool.query(`SELECT location_name, location_id FROM locations ORDER BY location_name`);
    app.pool.query(`SELECT user_id, name, firstname FROM users`)
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
          if (!data.getApplicant) query = `SELECT
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
            u.firstname
          FROM tasks t
          LEFT JOIN users u ON t.user_fk = u.user_id
          WHERE t.location_fk = $1 ORDER BY t.task_id`, [data.location];
          else query = `SELECT
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
            u.firstname
          FROM tasks t
          LEFT JOIN users u ON t.user_fk = u.user_id
          WHERE t.applicant_name ILIKE '%$1%' AND t.location_fk = $2 ORDER BY t.task_id`, [data.applicant_name, data.location];
        } else {
          if (!data.getApplicant) query = `SELECT
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
          ORDER BY t.task_id`;
          else query = `SELECT
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
          LEFT JOIN users u ON t.user_fk = u.user_id WHERE t.applicant_name ILIKE '%$1%' ORDER BY t.task_id`, [data.applicant_name];
        }

        // Disable automatic notifications for the first request in case it does not return any results
        DBquery(app, io, 'SELECT', 'tasks', {
            text: query
          }, false)
          .then(res => {
            if (res.rowCount > 0) {
              io.emit('search results', res.rows);
            } else if (res.rowCount === 0) {
              if (!data.getApplicant) query = `SELECT
                t.task_id,
                t.applicant_name,
                t.applicant_firstname,
                t.request_date,
                t.location_fk,
                t.user_fk,
                t.comment,
                t.status,
                t.attachment,
                t.attachment_src
              FROM tasks t WHERE t.location_fk = $1 ORDER BY t.task_id`, [data.location];
              else query = `SELECT
                t.task_id,
                t.applicant_name,
                t.applicant_firstname,
                t.request_date,
                t.location_fk,
                t.user_fk,
                t.comment,
                t.status,
                t.attachment,
                t.attachment_src
              FROM tasks t WHERE t.applicant_name ILIKE '%$1%' ORDER BY t.task_id`, data.applicant_name;

              DBquery(app, io, 'SELECT', 'tasks', {
                  text: query
                })
                .then(res => {
                  if (res.rowCount !== 0 || res.rowCount !== null) {
                    io.emit('search results', res.rows);
                  }
                });
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

      deleteData(app, io, 'task_id', passport);

      mail(app, io);
    });
  });
};
