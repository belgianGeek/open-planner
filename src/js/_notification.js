socket.on('notification', notification => {
  if (notification.type === 'success') {
    $('.notification__icon').attr('src', './src/scss/icons/thumbs-up.svg');
    $('.notification')
      .removeClass('notificationInfo notificationMail notificationFailure')
      .addClass('notificationSuccess');
    $('.notification__msg').text('Changements enregistrés avec succès ! 😉');
  } else if (notification.type === 'error') {
    $('.notification__icon').attr('src', './src/scss/icons/error.svg');
    $('.notification')
      .removeClass('notificationInfo notificationMail notificationSuccess')
      .addClass('notificationFailure');
    $('.notification__msg').text('Une erreur s\'est produite... 😱');
  } else if (notification.type === 'info') {
    $('.notification__icon').attr('src', './src/scss/icons/info.svg');
    $('.notification')
      .removeClass('notificationSuccess notificationMail notificationFailure')
      .addClass('notificationInfo');
    $('.notification__msg').text('Aucune donnée correspondante n\'a été trouvée... 😶');
  } else if (notification.type === 'mail') {
    $('.notification__icon').attr('src', './src/scss/icons/mail.svg');
    $('.notification')
      .removeClass('notificationInfo notificationSuccess notificationFailure')
      .addClass('notificationMail');
    $('.notification__msg').text('Mail envoyé au lecteur 😎');
  } else if (notification.type === 'barcode') {
    $('.notification__icon').attr('src', './src/scss/icons/error.svg');
    $('.notification')
      .removeClass('notificationInfo notificationSuccess notificationFailure')
      .addClass('notificationFailure');
    $('.notification__msg').text('Plus aucun code-barres n\'est disponible... 😶');

    // Empty all the barcode-related fields to prevent duplicate addings
    $('.inRequests__barcode__svg').remove();
    $('.inRequests__form__docInfo__inv').val('');
  }

  $('.notification')
    .removeClass('hidden')
    .addClass('flex');

  setTimeout(() => {
    $('.notification')
      .fadeOut(function() {
        $(this)
          .removeAttr('style')
          .removeClass('notificationSuccess notificationFailure notificationInfo flex')
          .addClass('hidden');
      });
  }, 5000);
});
