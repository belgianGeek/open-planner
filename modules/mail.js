const env = require('dotenv').config();
const nodemailer = require('nodemailer');
const process = require('process');
const ejs = require('ejs');
const ip = require('ip');
const path = require('path');

async function mail(receiver, applicant, client) {
  let sender = smtpUsername = process.env.MAIL_SENDER;
  let tempReceiverName;

  if (receiver.name !== undefined) {
    let tempReceiverName = receiver.name.split(',');
  }

  let smtpPass = process.env.SMTP_PASSWD;

  let htmlMsg = msg = '';

  const res = await client.query(`SELECT * FROM settings`);
    // .then(res => {
      if (res.rowCount !== 0 && res.rowCount !== null) {
        // let matches = {
        //   "\'\'": "\'",
        //   '%REQUEST%': receiver.request,
        //   '%SENDER%': res.rows[0].sender,
        //   '%APPLICANT%': ,
        //   '%LOCATION%': applicant.location
        // };

        msg = await ejs.renderFile(path.join(__dirname, '../views', 'mail.ejs'), {
          applicant: `${applicant.firstname} ${applicant.name.toUpperCase()}`,
          gender: receiver.gender,
          host: ip.address(),
          location: applicant.location,
          request: receiver.request.replace(/\'\'/g, "'"),
          sender: res.rows[0].sender
        })

        // msg = res.rows[0].mail_content.replace(/\'\'|%REQUEST%|%SENDER%|%APPLICANT%|%LOCATION%/g, matched => matches[matched]).split('\n');

        // Convert the message to the HTML format
        // for (const sentence of msg) {
        //   if (sentence !== '') htmlMsg += `<p>${sentence}</p>`;
        // }

        const sendMail = () => {
          // Create and send the mail
          let mail = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: 587,
            secure: false,
            auth: {
              user: smtpUsername,
              pass: smtpPass
            }
          });

          let options = {
            from: `${process.env.SENDER} <${sender}>`,
            to: receiver.mail,
            subject: "Une nouvelle demande a été introduite dans le tableau d'intervention",
            // text: msg.join('\n\n'),
            // html: `<article>${htmlMsg}</article>`
            html: msg
          };

          mail.sendMail(options).catch(err => console.error(err));
          console.log(`Mail envoyé à l'adresse ${receiver.mail} le ${new Date()}`);
        }
        sendMail();
      } else {
        console.error(res.rowCount, res.rows);
      }
    // })
    // .catch(err => console.error(`Impossible de récupérer le contenu de l'email automatique à envoyer au demandeur : ${err}`));
}

module.exports = mail;
