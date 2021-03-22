const settings = () => {
  // Show settings on btn click
  $('.settingsLink').click(() => {
    $('.settings__container').toggleClass('hidden flex');
    $('.wrapper').addClass('blur');
  });

  $('.settings__container').click(function(e) {
    if (e.target === this) {
      let updatedSettings = {};
      $(this).toggleClass('hidden flex');
      $('.wrapper').removeClass('blur');

      if (globalSettings.sendmail !== $('.toggleMail__Input').prop('checked')) {
        updatedSettings.sendmail = globalSettings.sendmail = $('.toggleMail__Input').prop('checked');
      }

      if (globalSettings.sendcc !== $('.toggleMailCc__Input').prop('checked')) {
        updatedSettings.sendcc = globalSettings.sendcc = $('.toggleMailCc__Input').prop('checked');
      }

      if (globalSettings.sender !== $('.settings__child__senderContainer__senderLabel__input').val()) {
        updatedSettings.sender = globalSettings.sender = $('.settings__child__senderContainer__senderLabel__input').val();
      }

      if (globalSettings.smtp_host !== $('.settings__child__mailContainer__smtpHostLabel__input').val()) {
        updatedSettings.smtp_host = globalSettings.smtp_host = $('.settings__child__mailContainer__smtpHostLabel__input').val();
      }

      if (globalSettings.smtp_user !== $('.settings__child__mailContainer__smtpUserLabel__input').val()) {
        updatedSettings.smtp_user = globalSettings.smtp_user = $('.settings__child__mailContainer__smtpUserLabel__input').val();
      }

      if ($('.settings__child__mailContainer__smtpPasswdLabel__input').val() !== '') {
        updatedSettings.smtp_passwd = $('.settings__child__mailContainer__smtpPasswdLabel__input').val();
      }

      if (updatedSettings !== {}) {
        socket.emit('settings', updatedSettings);
      }
    }
  });
}

settings();
