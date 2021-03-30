const dbConfig = () => {
  let instance = $('.dbConfig__form__name input');
  let location_name = $('.dbConfig__form__locationName input');
  let location_mail = $('.dbConfig__form__locationMail input');
  let sender = $('.dbConfig__form__senderLabel input');
  let smtp_user = $('.dbConfig__form__smtpUserLabel input');
  let smtp_host = $('.dbConfig__form__smtpHostLabel input');
  let smtp_passwd = $('.dbConfig__form__smtpPasswdLabel input');

  $('.dbConfig__form').submit(event => {
    event.preventDefault();

    socket.emit('append settings', {
      instance: instance.val(),
      location_name: location_name.val(),
      location_mail: location_mail.val(),
      sender: sender.val(),
      smtp_user: smtp_user.val(),
      smtp_host: smtp_host.val(),
      smtp_passwd: smtp_passwd.val()
    });
  });

  socket.on('settings import', success => {
    if (success) {
      $('.home__mainTitle').text(`${instance.val()} - Création du premier compte administrateur`);
      hideMenu('dbConfig');
      showMenu('register');
    }
  });

  if (window.location.pathname === '/login') {
    socket.emit('get locations');

    socket.on(`locations retrieved`, location => {
      const option = $('<option>')
        .val(location.location_id)
        .text(location.location_name);

      $('.register__form__location select').append(option);
    });
  }
}

dbConfig();
