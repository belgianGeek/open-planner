const passport = require('passport');

module.exports = function(app, ws) {
  app.ws('/login', async (req, res, next) => {
    ws.on('connection', ws => {
      passport.authenticate("local", (err, user, info) => {
        if (err) {
          return next(err);
        }

        if (!user) {
          // return res.send({
          //   user: user,
          //   info: info
          // });

          ws.send('connection', {
            user: user,
            info: info
          });
        }

        req.login(user, err => {
          if (err || !user) {
            console.trace(err);
          } else if (user !== undefined) {
            // res.send({
            //   user: user,
            //   message: "Logged in"
            // });

            ws.send('connection successfull', {
              user: user,
              message: "Logged in"
            })
          } else {
            console.trace('The user variable is undefined...');
          }
        });
      })(req, res, next);
    });

    // app.ws('/login', async (ws, req) => {
    //   console.log('/login route matched');
    //   ws.on('message', async function(msg) {
    //       // What was the message?
    //       console.log(msg);
    //       // Send back some data
    //       ws.send(JSON.stringify({
    //           "append" : true,
    //           "returnText" : "I am using websockets!"
    //       }));
    //   });
    // });
  });
};
