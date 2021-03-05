const register = () => {
  let registerTimeout;
  let username = $('.register__form__name input');
  let userFirstname = $('.register__form__userFirstName input');
  let password = $('.register__form__password input');
  let mail = $('.register__form__email input');

  $('.register__form__btnContainer__submit').click(event => {
    event.preventDefault();
    data2send.table = 'users';
    let gender = '';
    let location = $('.register__form__location option:selected').val();
    let type = $('.register__form__type option:selected').val();

    // Get the user gender
    $('.register__form__gender input.radio').each(function() {
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

    if (location === 'default') {
      invalid($('.register__form__location .input'));
    }

    if (password.val() === '') {
      invalid(password);
    }

    if (mail.is(':invalid') || mail.val() === '') {
      invalid(mail);
    }

    if (type === 'default') {
      invalid($('.register__form__type .input'));
    }

    if (gender === '') {
      invalid($('.register__form__gender input.radio'));
    }

    if (!validationErr) {
      const sendAccountInfo = () => {
        data2send.values.push(capitalizeFirstLetter(username.val()));
        data2send.values.push(capitalizeFirstLetter(userFirstname.val()));

        data2send.values.push(mail.val());

        data2send.values.push(location);
        data2send.values.push(gender);
        data2send.values.push(type);

        // Push the password last because it will be extracted on the server
        data2send.values.push(password.val());

        // Handle modifications and user adding differently based on the form title
        if (!$('.register').hasClass('absolute') || !$('.register__title').text().match('Modification')) {
          socket.emit('append data', data2send);
        } else {
          data2send.id = $('.register.absolute .register__form__userID').val();
          socket.emit('update', data2send);
        }

        data2send.values = [];

        $('.register')
          .removeAttr('style')
          .toggleClass('hidden flex');

        $('.register input').not('.radio').val('');

        if (window.location.pathname === '/') {
          confirmation();

          $('.users').removeClass('blur backgroundColor');

          $('.header__container__icon, .header__container__msg').toggleClass('hidden');
        }
      }

      $('.input').removeClass('invalid');
      $('form .warning').addClass('hidden');

      // Check the window.location.pathname variable to apply different actions based on the URL
      // because the register form can be on both the login page and the homepage

      if (window.location.pathname === '/') {
        confirmation();

        registerTimeout = setTimeout(function() {
          sendAccountInfo();
        }, 5000);
      } else {
        // Avoid timeout on the login page
        sendAccountInfo();
      }
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

socket.on('first user added', () => {
  // Bring the user back the login page to allow him to sign in
  window.location.reload();
});

register();
