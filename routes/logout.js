module.exports = function(app, io) {
  app.delete('/logout', (req, res) => {
    req.logOut();
    res.redirect('/login');
  });
};
