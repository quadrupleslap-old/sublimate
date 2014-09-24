window.customise = {
  imageSheet: $('<style>').appendTo('body'),
  displayImage: function () {
    var overlayColor, defaultColor
    if (localStorage.classicMode == "1") overlayColor = "rgba(255,255,255,0.7)", defaultColor = "#444"
    else                                 overlayColor = "rgba(0,0,0,0.7)",       defaultColor = "#000"

    var imageURL = localStorage.getItem('background-image') || ""

    this.imageSheet.html('html,.simpleMode {background: linear-gradient('+overlayColor+','+overlayColor+'), '+defaultColor+' url('+imageURL+');' +
                    'background-size: cover; background-attachment: fixed; background-position: center}'
                    )

  },
  requestImage: function () {
    var that = this
    var input = $("<input type='file' accept='image/*'>").click()
    input.on('change', function (e) { if ( input[0].files && input[0].files[0] ) {
      var FR = new FileReader()
      FR.onload = function(e) {
        dataURI = fitImageInBox(e.target.result, 1280, 720, function (b64) {
         localStorage.setItem('background-image', b64)
         that.displayImage()
        })
     }
     FR.readAsDataURL( input[0].files[0] )
   }})
  },
  filterNotices: function (year) {
    if (!year) return $('.notice').show()
    $(".notice").each(function (i, obj) {
      if ($(obj).data('years').indexOf(year) != -1) $(obj).show()
      else $(obj).hide()
    })
  }
}

$(function () {
  if (localStorage.noticeFilter)  $("#noticesFilterSelect").val(localStorage.noticeFilter)
  if (localStorage.classicMode == '1') $("html").addClass('classic')
  customise.displayImage()
})
