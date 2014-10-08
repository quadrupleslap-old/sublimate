(function (selector,panels) {
  var dividers = panels - 1,
      dragThreshold = 0.15,
      dragStart = null,
      percentage = 0;

  function touchStart(event) { if (window.innerHeight > window.innerWidth) {
    if (dragStart !== null) { return; }
    if (event.originalEvent.touches) event = event.originalEvent.touches[0];
    dragStart = event.clientX;
  }}

  function touchMove (event) { if (window.innerHeight > window.innerWidth) {

    if (dragStart === null) { return; }
    if (event.originalEvent.touches) event = event.originalEvent.touches[0];

    var delta = dragStart - event.clientX;
    percentage = delta / $(selector).width();
  }}

  function touchEnd () { if (window.innerHeight > window.innerWidth) {
    dragStart = null;

    var element = $(selector)[0],
        width   = element.scrollWidth - element.clientWidth,
        sector  = Math.round(   element.scrollLeft / width   * dividers   )/dividers;

    if (percentage >= dragThreshold) sector += 1 / dividers;
    else if ( Math.abs(percentage) >= dragThreshold ) sector -= 1 / dividers;

    $(selector).animate({scrollLeft: width * sector});

    percentage = 0;
  }}

  $(selector).on({
    'touchstart': touchStart,
    'touchmove': touchMove,
    'touchend': touchEnd
  });
})(document.body,3);


