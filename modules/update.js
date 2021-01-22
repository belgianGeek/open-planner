const cp = require('child_process').exec;

module.exports = function update(io, tag) {
  cp('git fetch && git pull', (err, stdout, stderr) => {
    if (err) {
      console.error(`Une erreur est survenue lors de la vérification des mises à jour : ${err}`);
    } else {
      console.log(stdout);

      io.emit('update progress', 'Récupération des fichiers...');

      cp('npm install', (err, stdout, stderr) => {
        if (err) {
          console.error(`Une erreur est survenue lors de la mise à jour des dépendances : ${err}`);
        } else {
          console.log('npm install', stdout);

          io.emit('update progress', 'Mise à jour des dépendances...');

          cp('npm prune', (err, stdout, stderr) => {
            if (err) {
              console.error(`Une erreur est survenue lors du nettoyage des dépendances : ${err}`);
            } else {
              console.log(stdout);

              io.emit('update progress', 'Nettoyage...');

              io.emit('update progress', 'Terminé ! 😎');

              setTimeout(() => {
                io.emit('update progress', 'Redémarrez PIB Manager');
              }, 2000);
            }
          });
        }
      });
    }
  });
}
