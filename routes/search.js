module.exports = function(app, io) {
  const bcrypt = require('bcrypt');
  const check4updates = require('../modules/check4updates');
  const checkAuth = require('../modules/checkAuth');
  const deleteData = require('../modules/deleteData');
  const DBquery = require('../modules/DBquery');
  const env = require('dotenv').config();
  const notify = require('../modules/notify');
  const passport = require('passport');
  const restart = require('../modules/restart');
  const process = require('process');
  const shutdown = require('../modules/shutdown');

  app.get('/search', checkAuth, (req, res) => {
    app.client.query(`SELECT user_id, name, firstname FROM users`)
      .then(data => {
        res.render('search.ejs', {
          currentVersion: app.tag,
          locations: process.env.LOCATIONS.split(','),
          isSearchPage: true,
          programName: process.env.PROGRAM_NAME,
          users: data.rows,
          userType: req.user.type
        });
      });

    let query = '';

    io.once('connection', io => {
      io.on('search', data => {
        if (!data.getApplicant) query = `SELECT * FROM tasks INNER JOIN users ON tasks.user_fk = users.user_id WHERE location_fk = ${data.location} ORDER BY tasks.task_id`;
        else query = `SELECT * FROM tasks INNER JOIN users ON tasks.user_fk = users.user_id WHERE applicant_name ILIKE '%${data.applicant_name}%' ORDER BY tasks.task_id`;

        // Disable automatic notifications for the first request in case it does not return any results
        DBquery(app, io, 'SELECT', 'tasks', {
            text: query
          }, false)
          .then(res => {
            if (res.rowCount !== 0) {
              io.emit('search results', res.rows);
            } else if (res.rowCount === 0) {
              if (!data.getApplicant) query = `SELECT * FROM tasks WHERE location_fk = ${data.location} ORDER BY task_id`;
              else query = `SELECT * FROM tasks WHERE applicant_name ILIKE '%${data.applicant_name}%' ORDER BY task_id`;

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

      restart(io);

      shutdown(io);

      io.on('update', record => {
        query = `UPDATE ${record.table} SET applicant_name = '${record.values[0]}', applicant_firstname = '${record.values[1]}', request_date = '${record.values[2]}', comment = '${record.values[4]}', status = '${record.values[5]}', user_fk = ${record.values[6]} WHERE task_id = ${record.id}`;

        console.log(`\n${query}`);
        DBquery(app, io, 'UPDATE', record.table, {
          text: query
        });
      });

      deleteData(app, passport, io, 'task_id');
    });
  });
};
