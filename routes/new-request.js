const cors = require('cors');

module.exports = function(app) {
  app.post('/new-request', (req, res) => {
    let escapedValues = [];
    let queryValues = [];
    let iReq = 1;

    for (const value in req.body) {
      if (req.body.hasOwnProperty(value)) {
        queryValues.push(req.body[value]);
        escapedValues.push(`$${iReq},`);
        iReq++;
      }
    }

    let query = {
      name: 'add-request',
      text: `INSERT INTO tasks(${Object.keys(req.body).toString()}) VALUES(${escapedValues.join(' ').replace(/,$/, '')})`,
      values: queryValues
    };

    app.pool.query(query)
      .then(() => {
        res.send('Request successfull');
      })
      .catch(err => console.log(err));
  });
}
