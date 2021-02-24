const cp = require('child_process').exec;
const process = require('process');

const exportDB = name => {
  cp(`pg_dump -U postgres -h localhost ${process.env.DB} > ${name}`, (err, stdout, stderr) => {
    if (err || stderr) {
      console.error(`Erreur lors de l'export de la DB: ${err}`);
      return;
    } else {
      console.log(`La base de données '${process.env.DB}' a été exportée avec succès !`);
      return;
    }
  });
}

module.exports = exportDB;
