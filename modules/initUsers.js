const passport = require('passport');
const passportInit = require('./passport');

const initUsers = async (app, passport) => {
<<<<<<< Updated upstream
  const users = await app.pool.query('SELECT email, firstname, gender, location, name, password, type, user_id FROM users');
=======
  const users = await app.pool.query('SELECT email, firstname, gender, location, name, password, type FROM users');
>>>>>>> Stashed changes

  passportInit(
    passport,
    email => users.rows.find(user => user.email === email),
    id => users.rows.find(user => user.user_id === id)
  );
}

module.exports = initUsers;
