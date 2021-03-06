const bcrypt = require('bcrypt');
const DBquery = require('../modules/DBquery');
const getUsers = require('../modules/getUsers');
const notify = require('../modules/notify');
const passport = require('passport');

const appendUser = async (app, data, io) => {
  try {
    let failure;
    data.values[6] = await bcrypt.hash(data.values[6], 10);
    const result = await app.client.query(`SELECT * FROM users`);

    const addUser = () => {
      DBquery(app, io, 'INSERT INTO', data.table, {
        text: `INSERT INTO ${data.table}(name, firstname, email, location, gender, type, password) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING user_id`,
        values: data.values
      }).then(async res => {
        getUsers(app, passport);

        const users = await app.client.query(`SELECT * FROM users INNER JOIN locations ON users.location = locations.location_id ORDER BY name`);
        io.emit('users retrieved', users.rows);
      });
    }

    if (result.rows !== null) {
      // Check if the given username is not already in use
      if (result.rows.find(user => user.name.toLowerCase().match(data.values[0].toLowerCase())) === undefined) {
        failure = false;

        addUser();
      } else {
        failure = true;
      }
    } else {
      addUser();
    }

    if (failure) {
      notify(io, 'failure');
    }
  } catch (e) {
    console.error(e);
  }
}

module.exports = appendUser;
