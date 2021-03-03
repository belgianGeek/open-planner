module.exports = function(app, io) {
  app.get('/download', (req, res, next) => {
    res.download(app.file2download.path, app.file2download.name, err => {
      if (err) console.log(JSON.stringify(err, null, 2));
    });
  })
}
