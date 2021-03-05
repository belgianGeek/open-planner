// const autocomplete = (input, dataset) => {
//   $(input).on('keydown', function() {
//     let focusInput = $(this);
//     socket.emit('retrieve readers', focusInput.val());
//
//     if (focusInput.val() === '') {
//       $(dataset)
//         .empty()
//         .toggleClass('hidden flex');
//
//       focusInput.removeAttr('style');
//     }
//   });
//
//   socket.on('readers retrieved', readers => {
//     // Don't update the input style if there are no results
//     if (readers !== []) {
//       $(input)
//         .css({
//           marginBottom: 0,
//           borderBottom: "2px solid transparent"
//         });
//
//       // Positionner les suggestions
//       $(input).ready(() => {
//         let position = $(input).position();
//         $(dataset).css({
//           left: position.left,
//           top: position.top + $(input).outerHeight() + 12,
//           width: $(input).outerWidth()
//         });
//       });
//
//       $(dataset)
//         .empty()
//         .addClass('flex')
//         .removeClass('hidden');
//     }
//
//     for (const reader of readers) {
//       let option = $('<p></p>')
//         .append(reader.name)
//         .addClass(reader.name.match(/[^,\s]/gi).join(''))
//         .appendTo(dataset);
//
//       option.click(function() {
//         $(input)
//           .val($(this).text())
//           .removeAttr('style');
//
//         $(dataset)
//           .toggleClass('hidden flex')
//           .empty();
//
//         if (input === '.inRequests__step4__container__reader') {
//           socket.emit('mail request', $(this).text());
//
//           socket.on('mail retrieved', receiver => {
//             $('.inRequests__step4__container__mail').val(receiver.mail);
//             inRequestsReaderGender = receiver.gender[0];
//           });
//         }
//       });
//     }
//   });
//
//   $(input).on('focusout', () => {
//     $(input).removeAttr('style', () => {
//       $(dataset)
//         .toggleClass('hidden flex')
//       // .empty();
//     });
//   });
//
//   $(dataset).focusout(function() {
//     $(this)
//       .toggleClass('hidden flex')
//     // .empty();
//   });
// }
