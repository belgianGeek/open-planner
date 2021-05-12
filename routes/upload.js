module.exports = function(app, io) {
  const bcrypt = require('bcrypt');
  const fs = require('fs-extra');
  const getUsers = require('../modules/getUsers');
  const multer = require('multer');
  const notify = require('../modules/notify');
  const passport = require('passport');
  const upload = multer({
    dest: 'tmp/'
  }).single('dataUpload');

  app.post('/upload', (req, res) => {
    upload(req, res, err => {
      if (err) {
        if (err instanceof multer.MulterError) {
          console.log(`A Multer error occurred while uploading your data : ${err}`);
        } else {
          console.log(`An unknown error occurred while uploading your data : ${err}`);
        }
      } else {
        // Read the file and add the imported users to the DB
        fs.readFile(req.file.path, 'utf-8', async (err, data) => {
          const rows = data.split('\r\n');
          let usersNb = 0;
          // Set the iterator to 1 to avoid processing the file header
          for (let i = 1; i < rows.length; i++) {
            // Avoid empty rows
            if (rows[i] !== '') {
              const row = rows[i].split(',');

              // Do not import incomplete users
              if (row.length === 6) {
                app.pool.query({
                    text: `INSERT INTO users(name, firstname, email, gender, password, type) VALUES($1, $2, $3, $4, $5, $6) RETURNING *`,
                    values: [row[0].trim(), row[1].trim(), row[2].trim(), row[3].trim(), await bcrypt.hash(row[4].trim(), 10), row[5].trim()]
                  })
                  .then(async res => {
                    usersNb++;
                    notify(io, 'success', true, usersNb);
                    getUsers(app, passport);

                    const users = await app.pool.query(`SELECT * FROM users LEFT JOIN locations ON users.location = locations.location_id ORDER BY name`);
                    io.emit('users retrieved', users.rows);
                  })
                  .catch(err => {
                    console.log(err);
                    notify(io, 'failure', true, error = err);
                  });
              }
            } else if (rows[i] === '') {
              notify(io, 'success', true, 0);
            }
          }
        });
      }
    });
  });
};
