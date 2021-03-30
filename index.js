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

const bcrypt = require('bcrypt');
const passport = require('passport');
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
app.client = undefined;

// Define a variable to store the settings retrieved from the DB
let settings = {};

app.tag = '0.1.0';

const exportDB = require('./modules/exportDB');
const getUsers = require('./modules/getUsers');
const existPath = require('./modules/existPath');

const createLocationsTable = require('./modules/createLocationsTable');
const createTasksTable = require('./modules/createTasksTable');
const createUsersTable = require('./modules/createUsersTable');
const createSettingsTable = require('./modules/createSettingsTable');
const generateRandomString = radix => bcrypt.hashSync(Math.random.toString(radix).substr(2,), 10);

const createDB = (config, DBname = process.env.DB) => {
  const createTables = () => {
    console.log(`Base de données ${DBname} créée avec succès, création des tables en cours...`);
    app.client = new Client(config);

    app.client.connect()
      .then(async() => {
        // Tables have to be created in this exact order to avoid errors when assigning foreign key constraints
        createLocationsTable(app.client);
        createUsersTable(app.client);
        createTasksTable(app.client);
        createSettingsTable(app.client);

        getUsers(app, passport);

        setTimeout(function () {
          console.log(`Tu peux te connecter à ${process.env.PROGRAM_NAME} ici : http://${ip.address()}:8000.`);
        }, 10);
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

existPath('./backups/');
existPath('./exports/');

// Exporter une sauvegarde de la DB toutes les douze heures
setInterval(() => {
  console.log('DB backup on ' + Date.now());
  exportDB(`./backups/${process.env.DB}_${Date.now()}.pgsql`);
}, 12 * 60 * 60 * 1000);


// Define a variable to store a file to download when exporting DB
app.file2download = {};

initClient.connect()
  .then(() => {
    if (!ip.address().match(/169.254/) || !ip.address().match(/127.0/)) {
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
  secret: generateRandomString(16),
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(methodOverride('_method'));

require('./routes/download')(app, io);
require('./routes/home')(app, io);
require('./routes/login')(app, io);
require('./routes/logout')(app, io);
require('./routes/search')(app, io);
require('./routes/notFound')(app, io);

module.exports = app;
