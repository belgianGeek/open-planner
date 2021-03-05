const check4updates = (io, tag) => {
  io.on('update check', () => {
    plannerUpdate(io, tag);
  });
}

module.exports = check4updates;
