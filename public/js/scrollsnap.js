// THIRDS
(function () {
  var timer;
  $(window).on("touchmove scroll resize", function(event) {
    clearTimeout(timer);
    timer = setTimeout(function() {
      var b     = $('body')[0],
          width = b.scrollWidth - b.clientWidth,
          half  = Math.round(   b.scrollLeft / width   *2)/2;
      $('body').animate({scrollLeft: width * half});
    }, 50);
  });
})()
