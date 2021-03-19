const settings = () => {
  const toggleSwitch = (input, slider, check = true) => {
    if (check) {
      $(input).prop('checked', true);
      $(slider)
        .removeClass('unchecked')
        .addClass('checked');
    } else {
      $(input).prop('checked', false);
      $(slider)
        .removeClass('checked')
        .addClass('unchecked');
    }
  }

  // Get settings from the server-side
  socket.on('settings', settings => {
    // Update the global object with the retrieved settings
    globalSettings = settings;
    if (settings.sendcc) {
      toggleSwitch('.toggleMailCc__Input', '.toggleMailCc__Slider', true);
    } else {
      toggleSwitch('.toggleMailCc__Input', '.toggleMailCc__Slider', false);
    }

    if (settings.sendmail) {
      toggleSwitch('.toggleMail__Input', '.toggleMail__Slider', true);
    } else {
      toggleSwitch('.toggleMail__Input', '.toggleMail__Slider', false);
    }
  });

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

      socket.emit('settings', updatedSettings);
    }
  });
}

settings();
