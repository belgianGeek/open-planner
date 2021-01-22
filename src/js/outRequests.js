const outRequests = () => {
  let outRequestsTimeOut;
  let pibNb = $('.outRequests__form__pibInfo__pibNb');
  let borrowingLibrary = $('.outRequests__form__pibInfo__borrowingLibrary');
  let requestDate = $('.outRequests__form__pibInfo__requestDate');
  let loanLibrary = $('.outRequests__form__pibInfo__loanLibrary');
  let title = $('.outRequests__form__docInfo__title');
  let authorField = $('.outRequests__form__docInfo__author');
  let cdu = $('.outRequests__form__docInfo__cdu');

  // Séparer le nom de l'auteur de son prénom
  let author = '';

  $('.outRequests__form__btnContainer__submit').click(event => {
    event.preventDefault();
    data2send.table = 'out_requests';

    // N° PIB
    if (!pibNb.val().match(/\d{6}/) || pibNb.val().match(/\d{7,}/)) {
      invalid(pibNb);
    }

    // Bibliothèque emprunteuse
    if (borrowingLibrary.val() === '') {
      invalid(borrowingLibrary);
    }

    // Date de la demande
    if (requestDate.val() === '') {
      invalid(requestDate);
    }

    // Bibliothèque prêteuse
    if (loanLibrary.val() === '') {
      invalid(loanLibrary);
    }

    // Titre du document
    if (title.val() === '') {
      invalid(title);
    }


    if (authorField.val() === '') {
      invalid(authorField);
    }

    if (cdu.val() === '') {
      invalid(cdu);
    }

    if (!validationErr) {
      $('.input').removeClass('invalid');
      $('form .warning').hide();

      borrowingLibrary.val(borrowingLibrary.val().replace(/'/g, "''"));
      loanLibrary.val(loanLibrary.val().replace(/'/g, "''"));
      title.val(title.val().replace(/'/g, "''"));

      let outProvince = $('.outRequests__form__pibInfo__outProvince').is(':checked');

      confirmation();
      
      outRequestsTimeOut = setTimeout(() => {
        data2send.values.push(pibNb.val());
        data2send.values.push(borrowingLibrary.val());

        // Stocker la date en timestamp
        data2send.values.push(new Date(requestDate.val()).toUTCString());
        data2send.values.push(loanLibrary.val());
        data2send.values.push(title.val());

        // Si le nom de l'auteur est de forme NOM, Prénom
        if (authorField.val().indexOf(',') !== -1) {
          author = authorField.val().split(',');

          // Escape apostrophes in the author's name
          author[0] = author[0].replace(/'/g, "''");
          data2send.values.push(author[0].toUpperCase().trim(), author[1].trim());

          // On ne change pas la valeur de data2send.authorFirstName car la condition est vérifiée
        } else {
          // Sinon, il n'y a que le nom de famille
          author = authorField.val();
          data2send.values.push(author);

          // On change la valeur de data2send.authorFirstName car la condition est fausse
          data2send.authorFirstName = false;
        }

        data2send.values.push(cdu.val());
        data2send.values.push(outProvince);

        socket.emit('append data', data2send);
        data2send.values = [];

        $('.outRequests__step4').toggleClass('hidden flex');
        confirmation();

        $('.home').toggleClass('hidden flex');
        $('.header__container__icon, .header__container__msg').toggleClass('hidden');

        $('.outRequests__form .input').not('.outRequests__form__pibInfo__requestDate, .outRequests__form__pibInfo__loanLibrary').val('');
      }, 5000);
    } else {
      if (!$('form .warning').length) {
        let warning = $('<span></span>')
          .addClass('warning')
          .text('Certains champs sont incorrects...')
          .appendTo('.outRequests__form');
      };

      validationErr = false;
      data2send.values = [];
    }
  });

  $('.outRequests__form__btnContainer__reset').click(() => {
    $('.input').removeClass('invalid');
    $('form .warning').hide();
    validationErr = false;
    data2send.values = [];
  });

  $('.confirmation__body__cancel').click(() => {
    clearTimeout(outRequestsTimeOut);
  });
}

outRequests();
