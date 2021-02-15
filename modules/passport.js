const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

function passportInit(passport, getUserByName, getUserById) {
  const authenticatedUser = async (name, password, done) => {
    const user = getUserByName(name);

    if (user === null) {
      return done(null, false, {
        message: 'No user found'
      });
    }

    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user);
      } else {
        return done(null, false, {
          message: 'Incorrect password'
        });
      }
    } catch (e) {
      return done(e);
    }
  }

  passport.use(new LocalStrategy({
    usernameField: 'name'
  }, authenticatedUser));

  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser((id, done) => done(null, getUserById(id)));
}

module.exports = passportInit;
