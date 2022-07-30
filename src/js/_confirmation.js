const confirmation = () => {
  $('.confirmation').toggleClass('hidden flex');

  $('.wrapper *').removeClass('translateXbackwards');
}

$('.confirmation__body__cancel').click(() => {
  smartHide('.confirmation', 'out');
});
