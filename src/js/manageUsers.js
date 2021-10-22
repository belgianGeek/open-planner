let iDataRow = 0;
let parent;

function userTypeSwitch(inputValue) {
  let returnValue = '';

  switch (inputValue) {
    case 'guest':
      returnValue = locales.account_type.guest;
      break;
    case 'user':
      returnValue = locales.account_type.user;
      break;
    case 'admin':
      returnValue = locales.account_type.admin;
      break;
    default:
      inputValue;
  }

  return returnValue;
}

const manageUsers = () => {
  // Hide the form on btn click
  const hideForm = (parentElt, childElt) => {
    $(`.${parentElt}.absolute .${parentElt}__form__btnContainer__hide`).ready(function() {
      $(`.${parentElt}.absolute .${parentElt}__form__btnContainer__hide`).click(function() {
        $(`.${parentElt}`)
          .removeClass('absolute zero flex')
          .addClass('hidden');

        $(`.${childElt}, .header`).removeClass('blur backgroundColor');

        // Hide the button to hide the form
        $(this).addClass('hidden');
      });
    });
  }

  const handleAdding = (parentMenuClassname, childMenuClassname) => {
    $(`.${childMenuClassname}__header__addBtn`).click(function() {
      $(`.${childMenuClassname}, .header`).addClass('blur backgroundColor');

      // Set all the input fields to their default value
      $(`.${parentMenuClassname} input`).not('.radio').val('');
      $('.register select').val('default');

      // Make sure the title is correct
      if (childMenuClassname === 'users') {
        $('.register__title').text(locales.users.add_title);
        $('.register__title').addClass('addUserTitle');
      } else {
        $('.addLocation__title').text(locales.locations.add_title);
        $('.addLocation__title').addClass('newLocationTitle');
      }

      $(`.${parentMenuClassname}`)
        .addClass('absolute zero flex')
        .removeClass('hidden');
    });

    $(`.${parentMenuClassname}.absolute .${parentMenuClassname}__form__btnContainer__submit`).click(function() {
      $(`.${parentMenuClassname}`)
        .removeClass('absolute zero flex')
        .addClass('hidden');
    });
  }

  const handleData = (data, parentMenuClassname, childMenuClassname) => {
    $(`.${childMenuClassname}__container`).empty(function() {
      $(this).fadeOut();
    });

    if (data[0] !== undefined) {
      let header = $('<span></span>')
        .addClass(`${childMenuClassname}__container__header flex`)
        .appendTo(`.${childMenuClassname}__container`);

      // Création du titre du tableau
      for (const [i, column] of Object.keys(data[0]).entries()) {
        let columnTitle = column;

        if (childMenuClassname === 'users') {
          switch (column) {
            // Users rows
            case 'name':
              columnTitle = locales.form.name_generic;
              break;
            case 'firstname':
              columnTitle = locales.form.firstname_generic;
              break;
            case 'email':
              columnTitle = locales.form.mail_generic;
              break;
            case 'location':
              columnTitle = locales.form.location_generic;
              break;
            case 'password':
              columnTitle = locales.login.passwd;
              break;
            case 'type':
              columnTitle = locales.register.account_type;
              break;
            default:
              columnTitle = '';
          }
        } else if (childMenuClassname === 'locations') {
          switch (column) {
            // Locations rows
            case 'location_name':
              columnTitle = locales.form.name_generic;
              break;
            case 'location_mail':
              columnTitle = locales.form.mail_generic;
              break;
            default:
              columnTitle = '';
          }
        } else if (childMenuClassname === 'history__results') {
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
        }

        if (columnTitle !== '') {
          let title = $('<span></span>')
            .addClass(`${childMenuClassname}__container__header__item`)
            .text(columnTitle)
            .appendTo(header);
        }
      }

      // Ajout des résultats, ligne par ligne
      for (const [i, info] of data.entries()) {
        if (childMenuClassname === 'users') {
          appendUserRow(i, info);
        } else if (childMenuClassname === 'locations') {
          appendLocationRow(i, info);
        } else if (childMenuClassname === 'history__results') {
          appendHistoryRow(i, info, 'history__results');
        }

        if (i === data.length - 1) {
          iDataRow = i + 1;
        }
      }

      $(`.${childMenuClassname}__container`).fadeIn();

      // Only show the customized context menu is the user is admin
      if ($('.context').length) {
        $(`.${childMenuClassname}__container__row`).contextmenu(function(e) {
          $('.context')
            .css({
              left: `${e.pageX}px`,
              top: `${e.pageY}px`
            })
            .toggleClass('hidden flex');

          // Store the selected row in a variable
          parent = $(this).attr('class').split(' ').join('.');

          e.preventDefault();

          // Hide the context menu on left-click to prevent displaying it indefinitely
          $(`.${childMenuClassname}, .${childMenuClassname} *`).click(function(e) {
            if (e.target === this) {
              $('.context')
                .removeClass('flex')
                .addClass('hidden');
            }
          });
        });

        $('.context__list__item--modify').click(function() {
          if (childMenuClassname === 'users') {
            $(`.register`)
              .addClass('absolute zero flex')
              .removeClass('hidden');

            // Update the password field placeholder
            $('.register.absolute .register__form__password input').attr('placeholder', locales.form.passwd_empty);

            $('.users, .header').addClass('blur backgroundColor');
          } else if (childMenuClassname === 'locations') {
            $(`.addLocation`)
              .addClass('absolute zero flex')
              .removeClass('hidden');

            $('.locations, .header').addClass('blur backgroundColor');
          } else if (childMenuClassname === 'history__results') {
            $('.history, .header').addClass('blur backgroundColor');

            $('.inRequests__form__btnContainer__hide')
              .text(locales.history.hide_btn)
              .removeClass('hidden')
              .addClass('flex');

            socket.emit('user data');

            handleRequestModification(parent, '.history__results');
          }

          // Modify the title
          let sectionTitle, sectionClass;
          if (childMenuClassname === 'users') {
            sectionTitle = locales.users.modify_title;
            sectionClass = 'updateUserTitle';
          } else {
            sectionTitle = locales.locations.modify_title;
            sectionClass = 'updateLocationTitle';
          }

          $(`.${parentMenuClassname}__title`)
            .text(`${sectionTitle} ${$(`.${parent} .${childMenuClassname}__container__row__item--firstname`).text()}
            ${$(`.${parent} .${childMenuClassname}__container__row__item--name`).text()}`)
            .addClass(sectionClass);

          // Fill in all the fields with the selected record data
          $(`.${parentMenuClassname}.absolute .${parentMenuClassname}__form__userID`).val($(`.${parent} .${childMenuClassname}__container__row__item--id`).text());
          $(`.${parentMenuClassname}.absolute .${parentMenuClassname}__form__name input`).val($(`.${parent} .${childMenuClassname}__container__row__item--name`).text());
          $(`.${parentMenuClassname}.absolute .${parentMenuClassname}__form__email input`).val($(`.${parent} .${childMenuClassname}__container__row__item--email`).text());

          if (childMenuClassname === 'users') {
            $(`.${parentMenuClassname}.absolute .${parentMenuClassname}__form__userFirstName input`).val($(`.${parent} .${childMenuClassname}__container__row__item--firstname`).text());
            $(`.${parentMenuClassname}.absolute .${parentMenuClassname}__form__location select`).val($(`.${parent} .${childMenuClassname}__container__row__item--location_id`).text());
            $(`.${parentMenuClassname}.absolute .${parentMenuClassname}__form__type select`).val($(`.${parent} .${childMenuClassname}__container__row__item--hiddenType`).text());

            // Fill in the user's gender
            if ($(`.${parent} .${childMenuClassname}__container__row__item--gender`).text() === 'm') {
              $(`.${parentMenuClassname}.absolute .${parentMenuClassname}__form__male input`).attr('checked', true);
            } else {
              $(`.${parentMenuClassname}.absolute .${parentMenuClassname}__form__female input`).attr('checked', true);
            }
          }

          // The users form submit is handled in the register function !
          $(`.${parentMenuClassname}.absolute .${parentMenuClassname}__form__btnContainer__submit`).click(() => {
            // Update the web interface with the changes
            const updateFields = () => {
              $(`.${parent} .${childMenuClassname}__container__row__item--name`).text($(`.${parentMenuClassname}__form__name input`).val().replace(/\'\'/g, "'"));
              $(`.${parent} .${childMenuClassname}__container__row__item--email`).text($(`.${parentMenuClassname}__form__email input`).val());
            }

            if (childMenuClassname === 'users') {
              // Update the password field placeholder
              $('.register.absolute .register__form__password input').attr('placeholder', locales.form.passwd_generic);

              updateFields();
              $(`.${parent} .${childMenuClassname}__container__row__item--firstname`).text($(`.${parentMenuClassname}__form__userFirstName input`).val().replace(/\'\'/g, "'"));
              $(`.${parent} .${childMenuClassname}__container__row__item--location`).text($(`.${parentMenuClassname}__form__location option:selected`).text().replace(/\'\'/g, "'"));
              $(`.${parent} .${childMenuClassname}__container__row__item--hiddenType`).text($(`.${parentMenuClassname}__form__type option:selected`).val());

              $(`.${parent} .${childMenuClassname}__container__row__item--type`).text(userTypeSwitch($(`.${parentMenuClassname}__form__type option:selected`).val()));
            } else if (childMenuClassname === 'locations') {
              updateFields();
            }
          });
        });

        $('.context__list__item--del').click(function() {
          let record2delete = {};

          if (parent.match('users')) {
            record2delete.key = $(`.${parent} .users__container__row__item--id`).text();
            record2delete.table = 'users';
          } else if (parent.match('locations')) {
            record2delete.key = $(`.${parent} .locations__container__row__item--id`).text();
            record2delete.table = 'locations';
          } else if (parent.match('history')) {
            record2delete.table = 'tasks';
            record2delete.key = $(`.${parent} .history__results__container__row__item--id`).text();

            // Send a deletion confirmation if allowed by the admin
            if (globalSettings.sendrequestdeletionmail) {
              socket.emit('send mail', {
                type: 'deletion',
                id: record2delete.key,
                mail: {},
                sendcc: globalSettings.sendcc
              });
            }
          }

          confirmation();

          recordDelTimeOut = setTimeout(() => {
            // Hide the record from the interface
            $(`.${parent}`)
              .removeClass('flex')
              .addClass('hidden');

              console.log(record2delete);

            confirmation();
            socket.emit('delete data', record2delete);

            // Reset the deletionKey
            record2delete = {};

          }, 5000);
        });
      }
    }
  }

  // Show the right menu if the user click on another link of the sidebar while the other menu is visible
  const displayManagementMenu = (elts) => {
    for (const elt of elts) {

      $(`.${elt}Link`).click(() => {
        hideMenu('inRequests');

        for (const menu of elts) {
          if (menu !== elt) {
            hideMenu(menu);
          } else {
            showMenu(menu);
          }
        }

        $(`.home`)
          .removeClass('flex')
          .addClass('hidden');

        showMenu('returnIcon');
        showMenu('header__container__msg');

        socket.emit(`get ${elt}`);
      });
    }
  }

  displayManagementMenu(['users', 'locations', 'history']);

  socket.on(`users retrieved`, data => {
    handleData(data, 'register', 'users');
  });

  socket.on(`locations retrieved`, data => {
    // Avoid conflicts on other routes than the homepage
    if (window.location.pathname === '/') {
      handleData(data, 'addLocation', 'locations');
    }
  });

  socket.on('history retrieved', history => {
    handleData(history, 'inRequests', 'history__results');
  });

  $('.context__list__item').click(() => {
    $('.context')
      .removeClass('flex')
      .addClass('hidden');
  });

  $('.context__list__item--modify, .locations__header__addBtn, .users__header__addBtn').click(() => {
    hideForm('register', 'users');
    hideForm('addLocation', 'locations');
  });

  $('.confirmation__body__cancel').click(() => {
    clearTimeout(recordDelTimeOut);

    $(`.${parent}`)
      .removeClass('hidden')
      .addClass('flex');

    recordDelTimeOut = undefined;

    // Reset the deletionKey
    record2delete = {};
  });

  // Add data
  handleAdding('register', 'users');
  handleAdding('addLocation', 'locations');
};

manageUsers();
