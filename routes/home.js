module.exports = function(app, io) {
  const appendUser = require('../modules/appendUser');
  const bcrypt = require('bcrypt');
  const check4updates = require('../modules/check4updates');
  const checkAuth = require('../modules/checkAuth');
  const deleteData = require('../modules/deleteData');
  const DBquery = require('../modules/DBquery');
  const env = require('dotenv').config();
  const exportDB = require('../modules/exportDB');
  const emptyDir = require('../modules/emptyDir');
  const getSettings = require('../modules/getSettings');
  const getUsers = require('../modules/getUsers');
  const mail = require('../modules/mail');
  const notify = require('../modules/notify');
  const path = require('path');
  const passport = require('passport');
  const restart = require('../modules/restart');
  const process = require('process');
  const shutdown = require('../modules/shutdown');

  app.get('/', checkAuth, async (req, res) => {
    let userSettings = await getSettings(app.client);
    const response = await app.client.query(`SELECT * FROM users`);
    let firstUser = false;
    if (!response.rowCount) {
      firstUser = true;
    }

    res.render('index.ejs', {
      currentVersion: app.tag,
      firstUser: firstUser,
      isSearchPage: false,
      locations: process.env.LOCATIONS.split(','),
      programName: process.env.PROGRAM_NAME,
      userType: req.user.type
    });

    io.once('connection', io => {
      io.emit('settings', userSettings);

      io.on('append data', async data => {
        if (data.table === 'tasks') {
          DBquery(app, io, 'INSERT INTO', data.table, {
            text: `INSERT INTO ${data.table}(applicant_name, applicant_firstname, request_date, location_fk, comment, status) VALUES($1, $2, $3, $4, $5, $6)`,
            values: data.values
          });
        } else if (data.table === 'users') {
          appendUser(app, data, io);
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

      restart(io);

      shutdown(io);

      deleteData(app, passport, io, 'user_id');

      io.on('export db', format => {
        emptyDir('exports');

        if (format === 'csv') {
          const table = 'tasks';
          const filename = table + '-' + new Date().toUTCString().replace(/\s/g, '-') + '.csv';
          DBquery(app, io, 'COPY', table, {
              text: `COPY ${table} TO '${path.join(__dirname, '../exports/' + filename)}' DELIMITER ',' CSV HEADER`
            })
            .then(() => {
              app.file2download.path = `exports/${filename}`;
              app.file2download.name = filename;

              io.emit('export successfull');
            })
            .catch(err => {
              console.error(`Une erreur est survenue lors de l'export de la table ${table} : ${err}`);
            });
        } else if (format === 'pgsql') {
          app.file2download.path = `exports/${process.env.DB}-${new Date().toUTCString().replace(/\s/g, '-')}.pgsql`;
          app.file2download.name = `${process.env.DB}-${new Date().toUTCString().replace(/\s/g, '-')}.pgsql`;
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

        DBquery(app, io, 'UPDATE', 'settings', {
          text: query.join(' ').replace(/,$/, '')
        });
      });

      io.on('update', async record => {
        if (record.table === 'users') {
          query = `UPDATE ${record.table} SET name = '${record.values[0]}', firstname = '${record.values[1]}', email = '${record.values[2]}', location = '${record.values[3]}', gender = '${record.values[4]}', type = '${record.values[5]}', password = '${await bcrypt.hash(record.values[6], 10)}' WHERE user_id = ${record.id}`;
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
