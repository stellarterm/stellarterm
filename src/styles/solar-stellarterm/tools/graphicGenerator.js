var glob = require('glob');
var sizeOf = require('image-size');
var path = require('path');

// PREREQUISITE: Install the npm package image-size and glob before running this

// currently only support for .png. .svg will be added when used
glob(__dirname + '/../graphics/**/*.png', function(er, files) {
  files.forEach(function(filepath) {
    var filename = path.basename(filepath);
    var basename = path.basename(filepath, '.png');
    var dimensions = sizeOf(filepath);
    console.log('.so-graphic-' + basename +
      ' { @include so-graphic("' + filename +
      '", ' + dimensions.width + ', ' + dimensions.height + '); @extend .so-graphic; }');
  })
})
