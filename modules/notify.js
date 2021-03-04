const notify = (io, type) => {
  io.emit('notification', {
    type: type
  });
}

module.exports = notify;
