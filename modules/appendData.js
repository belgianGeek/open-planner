const bcrypt = require('bcrypt');
const DBquery = require('../modules/DBquery');
const getUsers = require('../modules/getUsers');
const notify = require('../modules/notify');
const passport = require('passport');

const appendData = async (app, data, io) => {
  try {
    let failure, query;
    if (data.table === 'users') {
      data.values[6] = await bcrypt.hash(data.values[6], 10);
    }

    const result = await app.pool.query(`SELECT * FROM ${data.table}`);

    const addData = () => {
      if (data.table === 'users') {
        query = `INSERT INTO ${data.table}(name, firstname, email, location, gender, type, password) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING user_id`;
      } else if (data.table === 'locations') {
        query = `INSERT INTO ${data.table}(location_name, location_mail) VALUES($1, $2) RETURNING location_id`;
      }

      DBquery(app, io, 'INSERT INTO', data.table, {
        text: query,
        values: data.values
      }).then(async res => {
        if (data.table === 'users') {
          getUsers(app, passport);

          const users = await app.pool.query(`SELECT * FROM users INNER JOIN locations ON users.location = locations.location_id ORDER BY name`);
          io.emit('users retrieved', users.rows);
        } else if (data.table === 'locations') {
          const locations = await app.pool.query(`SELECT * FROM locations ORDER BY location_name`);
          io.emit('locations retrieved', locations.rows);
        }
      });
    }

    // Check if the given username is not already in use
    if ((data.table === 'users' && result.rows.find(user => user.name.toLowerCase().match(data.values[0].toLowerCase())) === undefined) ||
      (data.table === 'locations' && result.rows.find(location => location.location_name.toLowerCase().match(data.values[0].toLowerCase())) === undefined)) {
      failure = false;

      addData();
    } else {
      failure = true;
    }

    if (failure) {
      notify(io, 'failure');
    }
  } catch (e) {
    console.error(e);
  }
}

module.exports = appendData;
