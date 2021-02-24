const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

function passportInit(passport, getUserByEmail, getUserById) {
  const authenticatedUser = async (email, password, done) => {
    const user = getUserByEmail(email);

    if (user === null || user === undefined) {
      return done(null, false, {
        message: 'Aucune correspondance trouvée... Vérifie ton nom d\'utilisateur et ton mot de passe'
      });
    } else {
      try {
        if (await bcrypt.compare(password, user.password)) {
          return done(null, user);
        } else {
          return done(null, false, {
            message: 'Mot de passe incorrect'
          });
        }
      } catch (e) {
        return done(e);
      }
    }
  }

  passport.use(new LocalStrategy({
    usernameField: 'email'
  }, authenticatedUser));

  passport.serializeUser((user, done) => done(null, user.user_id));

  passport.deserializeUser((id, done) => done(null, getUserById(id)));
}

module.exports = passportInit;
