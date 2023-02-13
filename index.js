const fs = require("fs-extra");
const randomBytes = require("crypto").randomBytes;
const express = require("express");
const app = express();
const cp = require("child_process").exec;
const path = require("path");
const os = require("os");
const cors = require("cors");
const server = require("http").Server(app);
const bcrypt = require("bcrypt");
const passport = require("passport");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const methodOverride = require("method-override");

const checkForPassword = require("./modules/checkDbPassword");
const createDB = require("./modules/createDB");
const exportDB = require("./modules/exportDB");
const existPath = require("./modules/existPath");
const createJWTServerPrivateKey = require("./modules/createJWTServerPrivateKey");

let config = {
  user: "postgres",
  database: "postgres",
  host: "localhost",
};

const Pool = require("pg").Pool;
const initClient = new Pool(app.pool, config);

config = checkForPassword(config);

const corsOptions = {
  maxAge: 3600,
  origin: [/localhost$/, "192.168.1.*"],
  optionsSuccessStatus: 200,
};

createDB(app.pool, initClient, config);

existPath("./backups/");
existPath("./exports/");
existPath("./templates/");

// Export a copy of the database every twelve hours
setInterval(() => {
  console.log("DB backup on " + new Date().toLocaleString("FR-be"));

  // Empty the 'backupsV directory to only keep 3 versions of the database before creating a new save
  const dir = "./backups/";
  const backups = fs.readdirSync(dir).sort();

  for (const [i, backup] of backups.entries()) {
    if (i <= backups.length - 3) {
      fs.unlinkSync(`${dir}${backup}`);
    } else if (i === backups.length - 1) {
      console.log("backups folder is now empty !");
    }
  }

  exportDB(`./backups/planner_${Date.now()}.pgsql`);
}, 12 * 60 * 60 * 1000);

app
  .use("/locales", express.static(__dirname + "/locales"))
  .use("/src", express.static(__dirname + "/src"))
  .use(
    express.urlencoded({
      extended: false,
    })
  )
  .use((req, res, next) => {
    // Set some security headers
    res.setHeader("X-XSS-Protection", "1;mode=block");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader(
      "Feature-Policy",
      "accelerometer 'none'; ambient-light-sensor 'none'; autoplay 'none'; camera 'none'; encrypted-media 'none'; fullscreen 'self'; geolocation 'none'; gyroscope 'none'; magnetometer 'none'; microphone 'none'; midi 'none'; payment 'none';  picture-in-picture 'none'; speaker 'none'; sync-xhr 'none'; usb 'none'; vr 'none';"
    );
    res.setHeader(
      "Content-Security-Policy",
      " default-src 'none'; connect-src 'self'; font-src https://fonts.gstatic.com; form-action 'self'; img-src 'self' data:; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com/;"
    );
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    return next();
  })
  .use(cors(corsOptions))
  .use(
    session({
      store: new pgSession({
        pool: app.pool,
        conString: config.connectionString,
      }),
      secret: randomBytes(256).toString("hex"),
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 30 * 30, // Set the session lifetime to thirty minutes
      },
    })
  )
  .use(passport.initialize())
  .use(passport.session())
  .use(methodOverride("_method"))
  .use(express.json());

app.listen(3000);

createJWTServerPrivateKey()
  .then(async (res) => {
    console.log(res);

    require("./routes/locations")(app);
    require("./routes/login")(app);
    require("./routes/logout")(app);
    require("./routes/new-request")(app);
    require("./routes/user")(app);
    require("./routes/userDetail")(app);
    require("./routes/users")(app);
  })
  .catch((err) => console.log(err));

app.get('/hello', (req, res, next) => {
  res.send('hello there !');
});

module.exports = app;
