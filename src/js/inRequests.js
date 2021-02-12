let initialPibNb, initialBarcode;
const inRequests = () => {
  let inRequestsTimeOut;

  // autocomplete('.inRequests__form__readerInfo__container__name', '.inRequests__form__readerInfo__container__autocomplete');
  // autocomplete('.inRequests__step4__container__reader', '.inRequests__step4__container__autocomplete');

  // let dataset = '.inRequests__form__readerInfo__container__autocomplete';
  let applicantName = $('.inRequests__form__applicantInfo__name');
  let applicantFirstname = $('.inRequests__form__applicantInfo__firstname');
  let requestDate = $('.inRequests__form__requestInfo__row1__requestDate');
  let requestContent = $('.inRequests__form__requestInfo__comment');
  let assignedWorker = $('.inRequests__form__requestInfo__row1__assignedWorker');

  $('.inRequests__form__btnContainer__submit').click(event => {
    event.preventDefault();
    let applicantLocation = $('.inRequests__form__applicantInfo__location option:selected');
    data2send.table = 'tasks';

    // Applicant name
    if (applicantName.val() === '') {
      invalid(applicantName);
    }

    // Applicant firstname
    if (applicantFirstname.val() === '') {
      invalid(applicantFirstname);
    }

    // Applicant location
    if (applicantLocation.val() === '') {
      invalid(applicantLocation);
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
      if (assignedWorker.val() === '') {
        invalid(assignedWorker);
      }
    }

    if (!validationErr) {
      $('.input').removeClass('invalid');
      $('form .warning').hide();

      confirmation();

      // Avoid style modification while updating a record through the search module
      // if (!$('.inRequests').hasClass('absolute')) {
      //   $(`.inRequests__step2`)
      //     .removeClass('translateXonwards translateXbackwards hidden fixed')
      //     .addClass('flex');
      // }

      inRequestsTimeOut = setTimeout(() => {
        // Escape apostrophes
        applicantName.val(applicantName.val().replace(/'/g, "''"));
        applicantFirstname.val(applicantFirstname.val().replace(/'/g, "''"));
        applicantLocation.val(applicantLocation.val().replace(/'/g, "''"));
        requestContent.val(requestContent.val().replace(/'/g, "''"));

        if ($('.inRequests').hasClass('absolute')) {
          assignedWorker.val(assignedWorker.val().replace(/'/g, "''"));
        }

        data2send.values.push(applicantName.val());
        data2send.values.push(applicantFirstname.val());

        // Store the date as timestamp
        data2send.values.push(new Date(requestDate.val()).toUTCString());
        data2send.values.push(applicantLocation.val());
        data2send.values.push(requestContent.val());

        // Set the notification status if a new record is created
        // Else, set the assigned worker
        if (!$('.inRequests').hasClass('absolute')) {
          data2send.sendMail = $('.inRequests__form__requestInfo__row1__sendMail').is(':checked');

          // Default task status
          data2send.values.push('waiting');

          // Do not send an assigned worker ID because the task is not yet assigned
        } else {
          data2send.values.push($('.inRequests__form__requestInfo__row1__status').val());
          data2send.values.push(assignedWorker.val());
        }

        // Send data to the server
        // If the form do not have the class 'absolute', append data to the DB and proceed to the next step
        if (!$('.inRequests').hasClass('absolute')) {
          socket.emit('append data', data2send);

          $('.home').toggleClass('hidden flex');
          $('.header__container__icon, .header__container__msg').toggleClass('hidden');

          // If the user want to send a notification email to the workers team
          if (data2send.sendMail) {
            socket.emit('send mail', {
              request: requestContent.val(),
              applicant: {
                name: applicantName.val(),
                firstname: applicantFirstname.val(),
                location: applicantLocation.text()
              }
            });
          }
        } else {
          // Else, update the existing record and hide the update form

          data2send.id = $('.inRequests.absolute .inRequests__id').text();

          $('.inRequests.absolute').toggleClass('hidden flex');
          $('.wrapper').toggleClass('backgroundColor blur');

          socket.emit('update', data2send);

          // Hide the button to hide the form
          $('.inRequests.absolute .inRequests__form__btnContainer__hide').toggleClass('hidden');
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
