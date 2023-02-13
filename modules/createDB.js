const fs = require("fs-extra");
const checkForPassword = require('./checkDbPassword');
const initUsers = require("./initUsers");
const createLocationsTable = require("./createLocationsTable");
const createSessionTable = require("./createSessionTable");
const createTasksTable = require("./createTasksTable");
const createUsersTable = require("./createUsersTable");
const passport = require('passport');
const ip = require("ip");

const createDB = async (dbPool, initClient, config, DBname = "planner") => {
  const createTables = async () => {
    console.log(
      `${DBname} database successfully created, tables are being created...`
    );

    const Pool = require("pg").Pool;
    dbPool = new Pool(config);

    // Tables have to be created in this exact order to avoid errors when assigning foreign key constraints
    try {
      await dbPool.connect();
    } catch (err) {
      if (err.code === "ECONNREFUSED") {
        console.log(
          "Désolé, la connexion à la base de données n'a pas pu être établie...\n" +
            "Vérifie que le service PostgreSQL est bien démarré et relance Node Planner."
        );
      } else {
        console.trace(`Pool connection error : ${err}`);
      }
    }

    const sessionTableCreationLog = await createSessionTable(dbPool);
    console.log(sessionTableCreationLog);

    const locationTableCreationLog = await createLocationsTable(
      "locations",
      dbPool
    );
    console.log(locationTableCreationLog);

    const usersTableCreationLog = await createUsersTable("users", dbPool);
    console.log(usersTableCreationLog);

    initUsers(dbPool, passport);

    const tasksTableCreationLog = await createTasksTable("tasks", dbPool);
    console.log(tasksTableCreationLog);
    console.log(
      `You can log in to Open Planner using the following link : http:${ip.address()}:8000.`
    );

    // Update the database schema if needed
    if (fs.existsSync("../update-db.js")) {
      require("../update-db.js")(app);
    }
  };

  const reconnect = async () => {
    // Disconnect from the 'postgres' DB and connect to the newly created 'node-planner' DB
    config.database = "planner";
    checkForPassword(config);

    try {
      await initClient.end();
    } catch (err) {
      console.error(
        "Une erreur est survenue lors de la tentative de reconnexion à la base de données",
        err
      );
    }
  };

  console.log(`Création de la base de données ${DBname}...`);
  try {
    const dbCreationQuery = await initClient.query(
      `CREATE DATABASE ${DBname} WITH ENCODING = 'UTF-8'`
    );
    console.log(dbCreationQuery);
    await reconnect();

    await createTables();
  } catch (err) {
    if (!err.message.match("exist")) {
      console.error(
        `Erreur lors de la création de la base de données ${DBname} : ${err}`
      );
    } else {
      console.log(`La base de données ${DBname} existe déjà !`);
      await reconnect();
      await createTables();
    }
  }
};

module.exports = createDB;
