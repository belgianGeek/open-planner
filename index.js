const env = require('dotenv').config();
const fs = require('fs-extra');
const express = require('express');
const app = express();
const ip = require('ip');
const cp = require('child_process').exec;
const path = require('path');
const process = require('process');
const admZip = require('adm-zip');
const os = require('os');

const server = require('http').Server(app);
const io = require('socket.io')(server);

const mail = require('./modules/mail');
const pibUpdate = require('./modules/update');

const passport = require('passport');
const bcrypt = require('bcrypt');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');

server.listen(8000);

const {
  Client
} = require('pg');

let config = {
  user: 'postgres',
  database: 'postgres',
  port: 5432,
  host: 'localhost'
};
const initClient = new Client(config);
let client;

// Define a variable to store the settings retrieved from the DB
let settings = {};

const users = [];

let tag = '0.1.0';

const exportDB = require('./modules/exportDB');
const emptyDir = require('./modules/emptyDir');
const notify = require('./modules/notify');
const existPath = require('./modules/existPath');

const createLocationsTable = require('./modules/createLocationsTable');
const createTasksTable = require('./modules/createTasksTable');
const createUsersTable = require('./modules/createUsersTable');
const createSettingsTable = require('./modules/createSettingsTable');

const checkAuth = require('./modules/checkAuth');
const checkNotAuth = require('./modules/checkNotAuth');

const passportInit = require('./modules/passport');
passportInit(
  passport,
  name => users.find(user => user.name === name),
  id => users.find(user => user.id === id)
);

const createDB = (config, DBname = process.env.DB) => {
  const createTables = () => {
    console.log(`Base de données ${DBname} créée avec succès, création des tables en cours...`);
    client = new Client(config);

    client.connect()
      .then(() => {
        console.log('Reconnexion effectuée !');
        // Tables have to be created in this exact order to avoid errors when assigning foreign key constraints
        createLocationsTable(client, process.env.LOCATIONS.split(','));
        createUsersTable(client);
        createTasksTable(client);
        createSettingsTable(client);
      })
      .catch(err => {
        console.log(err);
      });
  }

  const reconnect = () => {
    // Disconnect from the 'postgres' DB and connect to the newly created 'node-planner' DB
    config.database = process.env.DB;

    initClient
      .end()
      .then(() => console.log('Reconnexion en cours...'))
      .catch(err => console.error('Une erreur est survenue lors de la tentative de reconnexion à la base de données', err));
  }

  console.log(`Création de la base de données ${DBname}...`);
  initClient.query(`CREATE DATABASE ${DBname} WITH ENCODING = 'UTF-8'`)
    .then(res => {
      reconnect();

      createTables();
    })
    .catch(err => {
      if (!err.message.match('exist')) {
        console.error(`Erreur lors de la création de la base de données ${DBname} : ${err}`);
      } else {
        console.log(`La base de données ${DBname} existe déjà !`);
        reconnect();
        createTables();
      }
    });
}

const DBquery = (io, action, table, query, displayNotification = true) => {
  if (arguments.length === 3) {
    action = arguments[0];
    table = arguments[1];
    query = arguments[2];
    io = null;
  }

  return new Promise((fullfill, reject) => {
    client.query(query)
      .then(res => {
        if (res.rowCount === 0 || res.rowCount === null) {
          if (io !== null && displayNotification) {
            notify(io, 'info');
          }
        } else {
          if (action !== 'SELECT' && action !== 'COPY' && table !== 'barcodes') {
            if (io !== null && displayNotification) {
              notify(io, 'success');
            }
          }
        }

        fullfill(res);
        return;
      })
      .catch(err => {
        if (action !== 'SELECT' && table !== 'barcodes') {
          notify(io, 'error');
        }
        console.error(JSON.stringify(err, null, 2));
        reject(`Une erreur est survenue lors de l'action '${action}' dans la table '${table}' avec la requête "${query.text}" :\n${err}`);
        return;
      });
  });
}

const check4updates = (io, tag) => {
  io.on('update check', () => {
    pibUpdate(io, tag);
  });
}

const shutdown = io => {
  io.on('shutdown', () => {
    console.log('Extinction des feux !');
    process.exit(0);
  });
}

const restart = io => {
  io.on('restart', () => {
    console.log('Redémarrage en cours...');
    cp('sudo systemctl restart pib', (err, stdout, stderr) => {
      if (!err) {
        console.log(stdout);
      } else console.error(err);
    });
  });
}

existPath('./backups/');
existPath('./exports/');

