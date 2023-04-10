const fs = require("fs-extra");
const initUsers = require("./initUsers");
const checkDbPassword = require("./checkDbPassword");
const createLocationsTable = require("./createLocationsTable");
const createSessionTable = require("./createSessionTable");
const createTasksTable = require("./createTasksTable");
const createUsersTable = require("./createUsersTable");
const passport = require("passport");
const ip = require("ip");

const createDB = async (config, DBname = "planner") => {
  const Pool = require("pg").Pool;
  let dbPool = new Pool(config);
  let client, newClient, newDbPool;

  try {
    client = await dbPool.connect();
    console.log(`Création de la base de données ${DBname}...`);
  } catch (err) {
    if (err.code === "ECONNREFUSED") {
      console.log(
        "Désolé, la connexion à la base de données n'a pas pu être établie...\n" +
          "Vérifie que le service PostgreSQL est bien démarré et relance Open Planner."
      );
    } else {
      console.trace(`Pool connection error : ${err}`);
    }
  }

  try {
    const dbCreationQuery = await client.query(
      `CREATE DATABASE ${DBname} WITH ENCODING = 'UTF-8'`
    );
    console.log(dbCreationQuery);
  } catch (err) {
    if (err.code !== "42P04") {
      console.error(
        `Erreur lors de la création de la base de données ${DBname} : ${err}`
      );
    } else {
      console.log(`La base de données ${DBname} existe déjà !`);
    }
  } finally {
    client.end();
    dbPool.end();
  }

  try {
    config.database = DBname;
    checkDbPassword(config);
    newDbPool = new Pool(config);
    newClient = await newDbPool.connect();

    console.log(
      `${DBname} database successfully created, tables are being created...`
    );

    // Tables have to be created in this exact order to avoid errors when assigning foreign key constraints
    const sessionTableCreationLog = await createSessionTable(newClient);
    console.log(sessionTableCreationLog);

    const locationTableCreationLog = await createLocationsTable(
      "locations",
      newClient
    );
    console.log(locationTableCreationLog);

    const usersTableCreationLog = await createUsersTable("users", newClient);
    console.log(usersTableCreationLog);

    initUsers(newClient, passport);

    const tasksTableCreationLog = await createTasksTable("tasks", newClient);
    console.log(tasksTableCreationLog);
    console.log(
      `You can log in to Open Planner using the following link : http:${ip.address()}:8000.`
    );

    // Update the database schema if needed
    if (fs.existsSync("../update-db.js")) {
      require("../update-db.js")(app);
    }
  } catch (error) {
    console.log(
      `An error occurred while database tables were created : ${error}`
    );
  }

  return newClient;
};

module.exports = createDB;
