const express = require('express');
const app = express();
const server = require('http').Server(app);
const Pool = require('pg').Pool;
const fs = require('fs-extra');
const cors = require('cors');

let config = {
  user: 'postgres',
  database: 'planner',
  host: 'localhost',
  password: 'LabAdmin4000!'
};

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

    // DBquery(app, io, 'UPDATE', 'settings', {
    //   name: 'update-settings',
    //   text: query.join(' ').replace(/,$/, ''),
    //   values: values
    // });
    // if (!data.sendattachment) {
    //   DBquery(app, io, 'INSERT INTO', data.table, {
    //     text: `INSERT INTO ${data.table}(applicant_name, applicant_firstname, comment,
    //       request_date, location_fk, status, user_fk, attachment) VALUES($1, $2, $3, $4, $5, $6, $7, $8)`,
    //     values: data.values
    //   });
    // } else {
    //   DBquery(app, io, 'INSERT INTO', data.table, {
    //     text: `INSERT INTO ${data.table}(applicant_name, applicant_firstname, comment,
    //       request_date, location_fk, status, user_fk, attachment, attachment_src) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    //     values: data.values
    //   });
    // }
  });

app.listen(8000);
