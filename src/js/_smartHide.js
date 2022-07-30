const smartHide = (className, method, timeout) => {
  if (method === 'in') {
    $(className).toggleClass('hidden flex');

    $('.wrapper, .header').addClass('blur');
  } else {
    $(className).toggleClass('hidden flex');

    $('.wrapper, .header').removeClass('blur');

    if (timeout !== undefined) {
      clearTimeout(timeout);
    }
  }
}
