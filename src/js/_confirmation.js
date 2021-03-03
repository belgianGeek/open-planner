const confirmation = () => {
  $('.confirmation').toggleClass('hidden flex');

  if ($('.inRequests').hasClass('absolute')) {
    $('.header, .draft').toggleClass('blur');
  } else {
    $('.wrapper, .header, .draft').toggleClass('blur');
  }

  $('.wrapper *').removeClass('translateXbackwards');
}

$('.confirmation__body__cancel').click(() => {
  smartHide('.confirmation', 'out');
});