// Exporter une sauvegarde de la DB toutes les douze heures
setInterval(() => {
  console.log('DB backup on ' + Date.now());
  exportDB(`./backups/${process.env.DB}_${Date.now()}.pgsql`);
}, 12 * 60 * 60 * 1000);


// Define a variable to store a file to download when exporting DB
let file2download = {};

initClient.connect()
  .then(() => {
    if (!ip.address().match(/169.254/) || !ip.address().match(/127.0/)) {
      console.log(`Tu peux te connecter à ${process.env.PROGRAM_NAME} ici : http://${ip.address()}:8000.`);
      createDB(config, process.env.DB);
    } else {
      console.log(`Désolé, il semble que tu n'aies pas accès à Internet... Rétablis ta connexion et réessaie :-)`);
    }
  })
  .catch(err => {
    console.log(`Connection error : ${err}`);
    if (err.code === 'ECONNREFUSED') {
      console.log('Désolé, la connexion à la base de données n\'a pas pu être établie...\n' +
        'Vérifie que le service PostgreSQL est bien démarré et relance Node Planner.');
    }
    return;
  });

app.set('view engine', 'ejs');
app.use("/src", express.static(__dirname + "/src"));
app.use(express.urlencoded({
  extended: false
}));
app.use(flash());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  savedUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(methodOverride('_method'));

