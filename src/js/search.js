const search = () => {
  let updatedRecord = {};
  let searchData = {
    table: 'tasks',
    applicant_name: '',
    getApplicant: false
  };

  const wrapperBlur = () => $('.wrapper').toggleClass('blur');

  $('.search__container').submit(event => {
    event.preventDefault();
    searchData.getApplicant = false;

    if ($('.search__container__select').val() !== 'default') {
      searchData.location = $('.search__container__select').val();
    }

    if ($('.search__container__readerInput').val() !== '') {
      searchData.applicant_name = $('.search__container__readerInput').val().replace(/\'/g, "''");
      searchData.getApplicant = true;
    }

    socket.emit('search', searchData);

    searchData.location = undefined;
    searchData.applicant_name = '';
    searchData.getApplicant = false;
  });

  socket.on('search results', results => {
    let parent;

    $('.search__results__container').empty(function() {
      $(this).fadeOut();
    });

    if (results[0] !== undefined) {
      let header = $('<span></span>')
        .addClass('search__results__container__header flex')
        .appendTo('.search__results__container');

      // Création du titre du tableau
      for (const [i, column] of Object.keys(results[0]).entries()) {
        let columnTitle = column;

        switch (column) {
          case 'attachment':
            // Hide the attachments column is attachments sending is forbidden
            if (globalSettings.sendattachments) {
              columnTitle = locales.search.attachment;
            } else {
              columnTitle = '';
            }
            break;
          case 'task_id':
            columnTitle = locales.search.request_number;
            break;
          case 'location_name':
            columnTitle = 'Implantation';
            break;
          case 'location_name':
            columnTitle = 'Implantation';
            break;
          case 'location_name':
            columnTitle = 'Implantation';
            break;
          case 'applicant_name':
            columnTitle = locales.request.applicant_name;
            break;
          case 'applicant_firstname':
            columnTitle = locales.request.applicant_firstname;
            break;
          case 'request_date':
            columnTitle = 'Date';
            break;
          case 'comment':
            columnTitle = locales.search.request_content;
            break;
          case 'status':
            columnTitle = locales.search.status;
            break;
          case 'user_fk':
            columnTitle = locales.search.assignment;
            break;
          default:
            columnTitle = '';
        }

        if (columnTitle !== '') {
          let title = $('<span></span>')
            .addClass('search__results__container__header__item')
            .text(columnTitle)
            .appendTo(header);
        }
      }

      // Ajout des résultats, ligne par ligne
      for (const [i, data] of results.entries()) {
        appendHistoryRow(i, data, 'search__results');
      }

      $('.search__results__container').fadeIn();

      // Only show the customized context menu is the user is admin
      if ($('.context').length) {
        $('.search__results__container__row').contextmenu(function(e) {
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
          $('.search__results, .search__results *').click(function(e) {
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
          $('.wrapper').addClass('blur');

          $('.inRequests.absolute .inRequests__form__applicantInfo__location').val($(`.search__container__select`).val());

          // Block all the user-related fields to prevent modifications
          $('.inRequests.absolute .inRequests__form__applicantInfo__name, .inRequests.absolute .inRequests__form__applicantInfo__firstname, .inRequests.absolute .inRequests__form__requestInfo__row1__requestDate').attr('disabled', true);

          handleRequestModification(parent, '.search__results');
        });

        $('.context__list__item--del').unbind('click.searchDel').bind('click.searchDel', function() {
          let record2delete = {
            key: $(`.${parent} .search__results__container__row__item--id`).text(),
            table: 'tasks'
          };

          confirmation();

          wrapperBlur();

          // Hide the record from the interface
          $(`.${parent}`).toggleClass('hidden flex');

          recordDelTimeOut = setTimeout(() => {
            // Delete the record from the interface
            $(`.${parent}`)
              .removeClass('flex')
              .addClass('hidden');

            confirmation();

            socket.emit('delete data', record2delete);

            // Reset the deletionKey
            record2delete = {};

            wrapperBlur();
          }, 5000);
        });
      }
    }

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

search();
