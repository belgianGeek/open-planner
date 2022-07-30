const notify = require('./notify');

const DBquery = (app, url, action, query, displayNotification = true) => {
  return new Promise((fullfill, reject) => {
    app.pool.query({
        name: query.name,
        text: query.text,
        values: query.values
      })
      .then(res => {
        if (res.rowCount === 0 || res.rowCount === null) {
          if (displayNotification) {
            notify(url, 'info');
          }
        } else {
          if (displayNotification) {
            notify(url, 'success');
          }
        }

        fullfill(res);
        return;
      })
      .catch(err => {
        if (action !== 'SELECT') {
          notify(url, 'error');
        }
        console.trace(`DBquery error : ${err}`);
        reject(`Une erreur est survenue lors de l'action '${action}' dans la table '${table}' avec la requête "${query.text}" :\n${err}`);
        return;
      });
  });
}

module.exports = DBquery;
