const compress = (input, type, callback) => {
  const file = document.querySelector(input).files[0];
  if (!file) {
    return console.error('Compression failed because there is no file !');
  } else {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = event => {
      const img = document.createElement('img');
      img.src = event.target.result;

      img.onload = e => {
        const maxWidth = window.innerWidth;
        const canvas = document.createElement('canvas');
        canvas.height = e.target.height * (maxWidth / e.target.width);
        canvas.width = maxWidth;

        const ctx = canvas.getContext('2d');

        ctx.drawImage(e.target, 0, 0, canvas.width, canvas.height);
        const wallpaperEncoded = ctx.canvas.toDataURL(type, 0.8);
        callback(wallpaperEncoded);
      }
    }
  }
}
