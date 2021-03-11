let addLocationTimeout;
const manageLocations = () => {
  $('.addLocation__form__btnContainer__submit').click(() => {
    event.preventDefault();
    data2send.table = 'locations';
    let name = $('.addLocation__form__name input');
    let mail = $('.addLocation__form__email input');

    if (name.val() === '') {
      invalid(name);
    }

    if (mail.is(':invalid') || mail.val() === '') {
      invalid(mail);
    }

    if (!validationErr) {
      const sendAccountInfo = () => {
        data2send.values.push(capitalizeFirstLetter(name.val()))
        data2send.values.push(mail.val());

        // Handle modifications and user adding differently based on the form title
        if (!$('.addLocation__title').text().match('Modification')) {
          socket.emit('append data', data2send);
        } else {
          data2send.id = $('.addLocation.absolute .addLocation__form__userID').val();
          socket.emit('update', data2send);
        }

        data2send.values = [];

        $('.addLocation')
          .removeAttr('style')
          .toggleClass('hidden flex');

        $('.addLocation input').val('');

        confirmation();

        $('.locations').removeClass('blur backgroundColor');

        $('.header__container__icon, .header__container__msg').toggleClass('hidden');
      }

      $('.input').removeClass('invalid');
      $('form .warning').addClass('hidden');

      confirmation();

      addLocationTimeout = setTimeout(function() {
        sendAccountInfo();
      }, 5000);
    } else {
      if (!$('form .warning').length) {
        let warning = $('<span></span>')
          .addClass('warning')
          .text('Certains champs sont incorrects...')
          .appendTo('.addLocation__form');
      };

      validationErr = false;
      data2send.values = [];
    }
  });

  $('.addLocation__form__btnContainer__reset').click(() => {
    $('.input').removeClass('invalid');
    $('form .warning').hide();
    validationErr = false;
    data2send.values = [];
  });

  $('.confirmation__body__cancel').click(() => {
    clearTimeout(addLocationTimeout);
  });
}

manageLocations();
