const deleteData = (app, io, id, data, passport) => {
  const DBquery = require('./DBquery');
  const getUsers = require('./getUsers');
  const mail = require('../modules/mail');
  const notify = require('./notify');

  if (data.key !== undefined && data.key !== '') {
    query = {
      text: `DELETE FROM ${data.table} WHERE ${id} = $1`,
      values: [data.key]
    };

    if (data.table !== 'tasks') {
      DBquery(app, io, 'DELETE FROM', data.table, query)
        .then(() => {
            getUsers(app, passport);
        });
    } else if (data.table === 'tasks') {
      mail(app, io);
    }

  } else {
    notify(io, 'failure');
  }
}

module.exports = deleteData;
