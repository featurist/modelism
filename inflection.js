exports.titleFromCamelCase = function(camel) {
  var char, prev;
  var title = '';
  for (var i = 0; i < camel.length; ++i) {
    var char = camel[i];
    if (i == 0) {
      char = char.toUpperCase();
    } else if (char == char.toUpperCase() &&
               prev == prev.toLowerCase()) {
      char = ' ' + char;
    }
    title += char;
    prev = char;
  }
  return title;
}
