const handleHomeBtnClick = (element, parent) => {
  const showElt = elt => {
    // $('.requestTypeChoice')
    //   .addClass('hidden')
    //   .removeClass('flex');

    if (elt === 'inRequests') {
      $(`.${elt}__step1`)
        .removeClass('hidden')
        .addClass('flex');
    } /*else if (elt === 'loan' && $('.requestTypeChoice').hasClass('newRequest')) {*/
    //   $(`.inRequests__step1`)
    //     .removeClass('hidden')
    //     .addClass('flex');
    // } else if (elt === 'borrowing' && $('.requestTypeChoice').hasClass('newRequest')) {
    //   $(`.outRequests__step1`)
    //     .removeClass('hidden')
    //     .addClass('flex');
    // }
  }
  $(`.home__${parent}__${element}`).click(() => {
    if (element === 'newRequest') {
      // $('.requestTypeChoice')
      //   // Add a class to the .requestTypeChoice div to show the right step to the user
      //   .addClass(`${element} flex`)
      //   .removeClass('hidden')

      // $('.requestTypeChoice__btnContainer__loan').click(() => {
      //   // Reset the checkbox state
      //   $('.inRequests__form__pibInfo__outProvince').prop('checked', false);

        showElt('inRequests');
      // });

      // $('.requestTypeChoice__btnContainer__borrowing').click(() => {
      //   showElt('borrowing');
      // });
    } /* else if (element === 'followRequest') { */
    //   $(`.inRequests__step3`)
    //     .removeClass('hidden')
    //     .addClass('flex')
    // } else if (element === 'outReturns') {
    //   $(`.outReturns__step1`)
    //     .removeClass('hidden')
    //     .addClass('flex')
    // } else if (element === 'inReturns') {
    //   $(`.inReturns__step1`)
    //     .removeClass('hidden')
    //     .addClass('flex')
    // }

    $('.home')
      .addClass('hidden')
      .removeClass('flex');

    $('.returnIcon, .header__container__msg')
      .removeClass('hidden');
  });
}

handleHomeBtnClick('newRequest', 'btnContainer');
// handleHomeBtnClick('followRequest', 'btnContainer');
// handleHomeBtnClick('inReturns', 'btnContainer');
// handleHomeBtnClick('outReturns', 'btnContainer');
