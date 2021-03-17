const env = require('dotenv').config();
const nodemailer = require('nodemailer');
const ejs = require('ejs');
const ip = require('ip');
const path = require('path');

async function mail(receiver, applicant, client) {
  let tempReceiverName;

  if (receiver.name !== undefined) {
    let tempReceiverName = receiver.name.split(',');
  }

  let htmlMsg = msg = '';

  const res = await client.query(`SELECT * FROM settings`);
  if (res.rowCount !== 0 && res.rowCount !== null) {

    let sender = smtpUsername = res.rows[0].smtp_user;
    let smtpPass = res.rows[0].smtp_passwd;

    msg = await ejs.renderFile(path.join(__dirname, '../views', 'mail.ejs'), {
      applicant: `${applicant.firstname} ${applicant.name.toUpperCase()}`,
      gender: receiver.gender,
      host: ip.address(),
      location: applicant.location,
      request: receiver.request.replace(/\'\'/g, "'"),
      sender: res.rows[0].sender
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

      mail.verify((err, success) => {
        if (!err) {
          let options = {
            from: `${res.rows[0].sender} <${sender}>`,
            to: receiver.mail,
            subject: "Une nouvelle demande a été introduite dans le tableau d'intervention",
            html: msg
          };

          mail.sendMail(options).catch(err => console.trace(err));
          console.log(`Mail envoyé à l'adresse ${receiver.mail} le ${new Date()}`);
        } else {
          console.trace('Il semble que les paramètres SMTP spécifiés soient incorrects : ' + err);
        }
      });
    }
    sendMail();
  } else {
    console.error(res.rowCount, res.rows);
  }
}

module.exports = mail;
