const appendUserRow = (i, data) => {
  let row = $('<span></span>')
    .addClass(`users__container__row users__container__row--${i} flex`)
    .appendTo('.users__container');

  let id = $('<span></span>')
    .addClass(`users__container__row__item users__container__row__item--id hidden`)
    .append(data.user_id)
    .appendTo(row);

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
    .appendTo(row);

  if (data.location_name !== null) {
    location.append(data.location_name);
  } else {
    location.append('Aucune');
  }

  let locationID = $('<span></span>')
    .addClass('users__container__row__item users__container__row__item--location_id hidden')
    .append(data.location_id)
    .appendTo(row);

  let gender = $('<span></span>')
    .addClass('users__container__row__item users__container__row__item--gender hidden')
    .append(data.gender)
    .appendTo(row);

  // Translate the user type shown in the interface
  let typeDisplayed = $('<span></span>')
    .addClass('users__container__row__item users__container__row__item--type')
    .append(userTypeSwitch(data.type))
    .appendTo(row);

  // Keep the original version to fill the management forms
  let type = $('<span></span>')
    .addClass('users__container__row__item users__container__row__item--hiddenType hidden')
    .append(data.type)
    .appendTo(row);

  let password = $('<input>')
    .attr('type', 'password')
    .addClass('users__container__row__item users__container__row__item--pwd input noInput')
    .val('12345678')
    .appendTo(row);
}

const appendLocationRow = (i, data) => {
  let row = $('<span></span>')
    .addClass(`locations__container__row locations__container__row--${i} flex`)
    .appendTo('.locations__container');

  let id = $('<span></span>')
    .addClass(`locations__container__row__item locations__container__row__item--id hidden`)
    .append(data.location_id)
    .appendTo(row);

  let name = $('<span></span>')
    .addClass('locations__container__row__item locations__container__row__item--name')
    .append(data.location_name.replace(/\'\'/g, "'"))
    .appendTo(row);

  let email = $('<span></span>')
    .addClass('locations__container__row__item locations__container__row__item--email')
    .append(data.location_mail)
    .appendTo(row);
}

const appendHistoryRow = (i, data, classname) => {
  let row = $('<span></span>')
    .addClass(`${classname}__container__row ${classname}__container__row--${i} flex`)
    .appendTo(`.${classname}__container`);

  let id = $('<span></span>')
    .addClass(`${classname}__container__row__item  rowItem ${classname}__container__row__item--id flex05`)
    .append(data.task_id)
    .appendTo(row);

  if (classname === 'search__results') {
    let applicantName = $('<span></span>')
      .addClass(`${classname}__container__row__item  rowItem ${classname}__container__row__item--name`)
      .append(data.applicant_name.replace(/\'\'/g, "'"))
      .appendTo(row);

    let applicantFirstname = $('<span></span>')
      .addClass(`${classname}__container__row__item  rowItem ${classname}__container__row__item--firstname`)
      .append(data.applicant_firstname.replace(/\'\'/g, "'"))
      .appendTo(row);
  }

  let date = $('<span></span>').addClass(`${classname}__container__row__item  rowItem ${classname}__container__row__item--date flex05`);
  let timestamp = $('<span></span>').addClass(`${classname}__container__row__item  rowItem ${classname}__container__row__item--timestamp hidden`);

  if (data.request_date !== null) {
    date.append(new Date(data.request_date).toLocaleDateString());
    timestamp.append(data.request_date.split('T')[0]);
  } else {
    date.append(locales.search.display_error);
  }

  timestamp.appendTo(row);
  date.appendTo(row);

  let assignedWorker = $('<span></span>')
    .addClass(`${classname}__container__row__item  rowItem ${classname}__container__row__item--aw flex05`)
    .appendTo(row);

  let commentMatches = {
    "\'\'": "\'",
    '\n': '<br>'
  };

  let comment = $('<span></span>')
    .addClass(`${classname}__container__row__item  rowItem ${classname}__container__row__item--body flex2`)
    .append(data.comment.replace(/\n|\'\'/g, matched => {
      return commentMatches[matched];
    }))
    .appendTo(row);

  let assignedWorkerID = $('<span></span>')
    .addClass(`${classname}__container__row__item--awid hidden`)
    .appendTo(row);

  if (data.user_fk !== undefined && data.user_fk !== null) {
    assignedWorker.append(`${data.name.toUpperCase()}, ${data.firstname}`);
    assignedWorkerID.append(data.user_fk);

  } else if (data.user_fk === null) {
    assignedWorker.append(locales.request.status_waiting);
    assignedWorkerID.append('default');
  } else {
    assignedWorker.append(locales.search.display_error);
    console.trace(`Assigned worker for task n°${data.task_id} : ${data.name.toUpperCase()}, ${data.firstname}`);
  }

  let status = $('<p></p>')
    .addClass(`${classname}__container__row__item  ${classname}__container__row__item--status flex05`)
    .appendTo(row);

  if (data.status === 'waiting') {
    status
      .text(locales.request.status_waiting)
      .removeClass('done wip')
      .addClass('waiting');
  } else if (data.status === 'done') {
    status
      .text(locales.request.status_done)
      .removeClass('waiting wip')
      .addClass('done');
  } else {
    status
      .text(locales.request.status_inProgress)
      .removeClass('done waiting')
      .addClass('wip');
  }

  // Same comment as in the switch up ahead
  if (globalSettings.sendattachments) {
    let attachment = $('<span></span>').addClass(`${classname}__container__row__item ${classname}__container__row__item--file flex05`);
    if (data.attachment) {
      attachment.append('📎');

      let attachmentSrc = $('<span></span>')
        .addClass(`${classname}__container__row__item ${classname}__container__row__item--fileSrc hidden`)
        .append(data.attachment_src)
        .appendTo(row);
    }

    attachment.appendTo(row);
  }

  // Display the location name either when searching requests for all locations or when using the history feature
  if ($('.search__container__select').val() === 'default' || $('.history').length) {
    let location_name = $('<span></span>').addClass(`${classname}__container__row__item  rowItem ${classname}__container__row__item--location`);

    if (data.location_name !== null) {
      location_name.append(data.location_name);
    } else {
      location_name.append(`Problème d'affichage...`);
    }

    location_name.appendTo(row);
  }
}
