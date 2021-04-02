const deleteData = (app, io, id, data, passport) => {
  const DBquery = require('./DBquery');
  const getUsers = require('./getUsers');
  const notify = require('./notify');

  io.on('delete data', data => {
    if (data.key !== undefined && data.key !== '') {
      query = `DELETE FROM ${data.table} WHERE ${id} = '${data.key}'`;

      DBquery(app, io, 'DELETE FROM', data.table, {
          text: query
        })
        .then(() => {
          if (data.table === 'users') getUsers(app, passport);
        });
    } else {
      notify(io, 'failure');
    }
  });
}

module.exports = deleteData;
