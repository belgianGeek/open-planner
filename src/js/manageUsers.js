let iDataRow = 0;
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
    .append(data.location_name)
    .appendTo(row);

  let locationID = $('<span></span>')
    .addClass('users__container__row__item users__container__row__item--location_id hidden')
    .append(data.location_id)
    .appendTo(row);

  let gender = $('<span></span>')
    .addClass('users__container__row__item users__container__row__item--gender hidden')
    .append(data.gender)
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

// Hide the header to prevent users from going back to the home page
const toggleHeader = () => $('.header__container').toggleClass('hidden flex');

const manageUsers = (parentMenuClassname, childMenuClassname) => {
  let parent;
  // Hide the form on btn click
  const hideForm = () => {
    $(`.${parentMenuClassname}.absolute .${parentMenuClassname}__form__btnContainer__hide`).click(function() {
      console.log('ok');
      $(`.${parentMenuClassname}`)
        .removeClass('absolute zero flex')
        .addClass('hidden');

      $(`.${childMenuClassname}`).removeClass('blur backgroundColor');

      // Hide the button to hide the form
      $(this).addClass('hidden');
    });
  }

  $(`.${childMenuClassname}Link`).click(() => {
    if ($(`.${childMenuClassname}`).hasClass('hidden')) {
      $(`.home`)
        .removeClass('flex')
        .addClass('hidden');
    }

    const hideMenu = classname => {
      if ($(`.${classname}`).is(':visible')) {
        $(`.${classname}`)
          .removeClass('flex')
          .addClass('hidden');
      }
    }

    const showMenu = classname => {
      if (!$(`.${classname}`).is(':visible')) {
        $(`.${classname}`)
          .removeClass('hidden')
          .addClass('flex');
      }
    }

    showMenu('returnIcon');
    showMenu('header__container__msg');

    // Show the right menu if the user click on another link of the sidebar while the other menu is visible
    if (childMenuClassname === 'users') {
      hideMenu('locations');
      showMenu('users');
    } else {
      hideMenu('users');
      showMenu('locations');
    }

    socket.emit(`get ${childMenuClassname}`);
  });

  socket.on(`${childMenuClassname} retrieved`, data => {
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
        } else {
          switch (column) {
            // Locations rows
            case 'location_name':
              columnTitle = 'Nom';
              break;
            case 'location_mail':
              columnTitle = 'Adresse email';
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
        } else {
          appendLocationRow(i, info);
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
          parent = $(this).attr('class').split(' ')[1];

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
      }
    }
  });

  $('.context__list__item').click(() => {
    $('.context')
      .removeClass('flex')
      .addClass('hidden');
  });

  $('.context__list__item--modify').click(function() {
    if ($('.users').hasClass('flex')) {
      $(`.register`)
        .addClass('absolute zero flex')
        .removeClass('hidden');

      $('.users').addClass('blur backgroundColor');
    } else if ($('.locations').hasClass('flex')) {
      $(`.addLocation`)
        .addClass('absolute zero flex')
        .removeClass('hidden');

      $('.locations').addClass('blur backgroundColor');
    }

    toggleHeader();

    hideForm();

    // Modify the title
    let sectionTitle;
    if (childMenuClassname === 'users') {
      sectionTitle = `Modification de l'utilisateur`;
    } else {
      sectionTitle = `Modification de l'implantation`;
    }

    $(`.${parentMenuClassname}__title`).text(`${sectionTitle} ${$(`.${parent} .${childMenuClassname}__container__row__item--firstname`).text()}
      ${$(`.${parent} .${childMenuClassname}__container__row__item--name`).text()}`);

    // Fill in all the fields with the selected record data
    $(`.${parentMenuClassname}.absolute .${parentMenuClassname}__form__userID`).val($(`.${parent} .${childMenuClassname}__container__row__item--id`).text());
    $(`.${parentMenuClassname}.absolute .${parentMenuClassname}__form__name input`).val($(`.${parent} .${childMenuClassname}__container__row__item--name`).text());
    $(`.${parentMenuClassname}.absolute .${parentMenuClassname}__form__email input`).val($(`.${parent} .${childMenuClassname}__container__row__item--email`).text());

    if (childMenuClassname === 'users') {
      // Modify the password field placeholder
      $(`.register.absolute .register__form__password input`).attr('placeholder', 'Mot de passe inchangé');

      $(`.${parentMenuClassname}.absolute .${parentMenuClassname}__form__userFirstName input`).val($(`.${parent} .${childMenuClassname}__container__row__item--firstname`).text());
      $(`.${parentMenuClassname}.absolute .${parentMenuClassname}__form__location select`).val($(`.${parent} .${childMenuClassname}__container__row__item--location_id`).text());
      $(`.${parentMenuClassname}.absolute .${parentMenuClassname}__form__type select`).val($(`.${parent} .${childMenuClassname}__container__row__item--type`).text());

      // Fill in the user's gender
      if ($(`.${parent} .${childMenuClassname}__container__row__item--gender`).text() === 'm') {
        $(`.${parentMenuClassname}.absolute .${parentMenuClassname}__form__male input`).attr('checked', true);
      } else {
        $(`.${parentMenuClassname}.absolute .${parentMenuClassname}__form__female input`).attr('checked', true);
      }
    }

    // The form submit is handled in the register function !
    $(`.${parentMenuClassname}.absolute .${parentMenuClassname}__form__btnContainer__submit`).click(() => {
      // Update the web interface with the changes
      $(`.${parent} .${childMenuClassname}__container__row__item--name`).text($(`.${parentMenuClassname}__form__name input`).val().replace(/\'\'/g, "'"));
      $(`.${parent} .${childMenuClassname}__container__row__item--email`).text($(`.${parentMenuClassname}__form__email input`).val());

      if (childMenuClassname === 'users') {
        $(`.${parent} .${childMenuClassname}__container__row__item--firstname`).text($(`.${parentMenuClassname}__form__userFirstName input`).val().replace(/\'\'/g, "'"));
        $(`.${parent} .${childMenuClassname}__container__row__item--location`).text($(`.${parentMenuClassname}__form__location option:selected`).text().replace(/\'\'/g, "'"));
        $(`.${parent} .${childMenuClassname}__container__row__item--type`).text($(`.${parentMenuClassname}__form__type option:selected`).val());
      }
    });
  });

  $('.context__list__item--del').click(function() {
    let record2delete = {
      key: $(`.${parent} .${childMenuClassname}__container__row__item--id`).text(),
      table: childMenuClassname
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

  // Add user
  $(`.${childMenuClassname}__header__addBtn`).click(function() {
    toggleHeader();

    $(`.${childMenuClassname}`).addClass('blur backgroundColor');

    // Set all the input fields to their default value
    $(`.${parentMenuClassname} input`).not('.radio').val('');
    $('.register select').val('default');

    // Hide warnign messages
    $('.register .warning, .addLocation .warning').hide();
    $('.input').removeClass('invalid');

    // Make sure the title is correct
    if (childMenuClassname === 'users') {
      $('.register__title').text('Ajouter un utilisateur');
    } else {
      $('.addLocation__title').text('Ajouter une implantation');
    }

    $(`.${parentMenuClassname}`)
      .addClass('absolute zero flex')
      .removeClass('hidden');

    hideForm();
  });

  $(`.${parentMenuClassname}.absolute .${parentMenuClassname}__form__btnContainer__submit`).click(function() {
    toggleHeader();

    $(`.${parentMenuClassname}`)
      .removeClass('absolute zero flex')
      .addClass('hidden');

    $(`.${childMenuClassname}`).removeClass('blur backgroundColor');
  });
}

manageUsers('register', 'users');
manageUsers('addLocation', 'locations');
