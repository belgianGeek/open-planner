const mail = (app, io) => {
  const nodemailer = require('nodemailer');
  const DBquery = require('./DBquery');
  const ejs = require('ejs');
  const ip = require('ip');
  const notify = require('./notify');
  const path = require('path');

  async function mail(receiver, applicant, mailObject) {
    let tempReceiverName;

    if (receiver.name !== undefined) {
      let tempReceiverName = receiver.name.split(',');
    }

    let htmlMsg = msg = '';

    const res = await app.client.query(`SELECT * FROM settings`);
    if (res.rowCount !== 0 && res.rowCount !== null) {

      let sender = smtpUsername = res.rows[0].smtp_user;
      let smtpPass = res.rows[0].smtp_passwd;

      msg = await ejs.renderFile(path.join(__dirname, '../views', 'mail.ejs'), {
        applicant: `${applicant.firstname} ${applicant.name.toUpperCase()}`,
        date: mailObject.creationDate,
        gender: receiver.gender,
        host: ip.address(),
        id: mailObject.id,
        location: applicant.location,
        request: receiver.request.replace(/\'\'/g, "'"),
        sender: res.rows[0].sender,
        status: mailObject.status
      });

      const sendMail = () => {
        // Create and send the mail
        let mail = nodemailer.createTransport({
          host: res.rows[0].smtp_host,
          port: 587,
          secure: false,
          auth: {
            user: smtpUsername,
            pass: smtpPass
          }
        });

        mail.verify(async (err, success) => {
          if (!err) {
            let options = {
              from: `${res.rows[0].sender} <${sender}>`,
              to: receiver.mail,
              subject: mailObject.title,
              html: msg
            };

            // Handle attachments
            if (mailObject.attachments !== undefined) {
              options.attachments = mailObject.attachments;
            }

            // Send a copy of the request to the applicant
            if (mailObject.sendcc) {
              const cc = await app.client.query(`SELECT email FROM users WHERE name ILIKE '${applicant.name}' AND firstname ILIKE '${applicant.firstname}'`);
              options.cc = cc.rows[0].email;
            }

            mail.sendMail(options).catch(err => console.trace(err));

            if (!mailObject.sendcc) {
              console.log(`Mail envoyé à l'adresse ${receiver.mail} le ${new Date()}`);
            } else {
              console.log(`Mail envoyé aux adresses ${receiver.mail} et ${options.cc} le ${new Date()}`);
            }
          } else {
            console.trace('Il semble que les paramètres SMTP spécifiés soient incorrects : ' + err);
          }
        });
      }
      sendMail();
    } else {
      console.trace(res.rowCount, res.rows);
    }
  }

  io.on('send mail', data => {
    data.mail.sendcc = data.sendcc;

    if (data.attachments !== undefined) {
      data.mail.attachments = data.attachments;
    }

    let receiver = {
      mail: '',
      request: data.request
    };

    let applicant = data.applicant;

    DBquery(app, io, 'SELECT', 'users', {
        text: `SELECT * FROM users INNER JOIN locations ON users.location = locations.location_id`
      })
      .then(res => {
        receiver.mail = res.rows[0].location_mail;
        // Do not set the receiver gender
        mail(receiver, applicant, data.mail);
        notify(io, 'mail');
      });
  });
}

module.exports = mail;
