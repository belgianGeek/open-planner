const handleRequestModification = (parent, containerClass) => {
  // Format the date to be year, Month (0-indexed) and the day
  let date = $(`.${parent} ${containerClass}__container__row__item--timestamp`).text();

  $('.inRequests__form__btnContainer__hide')
    .addClass('flex')
    .removeClass('hidden');

  $('.inRequests')
    .addClass('absolute flex')
    .removeClass('hidden blur');

  // Append the attachment if any
  if ($(`.${parent} ${containerClass}__container__row__item--fileSrc`).length) {
    $('.inRequests img').attr('src', $(`.${parent} ${containerClass}__container__row__item--fileSrc`).text());
  } else {
    $('.inRequests img').attr('src', '/src/scss/icons/empty.svg');
  }

  // Fill in all the fields with the selected record data
  $('.inRequests.absolute .inRequests__id').text($(`.${parent} ${containerClass}__container__row__item--id`).text());
  $('.inRequests.absolute .inRequests__form__applicantInfo__name').val($(`.${parent} ${containerClass}__container__row__item--name`).text());
  $('.inRequests.absolute .inRequests__form__applicantInfo__firstname').val($(`.${parent} ${containerClass}__container__row__item--firstname`).text());
  $('.inRequests.absolute .inRequests__form__requestInfo__row1__requestDate').val(date);
  $('.inRequests.absolute .inRequests__form__requestInfo__comment').val($(`.${parent} ${containerClass}__container__row__item--body`).html().replace(/<br>/g, '\n\n'));

  // Check if the assigned worker ID is defined
  if ($(`.${parent} ${containerClass}__container__row__item--awid`).length) {
    $(`.inRequests.absolute .inRequests__form__requestInfo__row1__assignedWorker`).val($(`.${parent} ${containerClass}__container__row__item--awid`).text());
  }

  // Request status
  if ($(`.${parent} ${containerClass}__container__row__item--status`).hasClass('wip')) $('.inRequests.absolute .inRequests__form__requestInfo__row1__status').val('wip');
  else if ($(`.${parent} ${containerClass}__container__row__item--status`).hasClass('waiting')) $('.inRequests.absolute .inRequests__form__requestInfo__row1__status').val('waiting');
  else $('.inRequests.absolute .inRequests__form__requestInfo__row1__status').val('done');

  // The form submit is handled in the inRequests function !
  $('.inRequests.absolute .inRequests__form__btnContainer__submit')
    .unbind('click.modifyMyRequest')
    .bind('click.modifyMyRequest', function(event) {
    event.preventDefault();

    // Update the web interface with the changes
    $(`.${parent} ${containerClass}__container__row__item--name`).text($('.inRequests__form__applicantInfo__name').val().replace(/\'\'/g, "'"));
    $(`.${parent} ${containerClass}__container__row__item--firstname`).text($('.inRequests__form__applicantInfo__firstname').val().replace(/\'\'/g, "'"));
    $(`.${parent} ${containerClass}__container__row__item--date`).text(new Date($('.inRequests__form__requestInfo__row1__requestDate').val()).toLocaleDateString());
    $(`.${parent} ${containerClass}__container__row__item--location`).text($('.inRequests__form__applicantInfo__location option:selected').text().replace(/\'\'/g, "'"));
    $(`.${parent} ${containerClass}__container__row__item--body`).html($('.inRequests__form__requestInfo__comment').val().replace(/\n\n/g, '<br>'));

    if ($(`.${parent} ${containerClass}__container__row__item--fileSrc`).length) {
      $(`.${parent} ${containerClass}__container__row__item--fileSrc`).text($('.inRequests img').attr('src'));
    } else {
      $('<span></span>')
        .addClass(`${parent} ${containerClass}__container__row__item--fileSrc`)
        .text($('.inRequests img').attr('src'))
        .appendTo(`.${parent} ${containerClass}`);
    }

    // Check for default values if the user can modify the task assignment
    if ($('.inRequests__form__requestInfo__row1__assignedWorker').length) {
      if ($('.inRequests__form__requestInfo__row1__assignedWorker').val() !== 'default') {
        $(`.${parent} ${containerClass}__container__row__item--aw`).text($('.inRequests__form__requestInfo__row1__assignedWorker option:selected').text().replace(/\'\'/g, "'"));
      } else {
        $(`.${parent} ${containerClass}__container__row__item--aw`).text(locales.request.status_waiting);
      }
    }

    // Check for default values if the user can modify the task status
    if ($('.inRequests.absolute .inRequests__form__requestInfo__row1__status').length) {
      $(`.${parent} ${containerClass}__container__row__item--status`)
        .removeClass('waiting wip done')
        .addClass($('.inRequests.absolute .inRequests__form__requestInfo__row1__status').val());

      $('.inRequests__form__btnContainer__hide')
        .addClass('hidden')
        .removeClass('flex');
    }

    // Append the attachment, if any
    if ($('.inRequests.absolute .inRequests__form__requestInfo__row1__file').length && $('.inRequests.absolute img').attr('src') !== '/src/scss/icons/empty.svg') {
      $(`.${parent} ${containerClass}__container__row__item--file`).text('📎');
      $(`.${parent} ${containerClass}__container__row__item--fileSrc`).text($('.inRequests.absolute img').attr('src'));
    }
  });

  // Hide the form on btn click
  $('.inRequests.absolute .inRequests__form__btnContainer__hide').click(function() {

    $('.inRequests')
      .removeClass('absolute flex')
      .addClass('hidden');

    $('.inRequests__form__btnContainer__hide')
      .addClass('hidden')
      .removeClass('flex');

    $('.wrapper, .history, .header').removeClass('blur backgroundColor');

    // Hide the button to hide the form
    $(this).addClass('hidden');

    if (globalSettings.sendattachments) {
      $('.inRequests img')
        .attr('src', '/src/scss/icons/empty.svg')
        .removeClass('hidden');

      $('.inRequests__form__requestInfo__row1__file').val('');
    }
  });
}
