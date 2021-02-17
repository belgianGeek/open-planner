const register = () => {
  let registerTimeout;
  let username = $('.register__form__username input');
  let userFirstname = $('.register__form__userFirstName input');
  let location = $('.register__form__location option:selected').val();
  let password = $('.register__form__password input');
  let mail = $('.register__form__email input');
  let gender = '';

  $('.register__form__btnContainer__submit').click(event => {
    event.preventDefault();
    data2send.table = 'users';
    // Déterminer le genre du lecteur
    $('.register__form input.radio').each(function() {
      if ($(this).is(':checked')) {
        gender = $(this).val();
      }
    });
    if (username.val() === '') {
      invalid(username);
    }
    if (userFirstname.val() === '') {
      invalid(userFirstname);
    }

    if (password.val() === '') {
      invalid(password);
    }

    if (mail.is(':invalid') || mail.val() === '') {
      invalid(mail);
    }

    if (!validationErr) {
      $('.input').removeClass('invalid');
      $('form .warning').hide();
      confirmation();

      registerTimeout = setTimeout(function() {
        data2send.values.push(capitalizeFirstLetter(username.val()));
        data2send.values.push(capitalizeFirstLetter(userFirstname.val()));

        if (mail.val() !== '') {
          data2send.values.push(mail.val());
        }

        data2send.values.push(location);
        data2send.values.push(gender);
        data2send.values.push(password.val());

        socket.emit('append data', data2send);
        data2send.values = [];
        $('.register')
          .removeAttr('style')
          .toggleClass('hidden flex');
        confirmation();
        $('.home').toggleClass('hidden flex');
        $('.header__container__icon, .header__container__msg').toggleClass('hidden');
        $('.register input').not('.radio').val('');
      }, 5000);
    } else {
      if (!$('form .warning').length) {
        let warning = $('<span></span>')
          .addClass('warning')
          .text('Certains champs sont incorrects...')
          .appendTo('.register__form');
      };
      validationErr = false;
      data2send.values = [];
    }
  });

  $('.register__form__btnContainer__reset').click(() => {
    $('.input').removeClass('invalid');
    $('form .warning').hide();
    validationErr = false;
    data2send.values = [];
  });

  $('.confirmation__body__cancel').click(() => {
    clearTimeout(registerTimeout);
  });
}

$('.registerLink').click(() => {
  $('.home, .returnIcon, .header__container__msg, .register').toggleClass('hidden flex');
  register();
});
