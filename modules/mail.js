const env = require('dotenv').config();
const nodemailer = require('nodemailer');
const process = require('process');

const mail = (receiver, client) => {
  let sender = smtpUsername = process.env.MAIL_SENDER;
  let tempReceiverName = receiver.name.split(',');

  let smtpPass = process.env.SMTP_PASSWD;

  let htmlMsg = '';

  client.query(`SELECT mail_content FROM settings`)
    // .then(res => console.log(res.rows[0].mail_content.replace(/\%TITLE\%/g, receiver.request)))
    .catch(err => console.error(`Impossible de récupérer le contenu de l'email automatique à envoyer au lecteur : ${err}`));

  // Plain text message
  let msg = [`Le livre "${receiver.request}", que vous aviez demandé est à votre disposition à la bibliothèque pendant 10 jours. Une fois ce délai écoulé, nous nous réservons le droit de le renvoyer dans sa bibliothèque d'origine.`, 'À bientôt,', 'Cordialement,', `Le Grimoire d'Éole`];

  const handleUnknownGender = () => msg.unshift(`Bonjour Madame/Monsieur ${tempReceiverName[0].trim()},`);

  if (receiver.gender !== undefined) {
    if (receiver.gender.match('f')) {
      msg.unshift(`Bonjour Madame ${tempReceiverName[0].trim()},`);
    } else if (receiver.gender.match('m')) {
      msg.unshift(`Bonjour Monsieur ${tempReceiverName[0].trim()},`);
    } else {
      handleUnknownGender();
    }
  } else {
    handleUnknownGender();
  }

  // Convert the message to the HTML format
  for (const sentence of msg) {
    htmlMsg += `<p>${sentence}</p>`;
  }

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
      from: `Grimoire d'Éole <${sender}>`,
      to: receiver.mail,
      subject: "PIB",
      text: msg.join('\n\n'),
      html: `<article>${htmlMsg}</article>`
    };

    mail.sendMail(options).catch(console.error);
    console.log(`Mail envoyé à l'adresse ${receiver.mail} le ${new Date()}`);
  }
  sendMail();
}

module.exports = mail;
