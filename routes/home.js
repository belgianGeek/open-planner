const appendData = require('../modules/appendData');
const bcrypt = require('bcrypt');
const check4updates = require('../modules/check4updates');
const checkAuth = require('../modules/checkAuth');
const cors = require('cors');
const deleteData = require('../modules/deleteData');
const DBquery = require('../modules/DBquery');
const exportDB = require('../modules/exportDB');
const emptyDir = require('../modules/emptyDir');
const fs = require('fs-extra');
const getSettings = require('../modules/getSettings');
const getUsers = require('../modules/getUsers');
const mail = require('../modules/mail');
const notify = require('../modules/notify');
const path = require('path');
const passport = require('passport');
const updateSession = require('../modules/updateSession');
const updateTask = require('../modules/updateTask');

module.exports = function(app) {
  app.get('/locations', async (req, res) => {
      const locations = await app.pool.query('SELECT location_id,location_name FROM locations');
      res.send(locations.rows);
    });
}
