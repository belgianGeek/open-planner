const cors = require('cors');

module.exports = function(app) {
  app.post('/user/:id', (req, res) => {

    let query = {
      name: 'user-detail',
      text: `SELECT firstname, name, mail, location, gender, type FROM users WHERE user_id = ${req.params.id}`
    };

    app.pool.query(query)
      .then(userDetails => {
        console.log(userDetails.rows);
      })
      .catch(err => console.log(err));
  });
}
