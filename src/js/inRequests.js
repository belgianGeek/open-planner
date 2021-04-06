let initialPibNb, initialBarcode;
const inRequests = () => {
  let inRequestsTimeOut, attachment;

  // autocomplete('.inRequests__form__readerInfo__container__name', '.inRequests__form__readerInfo__container__autocomplete');
  // autocomplete('.inRequests__step4__container__reader', '.inRequests__step4__container__autocomplete');

  // let dataset = '.inRequests__form__readerInfo__container__autocomplete';
  let applicantName = $('.inRequests__form__applicantInfo__name');
  let applicantFirstname = $('.inRequests__form__applicantInfo__firstname');
  let requestDate = $('.inRequests__form__requestInfo__row1__requestDate');
  let requestContent = $('.inRequests__form__requestInfo__comment');

  // Picture sending is optional
  data2send.sendAttachment = false;

  $('.inRequests__form__requestInfo__row1__file').on('change', function() {
    compress(`.${$(this).attr('class').split(' ').join('.')}`, 'image/jpeg', compressedPic => {
      attachment = compressedPic;
      $('.inRequests img').attr('src', compressedPic);
      data2send.sendAttachment = true;
    });
  });

  $('.inRequests__form__btnContainer__submit').click(event => {
    event.preventDefault();
    let applicantLocation = $('.inRequests__form__applicantInfo__location option:selected');
    let assignedWorker = $('.inRequests__form__requestInfo__row1__assignedWorker option:selected');
    data2send.table = 'tasks';

    // Applicant name
    if (applicantName.val() === '') {
      invalid(applicantName);
    }

    // Applicant firstname
    if (applicantFirstname.val() === '') {
      invalid(applicantFirstname);
    }

    if (!$('.inRequests').hasClass('absolute')) {
      // Applicant location
      if (applicantLocation.val() === '') {
        invalid(applicantLocation);
      }
    }

    // Request date
    if (requestDate.val() === '') {
      invalid(requestDate);
    }

    // Request body
    if (requestContent.val() === '') {
      invalid(requestContent);
    }

    if ($('.inRequests').hasClass('absolute')) {
      if (assignedWorker.val() === 'default') {
        invalid($('.inRequests.absolute .inRequests__form__requestInfo__row1__assignedWorker'));
      }
    }

    if (!validationErr) {
      $('.input').removeClass('invalid');
      $('form .warning').hide();

      confirmation();

      inRequestsTimeOut = setTimeout(() => {
        // Escape apostrophes
        applicantName.val(applicantName.val().replace(/'/g, "''"));
        applicantFirstname.val(applicantFirstname.val().replace(/'/g, "''"));
        requestContent.val(requestContent.val().replace(/'/g, "''"));

        // Applicant location and assigned worker are both ID's
        // we don't need to escape apostrophes

        data2send.values.push(applicantName.val());
        data2send.values.push(applicantFirstname.val());
        data2send.values.push(requestContent.val());

        // Create an object to store the notification-related information
        data2send.mail = {};

        // Set the notification status if a new record is created
        // Else, set the assigned worker
        if (!$('.inRequests').hasClass('absolute')) {
          // Store the date as timestamp
          data2send.values.push(new Date(requestDate.val()).toUTCString());
          data2send.values.push(applicantLocation.val());

          // If the form do not have the class 'absolute', append data to the DB and proceed to the next step
          data2send.mail.title = "🔥 Une nouvelle demande a été introduite dans le tableau d'intervention 🔥";
          data2send.mail.status = 'waiting';

          // Default task status
          data2send.values.push('waiting');

          // If the user adds a file to his request
          if (data2send.sendAttachment) {
            data2send.values.push(data2send.sendAttachment);
            data2send.values.push(attachment);
          } else {
            data2send.values.push(data2send.sendAttachment);
          }

          // Do not send an assigned worker ID because the task is not yet assigned

          socket.emit('append data', data2send);

          $('.home').toggleClass('hidden flex');
          $('.header__container__icon, .header__container__msg').toggleClass('hidden');
        } else {
          // Else, update the existing record and hide the update form

          data2send.mail.id = data2send.id = $('.inRequests.absolute .inRequests__id').text();
          data2send.mail.creationDate = new Date(requestDate.val()).toLocaleDateString();
          // Check the task status to adapt the mail sent to the user
          if ($('.inRequests__form__requestInfo__row1__status option:selected').val() === 'done') {
            data2send.mail.title = `🏁 La demande n°${data2send.mail.id} est traitée 🏁`;
            data2send.mail.status = 'done';
          } else {
            data2send.mail.title = `🙃 La demande n°${data2send.mail.id} a été mise à jour 🙃`;
            data2send.mail.status = 'wip';
          }

          data2send.values.push($('.inRequests__form__requestInfo__row1__status option:selected').val());
          data2send.values.push(assignedWorker.val());

          $('.inRequests.absolute').toggleClass('hidden flex');
          $('.wrapper').toggleClass('backgroundColor blur');

          socket.emit('update', data2send);

          // Hide the button to hide the form
          $('.inRequests.absolute .inRequests__form__btnContainer__hide').toggleClass('hidden');
        }

        // If the user want to send a notification email to the workers team
        if (globalSettings.sendmail) {
          socket.emit('send mail', {
            request: requestContent.val(),
            applicant: {
              name: applicantName.val(),
              firstname: applicantFirstname.val(),
              location: applicantLocation.text()
            },
            sendcc: globalSettings.sendcc,
            mail: data2send.mail
          });
        }

        $('.inRequests__form .input').not('.inRequests__form__requestInfo__row1__requestDate').val('');

        confirmation();

        data2send.values = [];
      }, 5000);
    } else {
      if (!$('form .warning').length) {
        let warning = $('<span></span>')
          .addClass('warning')
          .text('Certains champs sont incorrects...')
          .appendTo('.inRequests__form');
      };

      validationErr = false;

      // Empty the data2send.values array to avoid validation errors
      data2send.values = [];
    }
  });

  $('.inRequests__form__btnContainer__reset').click(() => {
    $('.input').removeClass('invalid');
    $('form .warning').hide();
    validationErr = false;
    data2send.values = [];
  });

  $('.confirmation__body__cancel').click(() => {
    clearTimeout(inRequestsTimeOut);
  });
}

inRequests();
