$('.accountLink').click(() => {
  $('.register__title')
    .text('Mon compte')
    .addClass('myAccountTitle');

  $('.wrapper').addClass('blur');

  $('.register')
    .addClass('absolute flex')
    .removeClass('hidden');

  $(`.register.absolute .register__form__btnContainer__hide`).click(function() {
    $(`.register.absolute`)
      .removeClass('absolute zero flex')
      .addClass('hidden');

    $(`.wrapper`).removeClass('blur');

    // Hide the button to hide the form
    $(this).addClass('hidden');
  });
});
