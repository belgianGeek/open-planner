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

server.listen(8000);

const {
  Client
} = require('pg');

let config = {
  user: 'postgres',
  password: process.env.PG_USER_PASSWD,
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

const createAssignmentsTable = require('./modules/createAssignmentsTable');
const createLocationsTable = require('./modules/createLocationsTable');
const createTasksTable = require('./modules/createTasksTable');
const createUsersTable = require('./modules/createUsersTable');
const createSettingsTable = require('./modules/createSettingsTable');

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
        createAssignmentsTable(client);
        createTasksTable(client);
        // .then(() => {
        //   client.query({
        //       text: 'SELECT * FROM settings'
        //     })
        //     .then(res => {
        //       settings = res.rows[0];
        //     });
        // })
        // .catch(err => console.error(err));
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

app.use("/src", express.static(__dirname + "/src"));

app.get('/', (req, res) => {
    res.render('index.ejs', {
      currentVersion: tag,
      isSearchPage: false,
      locations: process.env.LOCATIONS
    });

    io.once('connection', io => {
      // const updateBarcode = () => {
      //   DBquery(io, 'SELECT', 'barcodes', {
      //       text: `SELECT barcode, available FROM barcodes WHERE available = true LIMIT 1`
      //     })
      //     .then(res => {
      //       let code = res.rows[0].barcode;
      //
      //       io.emit('barcode', code);
      //     })
      //     .catch(err => {
      //       notify(io, 'barcode');
      //       console.error(`Une erreur est survenue lors de l'attribution d'un numéro d'exemplaire : ${err}`);
      //     });
      // }
      // updateBarcode();

      io.on('append data', data => {
        console.log(JSON.stringify(data, null, 2));
        DBquery(io, 'INSERT INTO', data.table, {
          text: `INSERT INTO ${data.table}(applicant_name, applicant_firstname, request_date, comment, status) VALUES($1, $2, $3, $4, $5)`,
          values: data.values
        });
      });

      check4updates(io, tag);

      restart(io);

      shutdown(io);

      io.on('delete data', data => {
        if (data.table === 'in_requests') {
          let barcode = '';

          DBquery(io, 'SELECT', data.table, {
              text: `SELECT barcode from ${data.table} WHERE pib_number = ${data.data}`
            })
            .then(res => {
              barcode = res.rows[0].barcode;

              DBquery(io, 'UPDATE', 'barcodes', {
                  text: `UPDATE barcodes SET available = true WHERE barcode ILIKE '${barcode}'`
                })
                .catch(err => console.error(`Erreur lors de la mise à jour de la table barcodes : ${err}`));
            })
            .then(() => {
              DBquery(io, 'DELETE FROM', data.table, {
                  text: `DELETE FROM ${data.table} WHERE pib_number = '${data.data}'`
                })
                .catch(err => console.error(`L'emprunt ${data.data} n'a pas pu être supprimé : ${err}`));
            })
            .then(() => {
              updateBarcode();
            })
            .catch(err => console.error(`Une erreur est survenue lors du processus de suppression de la demande ${data.data} : ${err}`))
        } else if (data.table === 'out_requests') {
          DBquery(io, 'DELETE FROM', data.table, {
              text: `DELETE FROM ${data.table} WHERE pib_number = '${data.data}'`
            })
            .catch(err => console.error(`Une erreur est survenue lors de la suppression du prêt ${data.data} : ${err}`));
        }
      });

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

      io.on('mail request', reader => {
        DBquery(io, 'SELECT', 'readers', {
            text: `SELECT email, gender FROM readers WHERE name ILIKE '${reader}'`
          })
          .then(res => {
            io.emit('mail retrieved', {
              mail: res.rows[0].email.substring(7, 100),
              gender: res.rows[0].gender
            });
          })
          .catch(err => {
            console.log(JSON.stringify(err, null, 2));
          });
      });

      io.on('send mail', receiver => {
        mail(receiver, client);
        notify(io, 'mail');
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

  .get('/search', (req, res) => {
    res.render('search.ejs', {
      currentVersion: tag,
      locations: process.env.LOCATIONS.split(','),
      isSearchPage: true
    });
    let query = '';

    io.once('connection', io => {
      io.on('search', data => {
        if (!data.getApplicant) query = `SELECT * FROM ${data.table}`;
        else query = `SELECT * FROM ${data.table} WHERE applicant_name ILIKE '%${data.applicant_name}%'`;

        DBquery(io, 'SELECT', data.table, {
            text: query
          })
          .then(res => {
            if (res.rowCount !== 0 || res.rowCount !== null) {
              io.emit('search results', res.rows);
            }
          });
      });

      check4updates(io, tag);

      restart(io);

      shutdown(io);

      io.on('update', record => {
        query = `UPDATE ${record.table} SET applicant_name = '${record.values[0]}', applicant_firstname = '${record.values[1]}', request_date = '${record.values[2]}', comment = '${record.values[4]}', status = '${record.values[5]}', assigned_worker = '${record.values[6]}' WHERE id = ${record.id}`;

        console.log(`\n${query}`);
        DBquery(io, 'UPDATE', record.table, {
          text: query
        });
      });

      io.on('delete data', data => {
        query = `DELETE FROM tasks WHERE id = '${data.key}'`;

        DBquery(io, 'DELETE FROM', data.table, {
          text: query
        });
      });
    });
  })

  .get('/download', (req, res, next) => {
    res.download(file2download.path, file2download.name, err => {
      if (err) console.log(JSON.stringify(err, null, 2));
    });
  });
