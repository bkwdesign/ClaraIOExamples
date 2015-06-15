var snap = "<li><button class='btn snap'>Snapshot</button></li>";
$('ul.controls').append(snap);
$('.snap').on('click', function(e) {
  e.preventDefault();
  console.log('snap');
  $('#clara-embed').clara('screenshot', {callback: function(err, result) {
    console.log('result: ', err, result);
    if (!err && result.image) {
      $('img.screenshot').attr('src', result.image);
    }
  }});
});