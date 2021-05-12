const cp = require('child_process').exec;

const exportDB = (connString, name) => {
  cp(`pg_dump ${connString} > ${name}`, (err, stdout, stderr) => {
    if (err || stderr) {
      console.error(`Erreur lors de l'export de la DB: ${err}`);
      return;
    } else {
      console.log(`La base de données 'planner' a été exportée avec succès !`);
      return;
    }
  });
}

module.exports = exportDB;
