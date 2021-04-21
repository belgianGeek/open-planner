module.exports = function(app, io) {
  app.get('/template', (req, res) => {
    res.download('templates/users.csv');
  });
};
