const getUsers = () => {
  $('.usersLink').click(() => {
    $('.home, .returnIcon, .header__container__msg, .users').toggleClass('hidden flex');
    socket.emit('get users');
  });

  socket.on('users retrieved', users => {
    $('.users__container').empty(function() {
      $(this).fadeOut();
    });

    if (users[0] !== undefined) {
      let header = $('<span></span>')
        .addClass('users__container__header flex')
        .appendTo('.users__container');

      // Création du titre du tableau
      for (const [i, column] of Object.keys(users[0]).entries()) {
        let columnTitle = column;

        switch (column) {
          case 'name':
            columnTitle = 'Nom';
            break;
          case 'firstname':
            columnTitle = 'Prénom';
            break;
          case 'email':
            columnTitle = 'Adresse email';
            break;
          case 'location':
            columnTitle = 'Implantation';
            break;
          case 'password':
            columnTitle = 'Mot de passe';
            break;
          case 'type':
            columnTitle = 'Type de compte';
            break;
          default:
            columnTitle = '';
        }

        if (columnTitle !== '') {
          let title = $('<span></span>')
            .addClass('users__container__header__item')
            .text(columnTitle)
            .appendTo(header);
        }
      }

      // Ajout des résultats, ligne par ligne
      for (const [i, data] of users.entries()) {
        let row = $('<span></span>')
          .addClass(`users__container__row users__container__row--${i} flex`)
          .appendTo('.users__container');

        let name = $('<span></span>')
          .addClass('users__container__row__item users__container__row__item--name')
          .append(data.name.replace(/\'\'/g, "'"))
          .appendTo(row);

        let firstname = $('<span></span>')
          .addClass('users__container__row__item users__container__row__item--firstname')
          .append(data.firstname.replace(/\'\'/g, "'"))
          .appendTo(row);

        let email = $('<span></span>')
          .addClass('users__container__row__item users__container__row__item--email')
          .append(data.email)
          .appendTo(row);

        let location = $('<span></span>')
          .addClass('users__container__row__item users__container__row__item--location')
          .append(data.location_name)
          .appendTo(row);

        let password = $('<input>')
          .attr('type', 'password')
          .addClass('users__container__row__item users__container__row__item--pwd input noInput')
          .val('12345678')
          .appendTo(row);

        let type = $('<span></span>')
          .addClass('users__container__row__item users__container__row__item--type')
          .append(data.type)
          .appendTo(row);
      }

      $('.users__container').fadeIn();

      // Only show the customized context menu is the user is admin
      if ($('.context').length) {
        $('.users__container__row').contextmenu(function(e) {
          $('.context')
            .css({
              left: `${e.pageX}px`,
              top: `${e.pageY}px`
            })
            .toggleClass('hidden flex');

          // Store the selected row in a variable
          parent = $(this).attr('class').split(' ')[1];

          e.preventDefault();

          // Hide the context menu on left-click to prevent displaying it indefinitely
          $('.users, .users *').click(function(e) {
            if (e.target === this) {
              $('.context')
                .removeClass('flex')
                .addClass('hidden');
            }
          });
        });

        $('.context__list__item').click(() => {
          $('.context')
            .removeClass('flex')
            .addClass('hidden');
        });

        $('.context__list__item--modify').click(function() {
          // Format the date to be year, Month (0-indexed) and the day
          let date = $(`.${parent} .search__results__container__row__item--timestamp`).text();

          $('.wrapper').addClass('blur');

          $('.inRequests')
            .addClass('absolute flex')
            .removeClass('hidden');

          // Show all the fields that can be modified for the request to be updated and assigned
          $('.inRequests.absolute .inRequests__form__btnContainer__hide, .inRequests__form__requestInfo__row1__assignedWorker, .inRequests.absolute .inRequests__form__requestInfo__row1__status')
            .removeClass('hidden')
            .addClass('flex');

          $('.inRequests__form__applicantInfo__location, .inRequests__form__requestInfo__row1 label')
            .addClass('hidden')
            .removeClass('flex');

          // Fill in all the fields with the selected record data
          $('.inRequests.absolute .inRequests__id').text($(`.${parent} .search__results__container__row__item--id`).text());
          $('.inRequests.absolute .inRequests__form__applicantInfo__location').val($(`.search__container__select`).val());
          $('.inRequests.absolute .inRequests__form__applicantInfo__name').val($(`.${parent} .search__results__container__row__item--name`).text());
          $('.inRequests.absolute .inRequests__form__applicantInfo__firstname').val($(`.${parent} .search__results__container__row__item--firstname`).text());
          $('.inRequests.absolute .inRequests__form__requestInfo__row1__requestDate').val(date);
          $('.inRequests.absolute .inRequests__form__requestInfo__comment').val($(`.${parent} .search__results__container__row__item--body`).text().replace('<br>', '\n'));
          $('.inRequests.absolute .inRequests__form__requestInfo__row1__assignedWorker').val($(`.${parent} .search__results__container__row__item--awid`).text());

          // Request status
          if ($(`.${parent} .search__results__container__row__item--status`).hasClass('wip')) $('.inRequests.absolute .inRequests__form__requestInfo__row1__status').val('wip');
          else if ($(`.${parent} .search__results__container__row__item--status`).hasClass('waiting')) $('.inRequests.absolute .inRequests__form__requestInfo__row1__status').val('waiting');
          else $('.inRequests.absolute .inRequests__form__requestInfo__row1__status').val('done');

          // The form submit is handled in the inRequests function !
          $('.inRequests.absolute .inRequests__form__btnContainer__submit').click(() => {
            // Update the web interface with the changes
            $(`.${parent} .search__results__container__row__item--name`).text($('.inRequests__form__applicantInfo__name').val().replace(/\'\'/g, "'"));
            $(`.${parent} .search__results__container__row__item--firstname`).text($('.inRequests__form__applicantInfo__firstname').val().replace(/\'\'/g, "'"));
            $(`.${parent} .search__results__container__row__item--date`).text(new Date($('.inRequests__form__requestInfo__row1__requestDate').val()).toLocaleDateString());
            $(`.${parent} .search__results__container__row__item--location`).text($('.inRequests__form__applicantInfo__location option:selected').text().replace(/\'\'/g, "'"));
            $(`.${parent} .search__results__container__row__item--body`).text($('.inRequests__form__requestInfo__comment').val().replace('\n', '<br>'));
            $(`.${parent} .search__results__container__row__item--aw`).text($('.inRequests__form__requestInfo__row1__assignedWorker option:selected').text().replace(/\'\'/g, "'"));

            $(`.${parent} .search__results__container__row__item--status`)
              .removeClass('waiting wip done')
              .addClass($('.inRequests.absolute .inRequests__form__requestInfo__row1__status').val());

          });

          // Hide the form on btn click
          $('.inRequests.absolute .inRequests__form__btnContainer__hide').click(function() {
            $('.inRequests')
              .removeClass('absolute flex')
              .addClass('hidden');

            $('.wrapper').removeClass('blur backgroundColor');

            // Hide the button to hide the form
            $(this).addClass('hidden');
          });
        });

        $('.context__list__item--del').click(function() {
          let record2delete = {
            key: $(`.${parent} .search__results__container__row__item--id`).text(),
            table: $('.search__container__select').val()
          };

          confirmation();

          // Hide the record from the interface
          $(`.${parent}`).toggleClass('hidden flex');

          recordDelTimeOut = setTimeout(() => {
            // Delete the record from the interface
            $(`.${parent}`).remove();
            confirmation();

            socket.emit('delete data', record2delete);

            // Reset the deletionKey
            record2delete = {};

          }, 5000);

          $('.confirmation__body__cancel').click(() => {
            clearTimeout(recordDelTimeOut);
            $(`.${parent}`)
              .removeClass('hidden')
              .addClass('flex');
            recordDelTimeOut = undefined;

            // Reset the deletionKey
            record2delete = {};
          });
        });
      }
    }
  });
}

getUsers();
