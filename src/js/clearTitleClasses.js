const clearRegisterTitleClasses = () => $('.register__title').removeClass('myAccountTitle updateUserTitle addUserTitle');

const clearAddLocationTitleClasses = () => $('.addLocation__title').removeClass('updateLocationTitle newLocationTitle');

const clearAllFormsTitleClasses = () => {
  clearRegisterTitleClasses();
  clearAddLocationTitleClasses();
}
