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

    const res = await app.pool.query(`SELECT * FROM settings`);
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
        searchPageAccess: res.rows[0].allowsearchpageaccess,
        sender: res.rows[0].sender,
        status: mailObject.status,
        type: mailObject.type
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
              const cc = await app.pool.query(
                `SELECT email FROM users WHERE name ILIKE $1 AND firstname ILIKE $2`,
                [applicant.name, applicant.firstname]
              );
              options.cc = cc.rows[0].email;
            }

            mail.sendMail(options).catch(err => console.trace(err));
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
    data.mail.type = data.type;

    if (data.attachments !== undefined) {
      data.mail.attachments = data.attachments;
    }

    let receiver = {
      mail: '',
      request: ''
    };

    if (data.type !== 'deletion') {
      receiver.request = data.request;
      let applicant = data.applicant;

      DBquery(app, io, 'SELECT', 'users', {
          text: `SELECT
            u.user_id,
            u.name,
            u.firstname,
            u.email,
            u.location,
            u.gender,
            u.type,
            l.location_id,
            l.location_name,
            l.location_mail
          FROM users u LEFT JOIN locations l ON u.location = l.location_id`
        })
        .then(res => {
          receiver.mail = res.rows[0].location_mail;
          // Do not set the receiver gender
          mail(receiver, applicant, data.mail);
          notify(io, 'mail');
        });
    } else {
      data.table = 'tasks';
      let id = data.id;

      DBquery(app, io, 'SELECT', 'tasks', {
          text: `SELECT
          t.task_id,
          t.applicant_name,
          t.applicant_firstname,
          t.request_date,
          t.location_fk,
          t.user_fk,
          t.comment,
          t.status,
          t.attachment,
          t.attachment_src,
          l.location_name
          FROM tasks t
          LEFT JOIN locations l ON t.location_fk = l.location_id
          WHERE t.task_id = $1`,
          values: [data.id]
        })
        .then(res => {
          receiver.request = res.rows[0].comment;
          data.mail.creationDate = res.rows[0].request_date;
          data.mail.id = res.rows[0].task_id;
          data.mail.status = res.rows[0].status;
          data.mail.title = `🗑 La demande n°${res.rows[0].task_id} a été supprimée 🗑`;

          let applicant = {
            name: res.rows[0].applicant_name,
            firstname: res.rows[0].applicant_firstname,
            location: res.rows[0].location_name
          };

          DBquery(app, io, 'SELECT', 'users', {
              text: `SELECT
                u.user_id,
                u.name,
                u.firstname,
                u.email,
                u.location,
                u.gender,
                u.type,
                l.location_id,
                l.location_name,
                l.location_mail
              FROM users u LEFT JOIN locations l ON u.location = l.location_id`
            })
            .then(res => {
              receiver.mail = res.rows[0].location_mail;
              // Do not set the receiver gender
              mail(receiver, applicant, data.mail);
              notify(io, 'mail');
            })
            .then(() => {
              // Only delete the record after the mail notification was sent
              query = {
                text: `DELETE FROM ${data.table} WHERE task_id = $1`,
                values: [id]
              };

              DBquery(app, io, 'SELECT', 'tasks', query);
            });
        })
    };
  });
}

module.exports = mail;
