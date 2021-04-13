const register = () => {
  let registerTimeout;
  let username = $('.register__form__name input');
  let userFirstname = $('.register__form__userFirstName input');
  let password = $('.register__form__password input');
  let mail = $('.register__form__email input');

  $('.register__form__btnContainer__submit').click(event => {
    event.preventDefault();
    data2send.table = 'users';
    data2send.setType = false;
    let gender = '';
    let location = $('.register__form__location option:selected').val();
    let type;

    if ($('.register__form__type').length) {
      type = $('.register__form__type option:selected').val();
    }

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

    // Make the password field not required if a user is being updated
    if (!$('.register').hasClass('absolute') || $('.register__title').hasClass('addUserTitle')) {
      if (password.val() === '') {
        invalid(password);
      }
    }

    if (mail.is(':invalid') || mail.val() === '') {
      invalid(mail);
    }

    if ($('.register__form__type').length) {
      data2send.setType = true;
      if (type === 'default') {
        invalid($('.register__form__type .input'));
      }
    }

    if (gender === '') {
      invalid($('.register__form__gender input.radio'));
    }

    if (!validationErr) {
      const sendAccountInfo = () => {
        data2send.values = [
          capitalizeFirstLetter(username.val()),
          capitalizeFirstLetter(userFirstname.val()),
          mail.val(),
          location,
          gender
        ];

        if ($('.register__form__type').length) {
          data2send.values.push(type);
        }

        data2send.setPassword = true;

        // Push the password last because it will be extracted on the server

        // Handle modifications and user adding differently based on the form title class
        if ($('.register__title').hasClass('addUserTitle')) {
          data2send.values.push(password.val());
          socket.emit('append data', data2send);
        } else {
          data2send.id = $('.register.absolute .register__form__userID').val();

          if (password.val() !== '') {
            data2send.setPassword = true;
            data2send.values.push(password.val());
          } else {
            data2send.setPassword = false;
          }

          socket.emit('update', data2send);

          // Reset the password field placeholder
          password.attr('placeholder', 'Insérez le mot magique');
        }

        // Remove the 'blur' class if the user submit the 'my account' form
        if ($('.register__title').hasClass('myAccountTitle')) {
          $('.register').toggleClass('blur');
        } else {
          // Do not empty the input fields in the 'My account' form
          $('.register input').not('.radio').val('');
        }

        $('.register').toggleClass('hidden flex');

        if (window.location.pathname === '/') {
          confirmation();

          data2send.values = [];
          clearRegisterTitleClasses();
        }
      }

      $('.input').removeClass('invalid');
      $('form .warning').addClass('hidden');

      // Check the window.location.pathname variable to apply different actions based on the URL
      // because the register form can be on both the login page and the homepage

      if (window.location.pathname === '/') {
        confirmation();

        // Blur the form when the user submit the 'my account' form
        if ($('.register__title').hasClass('myAccountTitle')) {
          $('.register').toggleClass('blur');
        }

        registerTimeout = setTimeout(function() {
          sendAccountInfo();
          $('.users, .wrapper').removeClass('blur backgroundColor');
        }, 5000);
      } else {
        // Avoid timeout on the login page
        sendAccountInfo();

        // Reload the page to show the login portal
        setTimeout(() => {
          window.location.reload();
        }, 500);
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

    if ($('.register').hasClass('absolute')) {
      $('.wrapper').addClass('blur');

      if ($('.register__title').hasClass('myAccountTitle')) {
        $('.register').removeClass('blur');
      }
    }
  });
}

register();
