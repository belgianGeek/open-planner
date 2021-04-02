const process = require('process');

const shutdown = io => {
  io.on('shutdown', () => {
    console.log('Extinction des feux !');
    process.exit(0);
  });
}

module.exports = shutdown;
