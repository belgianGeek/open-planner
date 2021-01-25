let initialPibNb, initialBarcode;
const inRequests = () => {
  let inRequestsTimeOut;

  // autocomplete('.inRequests__form__readerInfo__container__name', '.inRequests__form__readerInfo__container__autocomplete');
  // autocomplete('.inRequests__step4__container__reader', '.inRequests__step4__container__autocomplete');

  // let dataset = '.inRequests__form__readerInfo__container__autocomplete';
  let applicantName = $('.inRequests__form__applicantInfo__name');
  let applicantFirstname = $('.inRequests__form__applicantInfo__firstname');
  let applicantLocation = $('.inRequests__form__applicantInfo__location option:selected');
  let requestDate = $('.inRequests__form__requestInfo__row1__requestDate');
  let requestContent = $('.inRequests__form__requestInfo__comment');

  $('.inRequests__form__btnContainer__submit').click(event => {
    event.preventDefault();
    data2send.table = `${applicantLocation.val()}_tasks`;

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

      // Escape apostrophes
      applicantName.val(applicantName.val().replace(/'/g, "''"));
      applicantFirstname.val(applicantFirstname.val().replace(/'/g, "''"));
      applicantLocation.val(applicantLocation.val().replace(/'/g, "''"));
      requestContent.val(requestContent.val().replace(/'/g, "''"));

      inRequestsTimeOut = setTimeout(() => {
        data2send.values.push(applicantName.val());
        data2send.values.push(applicantFirstname.val());

        // Store the date as timestamp
        data2send.values.push(new Date(requestDate.val()).toUTCString());
        data2send.values.push(applicantLocation.text());
        data2send.values.push(requestContent.val());

        // Default task status
        data2send.values.push('waiting');

        data2send.sendMail = $('.inRequests__form__requestInfo__row1__sendMail').is(':checked');

        // Send data to the server
        // If the form do not have the class 'absolute', append data to the DB and proceed to the next step
        if (!$('.inRequests').hasClass('absolute')) {
          socket.emit('append data', data2send);

          $('.inRequests__form .input').not('.inRequests__form__requestInfo__row1__requestDate').val('');

          $('.home').toggleClass('hidden flex');
          $('.header__container__icon, .header__container__msg').toggleClass('hidden');
        } else {
          // Else, update the existing record and hide the update form

          // TODO: Prévoir un champ ID pour servir de clé lors de la mise à jour d'enregistrements

          // Append the initial pib number to the array to send to the server as it'll be the key to update the specified record
          data2send.key = initialPibNb;

          data2send.barcode = initialBarcode;

          $('.inRequests.absolute').toggleClass('hidden flex');
          $('.wrapper').toggleClass('backgroundColor blur');

          socket.emit('update', data2send);

          // Hide the button to hide the form
          $('.inRequests.absolute .inRequests__form__btnContainer__hide').toggleClass('hidden');
        }

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

  $('.inRequests__step4__btn').click(() => {
    confirmation();

    inRequestsTimeOut = setTimeout(() => {
      confirmation();

      $('.inRequests__step4').toggleClass('hidden flex');
      $('.home').toggleClass('hidden flex');
      $('.header__container__icon, .header__container__msg').toggleClass('hidden');

      setTimeout(() => {
        // Send the notification email to the reader when the user is back to the homescreen
        socket.emit('send mail', {
          name: $('.inRequests__step4__container__reader').val(),
          mail: $('.inRequests__step4__container__mail').val(),
          gender: inRequestsReaderGender,
          request: $('.inRequests__step4__container__title').val()
        });
      }, 1000);
    }, 5000);
  });

  $('.confirmation__body__cancel').click(() => {
    clearTimeout(inRequestsTimeOut);
  });
}

inRequests();
