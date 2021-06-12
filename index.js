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

app.tag = '0.1.0';

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

existPath('./backups/');
existPath('./exports/');
existPath('./templates/');

// Exporter une sauvegarde de la DB toutes les douze heures
setInterval(() => {
  console.log('DB backup on ' + Date.now());
  exportDB(config.connectionString, `./backups/planner_${Date.now()}.pgsql`);
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

app.set('view engine', 'ejs');
app.use("/locales", express.static(__dirname + "/locales"));
app.use("/src", express.static(__dirname + "/src"));
app.use(express.urlencoded({
  extended: false
}));
app.use(flash());
app.use(session({
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
}));

app.use(i18n.init);

app.use(passport.initialize());
app.use(passport.session());

app.use(methodOverride('_method'));

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
