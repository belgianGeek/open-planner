const notify = require('./notify');

const DBquery = (app, io, action, table, query, displayNotification = true) => {
  if (arguments.length === 3) {
    action = arguments[0];
    table = arguments[1];
    query = arguments[2];
    io = null;
  }

  return new Promise((fullfill, reject) => {
    app.client.query(query)
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
        if (action !== 'SELECT' && table !== 'barcodes') {
          notify(io, 'error');
        }
        console.error(JSON.stringify(err, null, 2));
        reject(`Une erreur est survenue lors de l'action '${action}' dans la table '${table}' avec la requête "${query.text}" :\n${err}`);
        return;
      });
  });
}

module.exports = DBquery;
