module.exports = function(app, io) {
  app.get('/download', (req, res, next) => {
    if (req.user === undefined) {
      res.redirect('/login');
    } else {
      if (req.user.type !== 'guest') {
        res.download(app.file2download.path, app.file2download.name, err => {
          if (err) console.log(JSON.stringify(err, null, 2));
        });
      } else {
        const errorMessages = [
          "Désolé jeune novice, l'accès à cette page t'es refusé",
          "À cette page tu n'as pas accès, jeune Padawan",
          `Seuls les Chevaliers Jedi peuvent accéder à ce lieu, Padawan ${req.user.name}`
        ];

        res.status(403).render('404.ejs', {
          msg: errorMessages[Math.floor(Math.random() * errorMessages.length)],
          instanceName: app.open_planner_instance_name,
          instance_description: app.open_planner_instance_description,
          page_type: 'Accès non autorisé',
          route: req.path
        });
      }
    }
  });
}
