const showAbout = () => {
  $('.aboutLink').click(() => {
    $('.wrapper, header').toggleClass('blur');
    $('.about__container').toggleClass('hidden flex');
  });

  $('.updateBtn').click(() => {
    socket.emit('update check');
  });

  socket.on('update progress', msg => {
    $('.updateBtn').text(msg);
  });

  // Hide the "About" page on parent click
  $('.about__container').click(function(e) {
    if (e.target === this) {
      $(this).toggleClass('hidden flex');

      $('.wrapper, header').removeClass('blur');
    }
  });
}

showAbout();
