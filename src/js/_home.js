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

const hideMenu = classname => {
  if (!$(`.${classname}`).hasClass('hidden')) {
    $(`.${classname}`)
      .removeClass('flex')
      .addClass('hidden');
  }
}

const showMenu = classname => {
  if ($(`.${classname}`).hasClass('hidden')) {
    $(`.${classname}`)
      .removeClass('hidden')
      .addClass('flex');
  }
}

handleHomeBtnClick('newRequest', 'btnContainer');
