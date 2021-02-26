const env = require('dotenv').config();
const fs = require('fs-extra');
const express = require('express');
const app = express();
const ip = require('ip');
const cp = require('child_process').exec;
const path = require('path');
const process = require('process');
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

const getUsers = async () => {
  const users = await client.query('SELECT * FROM users');

  passportInit(
    passport,
    email => users.rows.find(user => user.email === email),
    id => users.rows.find(user => user.user_id === id)
  );
}

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

        getUsers();
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

const appendUser = async data => {
  try {
    let failure;
    data.values[6] = await bcrypt.hash(data.values[6], 10);
    const result = await client.query(`SELECT * FROM users`);

    const addUser = () => {
      DBquery(io, 'INSERT INTO', data.table, {
        text: `INSERT INTO ${data.table}(name, firstname, email, location, gender, type, password) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING user_id`,
        values: data.values
      }).then(async res => {
        getUsers();

        const users = await client.query(`SELECT * FROM users INNER JOIN locations ON users.location = locations.location_id ORDER BY name`);
        io.emit('users retrieved', users.rows);
      });
    }

    if (result.rows !== null) {
      // Check if the given username is not already in use
      if (result.rows.find(user => user.name.toLowerCase().match(data.values[0].toLowerCase())) === undefined) {
        failure = false;

        addUser();
      } else {
        failure = true;
      }
    } else {
      addUser();
    }

    if (failure) {
      notify(io, 'failure');
    }
  } catch (e) {
    console.error(e);
  }
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

const deleteData = (io, id) => {
  io.on('delete data', data => {
    if (data.key !== undefined) {
      query = `DELETE FROM ${data.table} WHERE ${id} = '${data.key}'`;

      DBquery(io, 'DELETE FROM', data.table, {
        text: query
      });
    }
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

app.get('/', checkAuth, async (req, res) => {
    const response = await client.query(`SELECT * FROM users`);
    let firstUser = false;
    if (!response.rowCount) {
      firstUser = true;
    }

    res.render('index.ejs', {
      currentVersion: tag,
      firstUser: firstUser,
      isSearchPage: false,
      locations: process.env.LOCATIONS.split(','),
      programName: process.env.PROGRAM_NAME,
      userType: req.user.type
    });

    io.once('connection', io => {
      io.on('append data', async data => {
        if (data.table === 'tasks') {
          DBquery(io, 'INSERT INTO', data.table, {
            text: `INSERT INTO ${data.table}(applicant_name, applicant_firstname, request_date, location_fk, comment, status) VALUES($1, $2, $3, $4, $5, $6)`,
            values: data.values
          });
        } else if (data.table === 'users') {
          appendUser(data);
        } else {
          console.error(`Unable to append data : ${data.table} is not supported or does not exist`);
        }
      });

      io.on('get users', async () => {
        const users = await client.query(`SELECT * FROM users INNER JOIN locations ON users.location = locations.location_id ORDER BY name`);
        io.emit('users retrieved', users.rows);
      });

      check4updates(io, tag);

      restart(io);

      shutdown(io);

      deleteData(io, 'user_id');

      io.on('export db', format => {
        emptyDir('exports');

        if (format === 'csv') {
          const table = 'tasks';
          const filename = table + '-' + new Date().toUTCString().replace(/\s/g, '-') + '.csv';
          DBquery(io, 'COPY', table, {
              text: `COPY ${table} TO '${path.join(__dirname + '/exports/' + filename)}' DELIMITER ',' CSV HEADER`
            })
            .then(() => {
              file2download.path = `exports/${filename}`;
              file2download.name = filename;

              io.emit('export successfull');
            })
            .catch(err => {
              console.error(`Une erreur est survenue lors de l'export de la table ${table} : ${err}`);
            });
        } else if (format === 'pgsql') {
          file2download.path = `exports/${process.env.DB}-${new Date().toUTCString().replace(/\s/g, '-')}.pgsql`;
          file2download.name = `${process.env.DB}-${new Date().toUTCString().replace(/\s/g, '-')}.pgsql`;
          exportDB(file2download.path);

          io.emit('export successfull');
        }
      });

      io.on('send mail', data => {
        let receiver = {
          mail: '',
          request: data.request
        };

        let applicant = data.applicant;

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

      io.on('settings', settings => {
        if (settings.mail_content !== undefined) {
          query = `UPDATE settings SET mail_content = '${settings.mail_content}'`;
          console.log(query);
        }

        DBquery(io, 'UPDATE', 'settings', {
          text: query
        });
      });

      io.on('update', async record => {
        query = `UPDATE ${record.table} SET name = '${record.values[0]}', firstname = '${record.values[1]}', email = '${record.values[2]}', location = '${record.values[3]}', gender = '${record.values[4]}', type = '${record.values[5]}', password = '${await bcrypt.hash(record.values[6], 10)}' WHERE user_id = ${record.id}`;

        console.log(`\n${query}`);
        DBquery(io, 'UPDATE', record.table, {
          text: query
        }).then(() => getUsers());
      });
    });
  })

  .get('/login', checkNotAuth, async (req, res) => {
    const response = await client.query(`SELECT * FROM users`);
    if (response.rowCount) {
      res.render('login.ejs', {
        firstUser: false,
        locations: process.env.LOCATIONS.split(','),
        programName: process.env.PROGRAM_NAME
      });
    } else {
      res.render('login.ejs', {
        firstUser: true,
        locations: process.env.LOCATIONS.split(','),
        programName: process.env.PROGRAM_NAME
      });
    }

    io.on('connection', io => {
      io.on('append data', async data => {
        appendUser(data);
      });
    });
  })

  .post('/login', checkNotAuth, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  }))

  .get('/search', checkAuth, (req, res) => {
    client.query(`SELECT user_id, name, firstname FROM users`)
      .then(data => {
        res.render('search.ejs', {
          currentVersion: tag,
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
        query = `UPDATE ${record.table} SET applicant_name = '${record.values[0]}', applicant_firstname = '${record.values[1]}', request_date = '${record.values[2]}', comment = '${record.values[4]}', status = '${record.values[5]}', user_fk = ${record.values[6]} WHERE task_id = ${record.id}`;

        console.log(`\n${query}`);
        DBquery(io, 'UPDATE', record.table, {
          text: query
        });
      });

      deleteData(io, 'task_id');
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
