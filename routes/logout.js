module.exports = function(app) {
  app.delete('/logout', (req, res) => {
    req.logOut();
    return res.send();
  });
};
