module.exports = function(app, io) {
  const notFoundmessages = [
    'Hey, il semble que vous soyez égaré ! Par contre, tu as trouvé Scrat, félicitations !',
    'Coucou ! Tu sembles t\'être trompé.e de chemin !',
    'Désolé, il semble que cette page n\'existe pas ou plus...',
    'Ceci n\'est pas une page d\'erreur (Nan, j\'déconne, c\'est une vraie)',
    'BRAVO, t\'as tout cassé !'
  ];

  app.use((req, res, next) => {
    res.status(404).render('404.ejs', {
      msg: notFoundmessages[Math.floor(Math.random() * notFoundmessages.length)],
      programName: process.env.PROGRAM_NAME
    });
  });
};
