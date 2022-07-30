module.exports = function(app, ws) {
  app.post('/ws', async (req, res, next) => {
      if (req.body.route === '/login') {
        ws.on('connection', ws => {
          ws.emit('hello there', 'ping !');
        });
      }
    });
};
