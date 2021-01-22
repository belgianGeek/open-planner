let mousePosition = {};

const getMousePosition = () => {
  $(window).mousemove(event => {
    mousePosition.y = event.pageY;
  });

  if (mousePosition.y > ($(window).height() / 100 * 80)) {
    mousePosition.y = mousePosition.y - ($('.context.flex').height() + 20);
  }
}
