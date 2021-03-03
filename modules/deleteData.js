const deleteData = (app, passport, io, id) => {
  const DBquery = require('./DBquery');
  const getUsers = require('./getUsers');


  io.on('delete data', data => {
    if (data.key !== undefined) {
      query = `DELETE FROM ${data.table} WHERE ${id} = '${data.key}'`;

      DBquery(app, io, 'DELETE FROM', data.table, {
          text: query
        })
        .then(() => getUsers(app, passport));
    }
  });
}

module.exports = deleteData;
