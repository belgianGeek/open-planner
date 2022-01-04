const express = require('express');
const app = express();
const server = require('http').Server(app);
const Pool = require('pg').Pool;
const fs = require('fs-extra');
const cors = require('cors');
const DBquery = require('./modules/DBquery');

let config = {
  user: 'postgres',
  database: 'planner',
  host: 'localhost',
};

const checkForPassword = () => {
  if (fs.existsSync('.passwd')) {
    config.password = fs.readFileSync('.passwd', {
      encoding: 'utf-8'
    });

    config.password = config.password.replace(/[\n\r\s]/g, '');

    config.connectionString = `postgresql://${config.user}:${config.password}@${config.host}:5432/${config.database}`;
  } else {
    config.connectionString = `postgresql://${config.user}@${config.host}:5432/${config.database}`;
  }
}

checkForPassword();

app.pool = new Pool(config).connect();

app
  .use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  })
  .use(express.urlencoded({
    extended: false
  }))
  .use(express.json());

app.get('/', cors(), async (req, res) => {
    const client = new Pool(config);
    const locations = await client.query('SELECT location_id,location_name FROM locations');
    res.send(locations.rows);
  })
  .post('/new-request', cors(), (req, res) => {
    let escapedValues = [];
    let queryValues = [];
    let iReq = 1;

    for (const value in req.body) {
      if (req.body.hasOwnProperty(value)) {
        queryValues.push(req.body[value]);
        escapedValues.push(`$${iReq},`);
        iReq++;
      }
    }

    let query = {
      name: 'add-request',
      text: `INSERT INTO tasks(${Object.keys(req.body).toString()}) VALUES(${escapedValues.join(' ').replace(/,$/, '')})`,
      values: queryValues
    };

    console.log(query);

    DBquery(app, '/new-request', 'INSERT INTO', 'tasks', query)
      .then(res => {
        iReq = 0;
      });
  });

app.listen(8000);
