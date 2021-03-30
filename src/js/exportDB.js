const exportDB = () => {
  let format = '';

  // Définir le frmat choisi par l'utilisateur
  $('.export__child__container__format input.radio').each(function() {
    if ($(this).is(':checked')) {
      format = $(this).val();
    }
  });

  socket.emit('export db', format);
  format = '';
}

$('.exportsLink').click(() => {
  smartHide('.export', 'in');
  format = '';
});

$('.export .btn--submit').click(() => {
  exportDB();
});

$('.export .btn--reset').click(() => {
  smartHide('.export', 'out');
});

socket.on('export successfull', () => {
  smartHide('.export', 'out');
  window.open('/download');
});
