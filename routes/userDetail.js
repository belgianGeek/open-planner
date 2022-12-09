const cors = require('cors');

module.exports = function(app) {
  app.get('/user/:id', (req, res) => {
    console.log(req.params);

    let query = {
      name: 'user-detail',
      text: `SELECT firstname, name, email, location, gender, type FROM users WHERE user_id = ${req.params.id}`
    };

    app.pool.query(query)
      .then(userDetails => {
        console.log(userDetails.rows);
        res.send(userDetails.rows)
      })
      .catch(err => console.log(err));
  });
}
