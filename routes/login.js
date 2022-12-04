module.exports = function(app, io) {
  const appendData = require('../modules/appendData');
  const checkNotAuth = require('../modules/checkNotAuth');
  const createSettingsTable = require('../modules/createSettingsTable');
  const DBquery = require('../modules/DBquery');
  const getUsers = require('../modules/getUsers');
  const notify = require('../modules/notify');
  const passport = require('passport');

  app.get('/login', checkNotAuth, async (req, res) => {
      const locations = await app.pool.query(`SELECT location_name FROM locations ORDER BY location_name`);
      app.open_planner_instance_name;

      let isDbConfigured = false;
      let firstUserConfigured = false;

      try {
        const instance = await app.pool.query(`SELECT instance_name, instance_description FROM settings`);
        if (instance.rowCount) {
          if (typeof instance.rows[0].instance_description !== 'object') {
            app.open_planner_instance_description = instance.rows[0].instance_description;
          } else {
            app.open_planner_instance_description = 'A simple but powerful open source task manager';
          }
          app.open_planner_instance_name = instance.rows[0].instance_name;
        } else {
          app.open_planner_instance_name = 'Open Planner';
          app.open_planner_instance_description = 'A simple but powerful open source task manager';
        }
      } catch (e) {
        // Do not catch errors if the table does not exist and proceed to the next step
        app.open_planner_instance_name = 'Open Planner';
        app.open_planner_instance_description = 'A simple but powerful open source task manager';
      } finally {
        try {
          const settings = await app.pool.query(`
            SELECT
              s.instance_name,
              s.instance_description,
              s.sender,
              s.mail_address,
              s.smtp_user,
              s.smtp_host,
              s.smtp_passwd,
              s.wallpaper,
              s.allowpasswordupdate,
              s.sendattachments,
              s.sendcc,
              s.sendmail
            FROM settings s`);

          if (settings.rowCount) {
            isDbConfigured = true;
          }
        } catch (e) {
          // Do not catch errors if the table does not exist and proceed to the next step
          isDbConfigured = false;
        } finally {
          try {
            const DBusers = await app.pool.query(`
              SELECT
                u.user_id,
                u.name,
                u.firstname,
                u.gender,
                u.email,
                u.location,
                u.type
              FROM users u`);

            if (DBusers.rowCount) {
              firstUserConfigured = true;

              // Initialize Passport with the users saved in the database
              getUsers(app, passport);
            }
          } catch (e) {
            console.trace(e);
            firstUserConfigured = false;
          } finally {
            res.render('login.ejs', {
              allowPasswordUpdate: true,
              isFirstUserConfigured: firstUserConfigured,
              locations: locations.rows,
              instanceName: app.open_planner_instance_name,
              instance_description: app.open_planner_instance_description,
              isDbConfigured: isDbConfigured,
              page_type: 'S\'identifier',
              route: req.path
            });

            // If there are already registered users, display the login screen
            // Else, display the registration form
            if (!firstUserConfigured || !isDbConfigured) {
              io.once('connection', io => {
                io.on('append data', async data => {
                  const users = await app.pool.query(`
                    SELECT
                      u.user_id,
                      u.name,
                      u.firstname,
                      u.gender,
                      u.email,
                      u.location,
                      u.type
                    FROM users u`);
                  try {
                    // Only append a new user if there is not any users recorded in the DB yet
                    if (users.rows.length === 0) {
                      appendData(app, data, io);

                      // Redirect the user to the login page
                      io.emit('first user added');
                    }
                  } catch (e) {
                    console.trace(`An error occurred when trying to add the first user : ${e}`);
                  }
                });

                io.on('append settings', async settings => {
                  try {
                    const locations = await app.pool.query(`
                      SELECT
                        l.location_id,
                        l.location_name,
                        l.location_mail
                      FROM locations l`);

                    // Append locations only if there is no row to prevent duplicates
                    if (locations.rowCount === 0) {
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
                    }

                    createSettingsTable(app.pool, settings)
                        .then(settings => {
                          app.open_planner_instance_name = settings.instance_name;
                          app.open_planner_instance_description = settings.instance_description;

                          io.emit('settings import', true);
                          io.emit('first user created');
                        })
                        .catch(() => {
                          io.emit('settings import', false);
                        });

                  } catch (e) {
                    console.trace(`Error appending settings : ${e}`);
                  }

                });

                io.on('get locations', async () => {
                  const locations = await app.pool.query(`
                    SELECT
                      l.location_id,
                      l.location_name,
                      l.location_mail
                    FROM locations l ORDER BY l.location_name`);
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
