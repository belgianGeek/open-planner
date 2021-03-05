const setDate = () => {
  $('.inRequests__form__requestInfo__row1__requestDate').val(`${new Date().getFullYear()}-${setMonth(new Date())}-${setDay(new Date())}`);
}

const setDay = date => {
  if (date.getDate() < 10) {
    return `0${date.getDate()}`;
  } else {
    return date.getDate();
  }
}

const setMonth = date => {
  if (date.getMonth() < 9) {
    return `0${date.getMonth() + 1}`;
  } else {
    return date.getMonth() + 1;
  }
}

setDate();
