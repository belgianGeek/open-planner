// Websocket connection
const socket = io();

let data2send = {
  table: '',
  values: [],
  authorFirstName: true
};

let inRequestsReaderGender;

const capitalizeFirstLetter = string => string.charAt(0).toUpperCase() + string.slice(1);

// Check if all the fomr fields are fullfilled before submit
let validationErr = false;

const handleSimpleStep = (element, step1, step2, btn) => {
  $(`${element}__${step1}__${btn}`).click(() => {
    if (!validationErr) {
      $(`${element}__${step1}`).toggleClass('translateXbackwards hidden flex');

      // Empty all inpout fields to prevent errors while sending the notification email
      // if no change is made to the list (if so, the reader's gender is undefined)
      if (`${element}__${step1}` === '.inRequests__step3') {
        $('.inRequests__step4 input').val('');
      }

      $(`${element}__${step2}`)
        .removeClass('translateXonwards hidden')
        .toggleClass('fixed flex');

    }
  });
}

handleSimpleStep('.inRequests', 'step1', 'step2', 'confirmation');

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

    // Remove the 'followRequest' and 'newRequest' class to show the right step to the user
    $('.requestTypeChoice').removeClass('newRequest');
  }

  const goBack = (elt1, elt2) => {
    if (elt1.match(/(step1)/gi)) {
      if ($(elt1).is(':visible') && !elt1.match(/inRequests__step1/gi)) {
        backHome(elt1);
      } else if ($(elt1).is(':visible') && elt1.match(/inRequests/gi)) {
        $(elt1)
          .removeClass('translateXbackwards translateXonwards flex')
          .addClass('hidden');

        // if ($('.requestTypeChoice').hasClass('newRequest')) {
        //   $('.requestTypeChoice')
        //     .addClass('flex')
        //     .removeClass('hidden')
        // }
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

  goBack('.inReturns__step1');
  goBack('.addReader__step1');
  goBack('.inRequests__step1');

  // goBack('.outRequests__step1', '.requestTypeChoice');
  // goBack('.inRequests__step1', '.requestTypeChoice');
  // goBack('.outRequests__step2', '.outRequests__step1');
  // goBack('.outRequests__step3', '.outRequests__step2');
  // goBack('.outRequests__step4', '.outRequests__step3');
  // goBack('.inRequests__step2', '.inRequests__step1');
  // goBack('.inRequests__step4', '.inRequests__step3');
  // goBack('.inReturns__step2', '.inReturns__step1');
  // goBack('.inReturns__step3', '.inReturns__step2');
  // goBack('.outReturns__step2', '.outReturns__step1');
  // goBack('.outReturns__step3', '.outReturns__step2');
});

$('.menu__item').click(() => {
  // Hide the sidebar on item click if it is currently shown
  if ($('.header__menu__switch').prop('checked')) {
    $('.header__menu__switch').prop('checked', false);
  }
});
