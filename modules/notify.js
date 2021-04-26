const notify = (io, type, isImport = false, usersNb) => {
  io.emit('notification', {
    isImport: isImport,
    type: type,
    usersNb: usersNb
  });
}

module.exports = notify;
