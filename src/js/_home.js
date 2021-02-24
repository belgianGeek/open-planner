const handleHomeBtnClick = (element, parent) => {
  const showElt = elt => {
    if (elt === 'inRequests') {
      $(`.${elt}__step1`)
        .removeClass('hidden')
        .addClass('flex');
    }
  }
  $(`.home__${parent}__${element}`).click(() => {
    if (element === 'newRequest') {
      showElt('inRequests');
    }

    $('.home')
      .addClass('hidden')
      .removeClass('flex');

    $('.returnIcon, .header__container__msg')
      .removeClass('hidden');
  });
}

handleHomeBtnClick('newRequest', 'btnContainer');
