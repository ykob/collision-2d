var width  = document.body.clientWidth * 2;
var height = document.body.clientHeight * 2;
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var fps = 60;
var frameTime = 1000 / fps;

var getRandomInt = function(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
};

var getDegree = function(radian) {
  return radian / Math.PI * 180;
};

var getRadian = function(degrees) {
  return degrees * Math.PI / 180;
};

var getDistance = function(p1x, p1y, p2x, p2y) {
  var distX = p1x - p2x;
  var distY = p1y - p2y;
  return Math.sqrt(distX * distX + distY * distY);
};

var debounce = function(object, eventType, callback){
  var timer;

  object.addEventListener(eventType, function(event) {
    clearTimeout(timer);
    timer = setTimeout(function(){
      callback(event);
    }, 500);
  }, false);
};

var canvasResize = function() {
  width  = document.body.clientWidth * 2;
  height = document.body.clientHeight * 2;

  canvas.width = width;
  canvas.height = height;
  canvas.style.width = width / 2 + 'px';
  canvas.style.height = height / 2 + 'px';
};

debounce(window, 'resize', function(event){
  canvasResize();
});

canvasResize();
