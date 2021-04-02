const passport = require('passport');
const passportInit = require('./passport');

const getUsers = async (app, passport) => {
  const users = await app.client.query('SELECT * FROM users');

  passportInit(
    passport,
    email => users.rows.find(user => user.email === email),
    id => users.rows.find(user => user.user_id === id)
  );
}

module.exports = getUsers;
