let initialPibNb, initialBarcode;
const inRequests = () => {
  let inRequestsTimeOut, attachment;

  let applicantName = $('.inRequests__form__applicantInfo__name');
  let applicantFirstname = $('.inRequests__form__applicantInfo__firstname');
  let requestDate = $('.inRequests__form__requestInfo__row1__requestDate');
  let requestContent = $('.inRequests__form__requestInfo__comment');

  // Picture sending is optional
  data2send.sendattachment = false;

  // Remove the selected image from the request
  $('.inRequests__form__requestInfo__row1__emptyFile').click(function() {
    if (!$('.inRequests').hasClass('absolute')) {
      $(this).parents('form').siblings('img').attr('src', '/src/scss/icons/empty.svg');
    }

    $('.inRequests__form__requestInfo__row1__file').val('');
    $(this).addClass('hidden');
  });

  $('.inRequests__form__requestInfo__row1__file').on('change', function() {
    if ($(`.${$(this).attr('class').split(' ').join('.')}`).val() !== '') {
      if ($(this).attr('src') !== '/src/scss/icons/empty.svg') {
        $('.inRequests__form__requestInfo__row1__emptyFile').removeClass('hidden');

        compress(`.${$(this).attr('class').split(' ').join('.')}`, 'image/jpeg', compressedPic => {
          $(this).parents('form').siblings('img').attr('src', compressedPic);
          attachment = compressedPic;
          data2send.sendattachment = true;
        });
      }
    } else {
      attachment = undefined;
      data2send.sendattachment = false;
    }
  });

  $('.inRequests__form__btnContainer__submit')
  .unbind('click.submitRequest')
  .bind('click.submitRequest', function (event) {
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

    // If the user adds a file to his request
    const handleAttachment = () => {
      if (data2send.sendattachment && globalSettings.sendattachments) {
        data2send.values.push(data2send.sendattachment);
        data2send.values.push(attachment);
      } else {
        data2send.values.push(data2send.sendattachment);
      }
    }

    if (!validationErr) {
      $('.input').removeClass('invalid');
      $('form .warning').hide();

      confirmation();

      if ($('.inRequests').hasClass('absolute')) {
        $('.inRequests').addClass('blur');
      } else {
        $('.wrapper, .inRequests').addClass('blur');
      }

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

        // Send an attachment if a custom image is added by the user
        // (Works for both the absolute and static forms)
        if ($('.inRequests img').attr('src') !== '/src/scss/icons/empty.svg') {
          data2send.sendattachment = true;
        }

        // Set the notification status if a new record is created
        // Else, set the assigned worker
        if (!$('.inRequests').hasClass('absolute')) {
          // Store the date as timestamp
          data2send.values.push(new Date(requestDate.val()).toUTCString());
          data2send.values.push(applicantLocation.val());

          // If the form do not have the class 'absolute', append data to the DB and proceed to the next step
          data2send.mail.title = `🔥 ${globalSettings.instance_name} - Une nouvelle demande a été enregistrée 🔥`;

          // Define the mail type
          data2send.mail.type = 'adding';

          if ($('.inRequests__form__requestInfo__row1__status').length) {
            let status = $('.inRequests__form__requestInfo__row1__status').val();
            data2send.mail.status = status;
            data2send.values.push(status);

            // Check for default values to avoid errors when encoding in the DB
            if ($('.inRequests__form__requestInfo__row1__assignedWorker').val() !== 'default') {
              data2send.values.push(assignedWorker.val());
            } else {
              // Set the assignment value to null if no worker is selected
              data2send.values.push(null);
            }
          } else {
            // Default task status
            data2send.mail.status = 'waiting';
            data2send.values.push('waiting');

            // Set the assignment value to null if no worker is selected
            data2send.values.push(null);
          }

          handleAttachment();

          // Do not send an assigned worker ID because the task is not yet assigned

          socket.emit('append data', data2send);

          $('.home, .header__container, .inRequests').toggleClass('hidden flex');
          $('.wrapper, .inRequests').removeClass('blur');
        } else {
          // Else, update the existing record and hide the update form

          data2send.mail.id = data2send.id = $('.inRequests.absolute .inRequests__id').text();
          data2send.mail.creationDate = new Date(requestDate.val()).toLocaleDateString();
          data2send.mail.type = 'update';

          // Check the task status to adapt the mail sent to the user
          if ($('.inRequests__form__requestInfo__row1__status option:selected').val() === 'done') {
            data2send.mail.title = `🏁 La demande n°${data2send.mail.id} est traitée 🏁`;
            data2send.mail.status = 'done';
          } else {
            data2send.mail.title = `🙃 La demande n°${data2send.mail.id} a été mise à jour 🙃`;
            data2send.mail.status = 'wip';
          }

          // Check if the task is being updated by the user
          if (data2send.userUpdate) {
            // Those values are assigned in the 'handleRequestModification' function :-)
            data2send.values.push(data2send.status);
            data2send.values.push(data2send.assignedWorker);
          } else {
            data2send.values.push(data2send.mail.status);
            data2send.values.push(assignedWorker.val());
          }

          handleAttachment();

          $('.inRequests').toggleClass('hidden flex');
          $('.wrapper, .history, .header, .inRequests').removeClass('blur backgroundColor');

          socket.emit('update', data2send);

          // Hide the button to hide the form
          $('.inRequests.absolute .inRequests__form__btnContainer__hide').toggleClass('hidden flex');
        }

        // If the user want to send a notification email to the workers team
        if (globalSettings.sendmail) {
          let options = {
            request: requestContent.val(),
            applicant: {
              name: applicantName.val(),
              firstname: applicantFirstname.val(),
              location: applicantLocation.text()
            },
            sendcc: globalSettings.sendcc,
            type: data2send.mail.type,
            mail: data2send.mail
          }

          if (data2send.sendattachment && globalSettings.sendattachments) {
            options.attachments = [{
              filename: `${globalSettings.instance_name.replace(/[\/'\s]/, '-')}_${Date.now()}.jpg`,
              encoding: 'base64',
              content: $('.inRequests img').attr('src').split(';base64,').pop()
            }];
          }

          // Only send a confirmation email if the user wants to
          if ($('.inRequests__form__requestInfo__row1__confirmationEmail').prop('checked')) {
            socket.emit('send mail', options);
          }
        }

        // Empty the request subject and file attachment input fields
        $('.inRequests__form__requestInfo__comment, .inRequests__form__requestInfo__row1__file').val('');

        // Select the default location option
        $('.inRequests__form__applicantInfo__location').val('default');

        confirmation();

        $('.inRequests img')
          .attr('src', '/src/scss/icons/empty.svg')
          .removeClass('hidden');

        data2send.values = [];
      }, 5000);
    } else {
      if (!$('form .warning').length) {
        let warning = $('<span></span>')
          .addClass('warning')
          .text(locales.form.invalid)
          .insertBefore('.inRequests__form__btnContainer');
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
    if ($('.inRequests').hasClass('absolute')) {
      $('.inRequests').removeClass('blur');
    } else {
      $('.wrapper, .inRequests').removeClass('blur');
    }
  });
}

inRequests();
