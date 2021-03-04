// const settings = () => {
//   // Get settings from the server-side
//   socket.on('settings', settings => {
//     $('.settings__child__textarea__content').val(settings.mail_content.toString().replace(/\'\'/g, "'"));
//   });
//
//   // Show settings on btn click
//   $('.settingsLink').click(() => {
//     $('.settings__container').toggleClass('hidden flex');
//     $('.wrapper').addClass('blur');
//   });
//
//   $('.settings__container').click(function(e) {
//     if (e.target === this) {
//       $(this).toggleClass('hidden flex');
//       $('.wrapper').removeClass('blur');
//
//       if (settings.mail_content !== $('.settings__child__textarea__content').val().replace(/\'/g, "''")) {
//         socket.emit('settings', {
//             mail_content: $('.settings__child__textarea__content').val().replace(/\'/g, "''")
//         });
//     }
//     }
//   });
// }
//
// settings();
