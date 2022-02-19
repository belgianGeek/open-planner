const fs = require('fs-extra');
const randomBytes = require('crypto').randomBytes;
const express = require('express');
const app = express();
const ip = require('ip');
const cp = require('child_process').exec;
const path = require('path');
const os = require('os');

const server = require('http').Server(app);
const io = require('socket.io')(server);

const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const methodOverride = require('method-override');

server.listen(process.env.PORT);

const Pool = require('pg').Pool;

let config = {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
};

app.pool = new Pool(config);

// Define a variable to store the settings retrieved from the DB
let settings = {};

app.tag = '0.3.2';

const exportDB = require('./modules/exportDB');
const getUsers = require('./modules/getUsers');
const existPath = require('./modules/existPath');

const i18n = require('i18n');
i18n.configure({
  autoReload: true,
  locales: ['en', 'fr'],
  directory: path.join(__dirname, '/locales'),
  defaultLocale: 'fr',
  objectNotation: true,
  queryParameter: 'lang',
  updateFiles: false
});

const createLocationsTable = require('./modules/createLocationsTable');
const createSessionTable = require('./modules/createSessionTable');
const createTasksTable = require('./modules/createTasksTable');
const createUsersTable = require('./modules/createUsersTable');

const createDB = (config, DBname = 'planner') => {
  const createTables = () => {
    console.log(`Base de données ${DBname} créée avec succès, création des tables en cours...`);
    app.pool = new Pool(config);

    // Tables have to be created in this exact order to avoid errors when assigning foreign key constraints
    app.pool.connect()
      .then(() => {
        createLocationsTable(app.pool)
          .then(res => {
            console.log(res);

            createUsersTable(app.pool)
              .then(res => {
                console.log(res);

                getUsers(app, passport);

                createTasksTable(app.pool)
                  .then(res => {
                    console.log(res);
                    console.log(`Tu peux te connecter à Open Planner ici : http://${ip.address()}:8000.`);

                      if (fs.existsSync('update-db.js')) {
                        const updatePlannerBackend = require('./update-db.js');
                        updatePlannerBackend(app);
                      }
                  });
              })
              .catch(err => console.log(err));
          })
          .catch(err => console.log(err));
      })
      .catch(err => {
        console.trace(`Pool connection error : ${err}`);
      });
  }

  const reconnect = () => {
    // Disconnect from the 'postgres' DB and connect to the newly created 'node-planner' DB
    config.database = 'planner';
    checkForPassword();

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
existPath('./templates/');

// Export a copy of the database every twelve hours
setInterval(() => {
  console.log('DB backup on ' + new Date().toLocaleString('FR-be'));

  // Empty the 'backupsV directory to only keep 3 versions of the database before creating a new save
  const dir = './backups/';
  const backups = fs.readdirSync(dir).sort();

  for (const [i, backup] of backups.entries()) {
    if (i <= backups.length -3) {
      fs.unlinkSync(`${dir}${backup}`);
    } else if (i === backups.length -1) {
      console.log('backups folder is now empty !');
    }
  }

  exportDB(`./backups/planner_${Date.now()}.pgsql`);
}, 12 * 60 * 60 * 1000);


// Define a variable to store a file to download when exporting DB
app.file2download = {};

// Tables have to be created in this exact order to avoid errors when assigning foreign key constraints
app.pool.connect()
  .then(() => {
    // Check if the 'session' table exist before doing anything else
    createSessionTable(app.pool);
    createLocationsTable(app.pool)
      .then(res => {
        console.log(res);

        createUsersTable(app.pool)
          .then(res => {
            console.log(res);

            getUsers(app, passport);

            createTasksTable(app.pool)
              .then(res => {
                console.log(res);
                console.log(`Tu peux te connecter à Open Planner ici : http://${ip.address()}:8000.`);
              });
          })
          .catch(err => console.log(err));
      })
      .catch(err => console.log(err));
  })
  .catch(err => {
    console.trace(`Pool connection error : ${err}`);
  });

app.set('view engine', 'ejs')
  .use("/locales", express.static(__dirname + "/locales"))
  .use("/src", express.static(__dirname + "/src"))
  .use(express.urlencoded({
    extended: false
  }))
  .use((req, res, next) => {
    // Set some security headers
    res.setHeader('X-XSS-Protection', '1;mode=block');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Feature-Policy', "accelerometer 'none'; ambient-light-sensor 'none'; autoplay 'none'; camera 'none'; encrypted-media 'none'; fullscreen 'self'; geolocation 'none'; gyroscope 'none'; magnetometer 'none'; microphone 'none'; midi 'none'; payment 'none';  picture-in-picture 'none'; speaker 'none'; sync-xhr 'none'; usb 'none'; vr 'none';");
    res.setHeader('Content-Security-Policy', " default-src 'none'; connect-src 'self'; font-src https://fonts.gstatic.com; form-action 'self'; img-src 'self' data:; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com/;");
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return next();
  })
  .use(flash())
  .use(session({
    store: new pgSession({
      pool: app.pool,
      conString: config.connectionString
    }),
    secret: randomBytes(256).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 30 * 30 // Set the session lifetime to thirty minutes
    }
  }))
  .use(i18n.init)
  .use(passport.initialize())
  .use(passport.session())
  .use(methodOverride('_method'));

require('./routes/createDB')(app, io);
require('./routes/download')(app, io);
require('./routes/home')(app, io, config.connectionString);
require('./routes/login')(app, io);
require('./routes/logout')(app, io);
require('./routes/search')(app, io);
require('./routes/template')(app, io);
require('./routes/upload')(app, io);
require('./routes/notFound')(app, io);

module.exports = app;
