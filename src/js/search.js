const search = () => {
  let recordDelTimeOut, recordUpdateTimeOut, inRequestsTimeOut;
  let updatedRecord = {};
  let searchData = {
    table: '',
    applicant_name: '',
    getApplicant: false
  };

  const copyText = (elt, parent, text2copy, temporaryReplacementText) => {
    let text = document.querySelector(`.${parent} ${text2copy}`);
    text.select();
    text.setSelectionRange(0, 99999);
    document.execCommand('copy');

    let contextItemClass = elt.attr('class').split(' ');

    setTimeout(() => {
      $(`.${contextItemClass[1]} p`).text(temporaryReplacementText);
    }, 1500);
  }

  $('.search__container').submit(event => {
    event.preventDefault();
    searchData.getApplicant = false;

    if ($('.search__container__select').val() !== 'default') {
      searchData.location = $('.search__container__select').val();

      if ($('.search__container__readerInput').val() !== '') {
        searchData.applicant_name = $('.search__container__readerInput').val().replace(/\'/g, "''");
        searchData.getApplicant = true;
      }

      socket.emit('search', searchData);

      searchData.location = searchData.applicant_name = '';
      searchData.getApplicant = false;
    }
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
          case 'task_id':
            columnTitle = 'N° de demande';
            break;
          case 'applicant_name':
            columnTitle = 'Nom du demandeur';
            break;
          case 'applicant_firstname':
            columnTitle = 'Prénom du demandeur';
            break;
          case 'request_date':
            columnTitle = 'Date';
            break;
          case 'comment':
            columnTitle = 'Contenu de la demande';
            break;
          case 'status':
            columnTitle = 'Statut';
            break;
          case 'user_fk':
            columnTitle = 'Attribution';
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
        let row = $('<span></span>')
          .addClass(`search__results__container__row search__results__container__row--${i} flex`)
          .appendTo('.search__results__container');

        let id = $('<span></span>')
          .addClass('search__results__container__row__item search__results__container__row__item--id')
          .append(data.task_id)
          .appendTo(row);

        let applicantName = $('<span></span>')
          .addClass('search__results__container__row__item search__results__container__row__item--name')
          .append(data.applicant_name.replace(/\'\'/g, "'"))
          .appendTo(row);

        let applicantFirstname = $('<span></span>')
          .addClass('search__results__container__row__item search__results__container__row__item--firstname')
          .append(data.applicant_firstname.replace(/\'\'/g, "'"))
          .appendTo(row);

        let date = $('<span></span>').addClass('search__results__container__row__item search__results__container__row__item--date');
        let timestamp = $('<span></span>').addClass('search__results__container__row__item search__results__container__row__item--timestamp hidden');

        if (data.request_date !== null) {
          date.append(new Date(data.request_date).toLocaleDateString());
          timestamp.append(data.request_date.split('T')[0]);
        } else {
          date.append(`Problème d'affichage...`);
        }

        timestamp.appendTo(row);
        date.appendTo(row);

        let assignedWorker = $('<span></span>')
          .addClass('search__results__container__row__item search__results__container__row__item--aw')
          .appendTo(row);

        let commentMatches = {
          "\'\'": "\'",
          '\n': '<br>'
        };

        let comment = $('<span></span>')
          .addClass('search__results__container__row__item search__results__container__row__item--body')
          .append(data.comment.replace(/\n|\'\'/g, matched => {
            return commentMatches[matched];
          }))
          .appendTo(row);

        if (data.user_fk !== undefined && data.user_fk !== null) {
          assignedWorker.append(`${data.name.toUpperCase()}, ${data.firstname}`);

          let assignedWorkerID = $('<span></span>')
            .addClass('search__results__container__row__item--awid hidden')
            .append(data.user_fk)
            .appendTo(row);

        } else if (data.user_fk === null) assignedWorker.append('Non attribué');
        else {
          assignedWorker.append('Problème d\'affichage :((');
          console.log(`Assigned worker for task n°${data.task_id} : ${data.name.toUpperCase()}, ${data.firstname}`);
        }

        let status = $('\
      <svg xmlns="http://www.w3.org/2000/svg">\
        <circle cx="50%" cy="50%" r="5"/>\
        <title class="status__title"></title>\
      </svg>\
      ').addClass('search__results__container__row__item search__results__container__row__item--status')
          .attr('viewBox', '0 0 75 10')
          .appendTo(row);

        if (data.status === 'waiting') {
          status
            .removeClass('done wip')
            .addClass('waiting');

          $(`.${status.attr('class').split(' ').join('.')} .status__title`).text('En attente d\'attribution');
        } else if (data.status === 'done') {
          status
            .removeClass('waiting wip')
            .addClass('done');

          $(`.${status.attr('class').split(' ').join('.')} .status__title`).text('Terminée');
        } else {
          status
            .removeClass('done waiting')
            .addClass('wip');

          $(`.${status.attr('class').split(' ').join('.')} .status__title`).text('En cours de traitement');
        }
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
            table: 'tasks'
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

search();
