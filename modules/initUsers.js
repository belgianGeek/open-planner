const passport = require('passport');
const passportInit = require('./passport');

const initUsers = async (dbPool, passport) => {
  const users = await dbPool.query('SELECT email, firstname, gender, location, name, password, type, user_id FROM users');

  passportInit(
    passport,
    email => users.rows.find(user => user.email === email),
    id => users.rows.find(user => user.user_id === id)
  );
}

module.exports = initUsers;