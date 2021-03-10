const deleteData = (app, io, id, data, passport) => {
  const DBquery = require('./DBquery');
  const getUsers = require('./getUsers');

  DBquery(app, io, 'DELETE FROM', data.table, {
      text: `DELETE FROM ${data.table} WHERE ${id} = '${data.key}'`
    })
    .then(() => {
      if (data.table === 'users') {
        getUsers(app, passport);
      }
    });
}

module.exports = deleteData;
