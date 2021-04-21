$('.importLink').click(() => {
  smartHide('.import', 'in');
  format = '';
});

$('.import .btn--reset').click(() => {
  smartHide('.import', 'out');
});

$('.import__child__container__file').submit(event => {
  event.preventDefault();
  const usersFileInput = $('.import__child__container__file__upload__input');

  let formData = new FormData();
  // Append the file (name of the input field, file object, filename)
  formData.append('dataUpload', usersFileInput[0].files[0], 'users.csv');

  $.ajax({
    method: 'POST',
    url: '/upload',
    processData: false,
    contentType: false,
    data: formData
  })
  .fail(() => {
    errorNotification();
  })
  .always(() => {
    // Empty the formData object and the input field
    usersFileInput.val('');
    formData = new FormData();
  });
});
