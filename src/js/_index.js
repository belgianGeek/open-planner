// Websocket connection
const socket = io();

let data2send = {
  table: '',
  values: []
};

let inRequestsReaderGender;

const capitalizeFirstLetter = string => string.charAt(0).toUpperCase() + string.slice(1);

// Check if all the fomr fields are fullfilled before submit
let validationErr = false;

$('.returnIcon').click(() => {
  const backHome = step => {
    $(step)
      .removeClass('translateXbackwards')
      .toggleClass('translateXonwards hidden');
    $('.home').toggleClass('hidden flex');
    $('.returnIcon, .header__container__msg')
      .addClass('hidden')
      .removeClass('flex');

    setTimeout(() => {
      $(step).toggleClass('translateXonwards flex');
    }, 500);
  }

  const goBack = (elt1, elt2) => {
    if (elt1.match(/(step1|users)/gi)) {
      if ($(elt1).is(':visible') && elt1.match(/inRequests__step1|users/gi)) {
        backHome(elt1);
      }
    } else {
      if ($(elt1).is(':visible')) {
        $(elt1)
          .addClass('translateXonwards hidden')
          .removeClass('flex');

        $(elt2)
          .removeClass('translateXbackwards hidden')
          .addClass('flex');
      }
    }
  }

  goBack('.users');
  goBack('.inRequests__step1');
});

$('.menu__item').click(() => {
  // Hide the sidebar on item click if it is currently shown
  if ($('.header__menu__switch').prop('checked')) {
    $('.header__menu__switch').prop('checked', false);
  }
});
