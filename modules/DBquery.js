const notify = require('./notify');

const DBquery = (app, io, action, table, query, displayNotification = true) => {
  return new Promise((fullfill, reject) => {
    app.pool.query({
      name: query.name,
      text: query.text,
      values: query.values
    })
      .then(res => {
        if (res.rowCount === 0 || res.rowCount === null) {
          if (io !== null && displayNotification) {
            notify(io, 'info');
          }
        } else {
          if (action !== 'SELECT' && action !== 'COPY' && table !== 'barcodes') {
            if (io !== null && displayNotification) {
              notify(io, 'success');
            }
          }
        }

        fullfill(res);
        return;
      })
      .catch(err => {
        if (action !== 'SELECT') {
          notify(io, 'error');
        }
        console.trace(`DBquery error : ${err}`);
        reject(`Une erreur est survenue lors de l'action '${action}' dans la table '${table}' avec la requête "${query.text}" :\n${err}`);
        return;
      });
  });
}

module.exports = DBquery;
