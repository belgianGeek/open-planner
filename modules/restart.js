const restart = io => {
  io.on('restart', () => {
    console.log('Redémarrage en cours...');
    cp('sudo systemctl restart node-planner', (err, stdout, stderr) => {
      if (!err) {
        console.log(stdout);
      } else console.error(err);
    });
  });
}

module.exports = restart;
