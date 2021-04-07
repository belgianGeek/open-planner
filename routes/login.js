module.exports = function(app, io) {
  const appendData = require('../modules/appendData');
  const checkNotAuth = require('../modules/checkNotAuth');
  const createSettingsTable = require('../modules/createSettingsTable');
  const DBquery = require('../modules/DBquery');
  const getUsers = require('../modules/getUsers');
  const notify = require('../modules/notify');
  const passport = require('passport');

  app.get('/login', checkNotAuth, async (req, res) => {
      const locations = await app.client.query(`SELECT location_name FROM locations ORDER BY location_name`);
      app.open_planner_instance_name;

      let isDbConfigured = false;
      let firstUserConfigured = false;

      try {
        const instance = await app.client.query(`SELECT instance_name, instance_description FROM settings`);
        if (instance.rowCount) {
          app.open_planner_instance_name = instance.rows[0].instance_name;
          if (app.open_planner_instance_description !== null) {
            app.open_planner_instance_description = instance.rows[0].instance_description;
          } else {
            app.open_planner_instance_description = 'A simple but powerful open source task manager';
          }
        } else {
          app.open_planner_instance_name = 'Open Planner';
          app.open_planner_instance_description = 'A simple but powerful open source task manager';
        }
      } catch (e) {
        app.open_planner_instance_name = 'Open Planner';
        app.open_planner_instance_description = 'A simple but powerful open source task manager';
      } finally {
        try {
          const settings = await app.client.query(`SELECT * FROM settings`);

          if (settings.rowCount) {
            isDbConfigured = true;
          }
        } catch (e) {
          isDbConfigured = false;
        } finally {
          try {
            const DBusers = await app.client.query(`SELECT * FROM users`);

            if (DBusers.rowCount) {
              firstUserConfigured = true;
            }
          } catch (e) {
            firstUserConfigured = false;
          } finally {
            res.render('login.ejs', {
              isFirstUserConfigured: firstUserConfigured,
              locations: locations.rows,
              instanceName: app.open_planner_instance_name,
              instance_description: app.open_planner_instance_description,
              isDbConfigured: isDbConfigured
            });

            // If there are already registered users, display the login screen
            // Else, display the registration form
            if (!firstUserConfigured || !isDbConfigured) {
              io.once('connection', io => {
                io.on('append data', async data => {
                  const users = await app.client.query('SELECT * FROM users');
                  try {
                    // Only append a new user if there is not any users recorded in the DB yet
                    if (users.rows.length === 0) {
                      appendData(app, data, io);

                      // Redirect the user to the login page
                      io.emit('first user added');
                    }
                  } catch (e) {
                    console.trace(e);
                  }
                });

                io.on('append settings', async settings => {
                  try {
                    const locations = await app.client.query(`SELECT * FROM locations`);

                    // Append locations only if there is no row to prevent duplicates
                    if (!locations.rowCount) {
                      DBquery(app, io, 'INSERT INTO', 'locations', {
                          text: `INSERT INTO locations(location_name, location_mail) VALUES($1, $2) RETURNING location_name, location_id`,
                          values: [settings.location_name, settings.location_mail]
                        })
                        .then(res => {
                          io.emit('locations retrieved', {
                            location_name: res.rows[0].location_name,
                            location_id: res.rows[0].location_id
                          });
                        });

                      createSettingsTable(app.client, settings)
                        .then(() => {
                          notify(io, 'success');
                          io.emit('settings import', true);
                        })
                        .catch(() => {
                          notify(io, 'failure');
                          io.emit('settings import', false);
                        });
                    }
                  } catch (e) {
                    notify(io, 'failure');
                    console.trace(`Error appending settings : ${e}`);
                  }

                });

                io.on('get locations', async () => {
                  const locations = await app.client.query(`SELECT * FROM locations ORDER BY location_name`);
                  io.emit('locations retrieved', locations.rows[0]);
                });
              });
            }
          }
        }
      }
    })

    .post('/login', checkNotAuth, passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/login',
      failureFlash: true
    }));
};
