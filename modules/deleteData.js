const deleteData = (app, io, id, data, passport) => {
  const DBquery = require('./DBquery');
  const getUsers = require('./getUsers');
  const notify = require('./notify');

  if (data.key !== undefined && data.key !== '') {
    query = {
      text: `DELETE FROM ${data.table} WHERE ${id} = $1`,
      values: [data.key]
    };

    DBquery(app, io, 'DELETE FROM', data.table, query)
      .then(() => {
        if (data.table === 'users') getUsers(app, passport);
      });
  } else {
    notify(io, 'failure');
  }
}

module.exports = deleteData;
