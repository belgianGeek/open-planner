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

      if (settings.sendmail !== $('.toggleMail__Input').prop('checked')) {
        updatedSettings.sendmail = globalSettings.sendmail = $('.toggleMail__Input').prop('checked');
      }

      if (settings.sendcc !== $('.toggleMailCc__Input').prop('checked')) {
        updatedSettings.sendcc = globalSettings.sendcc = $('.toggleMailCc__Input').prop('checked');
      }

      if (updatedSettings !== {}) {
        socket.emit('settings', updatedSettings);
      }
    }
  });
}

settings();
