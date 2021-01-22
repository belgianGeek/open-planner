const smartHide = (className, method, timeout) => {
  if (method === 'in') {
    $(className).toggleClass('hidden flex');

    $('.wrapper, .header').addClass('blur');
  } else {
    $(className).toggleClass('hidden flex');

    if ($('.inRequests').hasClass('absolute')) {
      $('.header').toggleClass('blur');
    } else {
      $('.wrapper, .header').toggleClass('blur');
    }

    if (timeout !== undefined) {
      clearTimeout(timeout);
    }
  }
}