app.get('/', checkAuth, (req, res) => {
    res.render('index.ejs', {
      currentVersion: tag,
      isSearchPage: false,
      locations: process.env.LOCATIONS.split(',')
    });

    io.once('connection', io => {
      io.on('append data', data => {
        console.log(JSON.stringify(data, null, 2));
        DBquery(io, 'INSERT INTO', data.table, {
          text: `INSERT INTO ${data.table}(applicant_name, applicant_firstname, request_date, location_fk, comment, status) VALUES($1, $2, $3, $4, $5, $6)`,
          values: data.values
        });
      });

      check4updates(io, tag);

      restart(io);

      shutdown(io);

      io.on('export db', format => {
        emptyDir('exports');

        if (format === 'csv') {
          DBquery(io, 'COPY', 'in_requests', {
              text: `COPY in_requests TO '${path.join(__dirname + '/exports/loans.csv')}' DELIMITER ',' CSV HEADER`
            })
            .then(() => {
              DBquery(io, 'COPY', 'out_requests', {
                  text: `COPY out_requests TO '${path.join(__dirname + '/exports/borrowings.csv')}' DELIMITER ',' CSV HEADER`
                })
                .then(() => {
                  DBquery(io, 'COPY', 'drafts', {
                      text: `COPY drafts TO '${path.join(__dirname + '/exports/drafts.csv')}' DELIMITER ',' CSV HEADER`
                    })
                    .then(() => {
                      // Zip the received files before sending them to the client
                      let zip = new admZip();

                      zip.addLocalFolder('exports', 'pib-manager-export.zip');

                      file2download.path = 'exports/pib-manager-export.zip';
                      file2download.name = 'pib-manager-export.zip';

                      zip.writeZip(file2download.path);
                      io.emit('export successfull');
                    })
                    .catch(err => {
                      console.error(`Une erreur est survenue lors de l'export de la table des requêtes express : ${err}`);
                    });
                })
                .catch(err => {
                  console.error(`Une erreur est survenue lors de l'export de la table des prêts : ${err}`);
                });
            })
            .catch(err => {
              console.error(`Une erreur est survenue lors de l'export de la table des emprunts : ${err}`);
            });
        } else if (format === 'pgsql') {
          file2download.path = 'exports/pib.pgsql';
          file2download.name = 'pib.pgsql';
          exportDB(file2download.path);

          io.emit('export successfull');
        }
      });

      // io.on('mail request', user => {
      //   DBquery(io, 'SELECT', 'users', {
      //       text: `SELECT email, gender FROM users WHERE applicant_name ILIKE '${user.name}' AND applicant_firstname = '${user.firstname}'`
      //     })
      //     .then(res => {
      //       io.emit('mail retrieved', {
      //         mail: res.rows[0].email,
      //         gender: res.rows[0].gender
      //       });
      //     })
      //     .catch(err => {
      //       console.log(JSON.stringify(err, null, 2));
      //     });
      // });

      io.on('send mail', data => {
        let receiver = {
          mail: '',
          request: data.request
        };

        let applicant = data.applicant;
        console.log(applicant);

        DBquery(io, 'SELECT', 'users', {
            text: `SELECT * FROM users INNER JOIN locations ON users.location = locations.location_id`
          })
          .then(res => {
            receiver.mail = res.rows[0].location_mail;
            // Do not set the receiver gender
            mail(receiver, applicant, client);
            notify(io, 'mail');
          })
          .catch(err => {
            console.log(JSON.stringify(err, null, 2));
          });
      });

      io.on('retrieve readers', name => {
        if (name.length >= 3) {
          client.query(`SELECT name FROM readers WHERE name ILIKE '${name}%' LIMIT 5`)
            .then(res => {
              io.emit('readers retrieved', res.rows);
            })
            .catch(err => {
              console.error(err);
            });
        }
      });

      io.on('settings', settings => {
        if (settings.mail_content !== undefined) {
          query = `UPDATE settings SET mail_content = '${settings.mail_content}'`;
          console.log(query);
        }

        DBquery(io, 'UPDATE', 'settings', {
          text: query
        });
      });
    });
  })

  .get('/login', checkNotAuth, (req, res) => {
    res.render('login.ejs');
  })

  .post('/login', checkNotAuth, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  }))

  .get('/register', checkNotAuth, (req, res) => {
    res.render('register.ejs', {
      locations: process.env.LOCATIONS.split(',')
    });
  })

  .post('/register', checkNotAuth, async (req, res) => {

    try {
      let failure;
      const hash = await bcrypt.hash(req.body.password, 10);
      const result = await client.query(`SELECT * FROM users`);
      if (result.rows !== null) {
        // Check if the given username is not already in use
        let regex = new RegExp(req.body.name, 'i');
        if (result.rows.find(user => user.name.match(regex)) === null && result.rows.find(user => user.name.match(regex)) === undefined) {
          failure = false;

          DBquery(io, 'INSERT INTO', 'users', {
            text: `INSERT INTO users(firstname, name, email, location, gender, password) VALUES('${req.body.firstname}', '${req.body.name}', '${req.body.email}', ${req.body.location}, '${req.body.gender}', '${req.body.password}')`
          }, false);
        } else {
          failure = true;
        }
      }

      if (failure) {
        res.redirect('/register');
      } else {
        res.redirect('/login');
      }
    } catch (e) {
      res.redirect('/register');
      console.error(e);
    }
  })

  .get('/search', checkAuth, (req, res) => {
    client.query(`SELECT user_id, name, firstname FROM users`)
      .then(data => {
        res.render('search.ejs', {
          currentVersion: tag,
          locations: process.env.LOCATIONS.split(','),
          isSearchPage: true,
          users: data.rows
        });
      });

    let query = '';

    io.once('connection', io => {
      io.on('search', data => {
        if (!data.getApplicant) query = `SELECT * FROM tasks INNER JOIN users ON tasks.user_fk = users.user_id WHERE location_fk = ${data.location} ORDER BY tasks.task_id`;
        else query = `SELECT * FROM tasks INNER JOIN users ON tasks.user_fk = users.user_id WHERE applicant_name ILIKE '%${data.applicant_name}%' ORDER BY tasks.task_id`;

        // Disable automatic notifications for the first request in case it does not return any results
        DBquery(io, 'SELECT', 'tasks', {
            text: query
          }, false)
          .then(res => {
            if (res.rowCount !== 0) {
              io.emit('search results', res.rows);
            } else if (res.rowCount === 0) {
              if (!data.getApplicant) query = `SELECT * FROM tasks WHERE location_fk = ${data.location} ORDER BY task_id`;
              else query = `SELECT * FROM tasks WHERE applicant_name ILIKE '%${data.applicant_name}%' ORDER BY task_id`;

              DBquery(io, 'SELECT', 'tasks', {
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

      check4updates(io, tag);

      restart(io);

      shutdown(io);

      io.on('update', record => {
        console.log(JSON.stringify(record, null, 2));
        query = `UPDATE ${record.table} SET applicant_name = '${record.values[0]}', applicant_firstname = '${record.values[1]}', request_date = '${record.values[2]}', comment = '${record.values[4]}', status = '${record.values[5]}', user_fk = ${record.values[6]} WHERE task_id = ${record.id}`;

        console.log(`\n${query}`);
        DBquery(io, 'UPDATE', record.table, {
          text: query
        });
      });

      io.on('delete data', data => {
        if (data.key !== undefined) {
          query = `DELETE FROM tasks WHERE task_id = '${data.key}'`;

          DBquery(io, 'DELETE FROM', data.table, {
            text: query
          });
        }
      });
    });
  })

  .get('/download', (req, res, next) => {
    res.download(file2download.path, file2download.name, err => {
      if (err) console.log(JSON.stringify(err, null, 2));
    });
  })

  .delete('/logout', (req, res) => {
    req.logOut();
    res.redirect('/login');
  });
