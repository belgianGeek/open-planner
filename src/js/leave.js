$('.leaveLink').click(() => {
  $('.wrapper, header').toggleClass('blur');
  $('.leave').toggleClass('hidden flex');

  $('.leave').click(function(e) {
    if (e.target === this) {
      $(this).toggleClass('hidden flex');
      $('.wrapper, header').removeClass('blur');
    }
  });

  $('.shutdownBtn').click(() => {
    socket.emit('shutdown');
  });

  $('.restartBtn').click(() => {
    socket.emit('restart');

    setTimeout(() => {
      location.reload();
    }, 10000);
  });
});
