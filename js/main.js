(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function(object, eventType, callback){
  var timer;

  object.addEventListener(eventType, function(event) {
    clearTimeout(timer);
    timer = setTimeout(function(){
      callback(event);
    }, 500);
  }, false);
};

},{}],2:[function(require,module,exports){
var Util = require('./util');
var util = new Util();
var Vector2 = require('./vector2');
var Mover = require('./mover');
var debounce = require('./debounce');

var body_width  = document.body.clientWidth * 2;
var body_height = document.body.clientHeight * 2;
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var fps = 60;
var last_time_render = Date.now();

var moversNum = 30;
var movers = [];

var init = function() {
  for (var i = 0; i < moversNum; i++) {
    var mover = new Mover();
    var radian = util.getRadian(util.getRandomInt(0, 360));
    var scalar = util.getRandomInt(20, 40);
    var fource = new Vector2(Math.cos(radian) * scalar, Math.sin(radian) * scalar);
    var x = util.getRandomInt(mover.radius, body_width - mover.radius);
    var y = util.getRandomInt(mover.radius, body_height - mover.radius);
    var x = body_width / 2;
    var y = body_height / 2;
    
    mover.radius = util.getRandomInt(body_width / 30, body_width/ 20);
    mover.mass = mover.radius / 10;
    mover.position.set(x, y);
    mover.velocity.set(x, y);
    fource.divScalar(mover.mass);
    mover.applyFource(fource);
    movers[i] = mover;
  }
  
  setEvent();
  resizeCanvas();
  renderloop();
  debounce(window, 'resize', function(event){
    resizeCanvas();
  });
};

var updateMover = function() {
  for (var i = 0; i < movers.length; i++) {
    var mover = movers[i];
    var collision = false;
    
    mover.move();
    // 加速度が0になったときに再度力を加える。
    if (mover.acceleration.length() <= 1) {
      var radian = util.getRadian(util.getRandomInt(0, 360));
      var scalar = util.getRandomInt(40, 60);
      var fource = new Vector2(Math.cos(radian) * scalar, Math.sin(radian) * scalar);
      
      fource.divScalar(mover.mass);
      mover.applyFource(fource);
    }
    // 壁との衝突判定
    if (mover.position.y - mover.radius < 0) {
      var normal = new Vector2(0, 1);
      mover.velocity.y = mover.radius;
      collision = true;
    } else if (mover.position.y + mover.radius > body_height) {
      var normal = new Vector2(0, -1);
      mover.velocity.y = body_height - mover.radius;
      collision = true;
    } else if (mover.position.x - mover.radius < 0) {
      var normal = new Vector2(1, 0);
      mover.velocity.x = mover.radius;
      collision = true;
    } else if (mover.position.x + mover.radius > body_width) {
      var normal = new Vector2(-1, 0);
      mover.velocity.x = body_width - mover.radius;
      collision = true;
    }
    if (collision) {
      mover.rebound(normal);
    }
    for (var index = i + 1; index < movers.length; index++) {
      var distance = mover.velocity.distanceTo(movers[index].velocity);
      var rebound_distance = mover.radius + movers[index].radius;
      if (distance < rebound_distance) {
        var overlap = Math.abs(distance - rebound_distance);
        var normal = mover.velocity.clone().sub(movers[index].velocity).normalize();
        mover.velocity.sub(normal.clone().multScalar(overlap * -1));
        movers[index].velocity.sub(normal.clone().multScalar(overlap));
        mover.rebound(normal.clone().multScalar(-1));
        movers[index].rebound(normal.clone());
      }
    }
    if (mover.velocity.distanceTo(mover.position) >= 1) {
      mover.updatePosition();
    }
    mover.draw(ctx);
  }
};

var render = function() {
  ctx.clearRect(0, 0, body_width, body_height);
  updateMover();
};

var renderloop = function() {
  var now = Date.now();
  requestAnimationFrame(renderloop);
  if (now - last_time_render > 1000 / fps) {
    render();
    last_time_render = Date.now();
  }
};

var resizeCanvas = function() {
  body_width  = document.body.clientWidth * 2;
  body_height = document.body.clientHeight * 2;

  canvas.width = body_width;
  canvas.height = body_height;
  canvas.style.width = body_width / 2 + 'px';
  canvas.style.height = body_height / 2 + 'px';
};

var setEvent = function () {
  var eventTouchStart = function(x, y) {
  };
  
  var eventTouchMove = function(x, y) {
  };
  
  var eventTouchEnd = function(x, y) {
  };

  canvas.addEventListener('contextmenu', function (event) {
    event.preventDefault();
  });

  canvas.addEventListener('selectstart', function (event) {
    event.preventDefault();
  });

  canvas.addEventListener('mousedown', function (event) {
    event.preventDefault();
    eventTouchStart(event.clientX, event.clientY);
  });

  canvas.addEventListener('mousemove', function (event) {
    event.preventDefault();
    eventTouchMove(event.clientX, event.clientY);
  });

  canvas.addEventListener('mouseup', function (event) {
    event.preventDefault();
    eventTouchEnd();
  });

  canvas.addEventListener('touchstart', function (event) {
    event.preventDefault();
    eventTouchStart(event.touches[0].clientX, event.touches[0].clientY);
  });

  canvas.addEventListener('touchmove', function (event) {
    event.preventDefault();
    eventTouchMove(event.touches[0].clientX, event.touches[0].clientY);
  });

  canvas.addEventListener('touchend', function (event) {
    event.preventDefault();
    eventTouchEnd();
  });
};

init();

},{"./debounce":1,"./mover":3,"./util":4,"./vector2":5}],3:[function(require,module,exports){
var Util = require('./util');
var util = new Util();
var Vector2 = require('./vector2');

var exports = function(){
  var Mover = function() {
    this.radius = 0;
    this.mass = 0;
    this.position = new Vector2();
    this.velocity = new Vector2();
    this.acceleration = new Vector2();
    this.direction = 0;
    this.r = util.getRandomInt(60, 120);
    this.g = util.getRandomInt(120, 180);
    this.b = util.getRandomInt(180, 220);
  };
  
  Mover.prototype = {
    move: function() {
      this.applyFriction();
      this.velocity.add(this.acceleration);
      if (this.velocity.distanceTo(this.position) >= 1) {
        this.direct(this.velocity);
      }
    },
    updatePosition: function() {
      this.position.copy(this.velocity);
    },
    applyFource: function(vector) {
      this.acceleration.add(vector);
    },
    applyFriction: function() {
      var friction = this.acceleration.clone();
      friction.multScalar(-1);
      friction.normalize();
      friction.multScalar(0.1);
      this.applyFource(friction);
    },
    direct: function(vector) {
      var v = vector.clone().sub(this.position);
      this.direction = Math.atan2(v.y, v.x);
    },
    rebound: function(vector) {
      var dot = this.acceleration.clone().dot(vector);
      this.acceleration.sub(vector.multScalar(2 * dot));
      this.acceleration.multScalar(0.8);
    },
    draw: function(context) {
      context.lineWidth = 8;

      context.fillStyle = 'rgb(' + this.r + ',' + this.g + ',' + this.b + ')';
      context.beginPath();
      context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI / 180, true);
      // context.shadowColor = '#333'
      // context.shadowOffsetX = 0;
      // context.shadowOffsetY = 0;
      // context.shadowBlur = 200;
      context.fill();
      
      // context.strokeStyle = '#ffffff';
      // context.beginPath();
      // context.moveTo(this.position.x, this.position.y);
      // context.lineTo(this.position.x + Math.cos(this.direction) * this.radius, this.position.y + Math.sin(this.direction) * this.radius);
      // context.stroke();
    }
  };
  
  return Mover;
};

module.exports = exports();

},{"./util":4,"./vector2":5}],4:[function(require,module,exports){
var exports = function(){
  var Util = function() {};
  
  Util.prototype.getRandomInt = function(min, max){
    return Math.floor(Math.random() * (max - min)) + min;
  };
  
  Util.prototype.getDegree = function(radian) {
    return radian / Math.PI * 180;
  };
  
  Util.prototype.getRadian = function(degrees) {
    return degrees * Math.PI / 180;
  };
  
  Util.prototype.getSpherical = function(rad1, rad2, r) {
    var x = Math.cos(rad1) * Math.cos(rad2) * r;
    var z = Math.cos(rad1) * Math.sin(rad2) * r;
    var y = Math.sin(rad1) * r;
    return [x, y, z];
  };
  
  return Util;
};

module.exports = exports();

},{}],5:[function(require,module,exports){
// 
// このVector2クラスは、three.jsのTHREE.Vector2クラスの計算式の一部を利用しています。
// https://github.com/mrdoob/three.js/blob/master/src/math/Vector2.js#L367
// 

var exports = function(){
  var Vector2 = function(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  };
  
  Vector2.prototype = {
    set: function (x, y) {
      this.x = x;
      this.y = y;
      return this;
    },
    copy: function (v) {
      this.x = v.x;
      this.y = v.y;
      return this;
    },
    add: function (v) {
      this.x += v.x;
      this.y += v.y;
      return this;
    },
    addScalar: function (s) {
      this.x += s;
      this.y += s;
      return this;
    },
    sub: function (v) {
      this.x -= v.x;
      this.y -= v.y;
      return this;
    },
    subScalar: function (s) {
      this.x -= s;
      this.y -= s;
      return this;
    },
    mult: function (v) {
      this.x *= v.x;
      this.y *= v.y;
      return this;
    },
    multScalar: function (s) {
      this.x *= s;
      this.y *= s;
      return this;
    },
    div: function (v) {
      this.x /= v.x;
      this.y /= v.y;
      return this;
    },
    divScalar: function (s) {
      this.x /= s;
      this.y /= s;
      return this;
    },
    min: function (v) {
      if ( this.x < v.x ) this.x = v.x;
      if ( this.y < v.y ) this.y = v.y;
      return this;
    },
    max: function (v) {
      if ( this.x > v.x ) this.x = v.x;
      if ( this.y > v.y ) this.y = v.y;
      return this;
    },
    clamp: function (v_min, v_max) {
      if ( this.x < v_min.x ) {
        this.x = v_min.x;
      } else if ( this.x > v_max.x ) {
        this.x = v_max.x;
      }
      if ( this.y < v_min.y ) {
        this.y = v_min.y;
      } else if ( this.y > v_max.y ) {
        this.y = v_max.y;
      }
      return this;
    },
    floor: function () {
      this.x = Math.floor( this.x );
      this.y = Math.floor( this.y );
      return this;
    },
    ceil: function () {
      this.x = Math.ceil( this.x );
      this.y = Math.ceil( this.y );
      return this;
    },
    round: function () {
      this.x = Math.round( this.x );
      this.y = Math.round( this.y );
      return this;
    },
    roundToZero: function () {
      this.x = ( this.x < 0 ) ? Math.ceil( this.x ) : Math.floor( this.x );
      this.y = ( this.y < 0 ) ? Math.ceil( this.y ) : Math.floor( this.y );
      return this;
    },
    negate: function () {
      this.x = - this.x;
      this.y = - this.y;
      return this;
    },
    dot: function (v) {
      return this.x * v.x + this.y * v.y;
    },
    lengthSq: function () {
      return this.x * this.x + this.y * this.y;
    },
    length: function () {
      return Math.sqrt(this.lengthSq());
    },
    normalize: function () {
      return this.divScalar(this.length());
    },
    distanceTo: function (v) {
      var dx = this.x - v.x;
      var dy = this.y - v.y;
      return Math.sqrt(dx * dx + dy * dy);
    },
    setLength: function (l) {
      var oldLength = this.length();
      if ( oldLength !== 0 && l !== oldLength ) {
        this.multScalar(l / oldLength);
      }
      return this;
    },
    clone: function () {
      return new Vector2(this.x, this.y);
    }
  }

  return Vector2;
};

module.exports = exports();

},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvZGVib3VuY2UuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy9tb3Zlci5qcyIsInNyYy9qcy91dGlsLmpzIiwic3JjL2pzL3ZlY3RvcjIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9iamVjdCwgZXZlbnRUeXBlLCBjYWxsYmFjayl7XG4gIHZhciB0aW1lcjtcblxuICBvYmplY3QuYWRkRXZlbnRMaXN0ZW5lcihldmVudFR5cGUsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICB0aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgIGNhbGxiYWNrKGV2ZW50KTtcbiAgICB9LCA1MDApO1xuICB9LCBmYWxzZSk7XG59O1xuIiwidmFyIFV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcbnZhciB1dGlsID0gbmV3IFV0aWwoKTtcbnZhciBWZWN0b3IyID0gcmVxdWlyZSgnLi92ZWN0b3IyJyk7XG52YXIgTW92ZXIgPSByZXF1aXJlKCcuL21vdmVyJyk7XG52YXIgZGVib3VuY2UgPSByZXF1aXJlKCcuL2RlYm91bmNlJyk7XG5cbnZhciBib2R5X3dpZHRoICA9IGRvY3VtZW50LmJvZHkuY2xpZW50V2lkdGggKiAyO1xudmFyIGJvZHlfaGVpZ2h0ID0gZG9jdW1lbnQuYm9keS5jbGllbnRIZWlnaHQgKiAyO1xudmFyIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXMnKTtcbnZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbnZhciBmcHMgPSA2MDtcbnZhciBsYXN0X3RpbWVfcmVuZGVyID0gRGF0ZS5ub3coKTtcblxudmFyIG1vdmVyc051bSA9IDMwO1xudmFyIG1vdmVycyA9IFtdO1xuXG52YXIgaW5pdCA9IGZ1bmN0aW9uKCkge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG1vdmVyc051bTsgaSsrKSB7XG4gICAgdmFyIG1vdmVyID0gbmV3IE1vdmVyKCk7XG4gICAgdmFyIHJhZGlhbiA9IHV0aWwuZ2V0UmFkaWFuKHV0aWwuZ2V0UmFuZG9tSW50KDAsIDM2MCkpO1xuICAgIHZhciBzY2FsYXIgPSB1dGlsLmdldFJhbmRvbUludCgyMCwgNDApO1xuICAgIHZhciBmb3VyY2UgPSBuZXcgVmVjdG9yMihNYXRoLmNvcyhyYWRpYW4pICogc2NhbGFyLCBNYXRoLnNpbihyYWRpYW4pICogc2NhbGFyKTtcbiAgICB2YXIgeCA9IHV0aWwuZ2V0UmFuZG9tSW50KG1vdmVyLnJhZGl1cywgYm9keV93aWR0aCAtIG1vdmVyLnJhZGl1cyk7XG4gICAgdmFyIHkgPSB1dGlsLmdldFJhbmRvbUludChtb3Zlci5yYWRpdXMsIGJvZHlfaGVpZ2h0IC0gbW92ZXIucmFkaXVzKTtcbiAgICB2YXIgeCA9IGJvZHlfd2lkdGggLyAyO1xuICAgIHZhciB5ID0gYm9keV9oZWlnaHQgLyAyO1xuICAgIFxuICAgIG1vdmVyLnJhZGl1cyA9IHV0aWwuZ2V0UmFuZG9tSW50KGJvZHlfd2lkdGggLyAzMCwgYm9keV93aWR0aC8gMjApO1xuICAgIG1vdmVyLm1hc3MgPSBtb3Zlci5yYWRpdXMgLyAxMDtcbiAgICBtb3Zlci5wb3NpdGlvbi5zZXQoeCwgeSk7XG4gICAgbW92ZXIudmVsb2NpdHkuc2V0KHgsIHkpO1xuICAgIGZvdXJjZS5kaXZTY2FsYXIobW92ZXIubWFzcyk7XG4gICAgbW92ZXIuYXBwbHlGb3VyY2UoZm91cmNlKTtcbiAgICBtb3ZlcnNbaV0gPSBtb3ZlcjtcbiAgfVxuICBcbiAgc2V0RXZlbnQoKTtcbiAgcmVzaXplQ2FudmFzKCk7XG4gIHJlbmRlcmxvb3AoKTtcbiAgZGVib3VuY2Uod2luZG93LCAncmVzaXplJywgZnVuY3Rpb24oZXZlbnQpe1xuICAgIHJlc2l6ZUNhbnZhcygpO1xuICB9KTtcbn07XG5cbnZhciB1cGRhdGVNb3ZlciA9IGZ1bmN0aW9uKCkge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG1vdmVycy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBtb3ZlciA9IG1vdmVyc1tpXTtcbiAgICB2YXIgY29sbGlzaW9uID0gZmFsc2U7XG4gICAgXG4gICAgbW92ZXIubW92ZSgpO1xuICAgIC8vIOWKoOmAn+W6puOBjDDjgavjgarjgaPjgZ/jgajjgY3jgavlho3luqblipvjgpLliqDjgYjjgovjgIJcbiAgICBpZiAobW92ZXIuYWNjZWxlcmF0aW9uLmxlbmd0aCgpIDw9IDEpIHtcbiAgICAgIHZhciByYWRpYW4gPSB1dGlsLmdldFJhZGlhbih1dGlsLmdldFJhbmRvbUludCgwLCAzNjApKTtcbiAgICAgIHZhciBzY2FsYXIgPSB1dGlsLmdldFJhbmRvbUludCg0MCwgNjApO1xuICAgICAgdmFyIGZvdXJjZSA9IG5ldyBWZWN0b3IyKE1hdGguY29zKHJhZGlhbikgKiBzY2FsYXIsIE1hdGguc2luKHJhZGlhbikgKiBzY2FsYXIpO1xuICAgICAgXG4gICAgICBmb3VyY2UuZGl2U2NhbGFyKG1vdmVyLm1hc3MpO1xuICAgICAgbW92ZXIuYXBwbHlGb3VyY2UoZm91cmNlKTtcbiAgICB9XG4gICAgLy8g5aOB44Go44Gu6KGd56qB5Yik5a6aXG4gICAgaWYgKG1vdmVyLnBvc2l0aW9uLnkgLSBtb3Zlci5yYWRpdXMgPCAwKSB7XG4gICAgICB2YXIgbm9ybWFsID0gbmV3IFZlY3RvcjIoMCwgMSk7XG4gICAgICBtb3Zlci52ZWxvY2l0eS55ID0gbW92ZXIucmFkaXVzO1xuICAgICAgY29sbGlzaW9uID0gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKG1vdmVyLnBvc2l0aW9uLnkgKyBtb3Zlci5yYWRpdXMgPiBib2R5X2hlaWdodCkge1xuICAgICAgdmFyIG5vcm1hbCA9IG5ldyBWZWN0b3IyKDAsIC0xKTtcbiAgICAgIG1vdmVyLnZlbG9jaXR5LnkgPSBib2R5X2hlaWdodCAtIG1vdmVyLnJhZGl1cztcbiAgICAgIGNvbGxpc2lvbiA9IHRydWU7XG4gICAgfSBlbHNlIGlmIChtb3Zlci5wb3NpdGlvbi54IC0gbW92ZXIucmFkaXVzIDwgMCkge1xuICAgICAgdmFyIG5vcm1hbCA9IG5ldyBWZWN0b3IyKDEsIDApO1xuICAgICAgbW92ZXIudmVsb2NpdHkueCA9IG1vdmVyLnJhZGl1cztcbiAgICAgIGNvbGxpc2lvbiA9IHRydWU7XG4gICAgfSBlbHNlIGlmIChtb3Zlci5wb3NpdGlvbi54ICsgbW92ZXIucmFkaXVzID4gYm9keV93aWR0aCkge1xuICAgICAgdmFyIG5vcm1hbCA9IG5ldyBWZWN0b3IyKC0xLCAwKTtcbiAgICAgIG1vdmVyLnZlbG9jaXR5LnggPSBib2R5X3dpZHRoIC0gbW92ZXIucmFkaXVzO1xuICAgICAgY29sbGlzaW9uID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKGNvbGxpc2lvbikge1xuICAgICAgbW92ZXIucmVib3VuZChub3JtYWwpO1xuICAgIH1cbiAgICBmb3IgKHZhciBpbmRleCA9IGkgKyAxOyBpbmRleCA8IG1vdmVycy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIHZhciBkaXN0YW5jZSA9IG1vdmVyLnZlbG9jaXR5LmRpc3RhbmNlVG8obW92ZXJzW2luZGV4XS52ZWxvY2l0eSk7XG4gICAgICB2YXIgcmVib3VuZF9kaXN0YW5jZSA9IG1vdmVyLnJhZGl1cyArIG1vdmVyc1tpbmRleF0ucmFkaXVzO1xuICAgICAgaWYgKGRpc3RhbmNlIDwgcmVib3VuZF9kaXN0YW5jZSkge1xuICAgICAgICB2YXIgb3ZlcmxhcCA9IE1hdGguYWJzKGRpc3RhbmNlIC0gcmVib3VuZF9kaXN0YW5jZSk7XG4gICAgICAgIHZhciBub3JtYWwgPSBtb3Zlci52ZWxvY2l0eS5jbG9uZSgpLnN1Yihtb3ZlcnNbaW5kZXhdLnZlbG9jaXR5KS5ub3JtYWxpemUoKTtcbiAgICAgICAgbW92ZXIudmVsb2NpdHkuc3ViKG5vcm1hbC5jbG9uZSgpLm11bHRTY2FsYXIob3ZlcmxhcCAqIC0xKSk7XG4gICAgICAgIG1vdmVyc1tpbmRleF0udmVsb2NpdHkuc3ViKG5vcm1hbC5jbG9uZSgpLm11bHRTY2FsYXIob3ZlcmxhcCkpO1xuICAgICAgICBtb3Zlci5yZWJvdW5kKG5vcm1hbC5jbG9uZSgpLm11bHRTY2FsYXIoLTEpKTtcbiAgICAgICAgbW92ZXJzW2luZGV4XS5yZWJvdW5kKG5vcm1hbC5jbG9uZSgpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKG1vdmVyLnZlbG9jaXR5LmRpc3RhbmNlVG8obW92ZXIucG9zaXRpb24pID49IDEpIHtcbiAgICAgIG1vdmVyLnVwZGF0ZVBvc2l0aW9uKCk7XG4gICAgfVxuICAgIG1vdmVyLmRyYXcoY3R4KTtcbiAgfVxufTtcblxudmFyIHJlbmRlciA9IGZ1bmN0aW9uKCkge1xuICBjdHguY2xlYXJSZWN0KDAsIDAsIGJvZHlfd2lkdGgsIGJvZHlfaGVpZ2h0KTtcbiAgdXBkYXRlTW92ZXIoKTtcbn07XG5cbnZhciByZW5kZXJsb29wID0gZnVuY3Rpb24oKSB7XG4gIHZhciBub3cgPSBEYXRlLm5vdygpO1xuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVuZGVybG9vcCk7XG4gIGlmIChub3cgLSBsYXN0X3RpbWVfcmVuZGVyID4gMTAwMCAvIGZwcykge1xuICAgIHJlbmRlcigpO1xuICAgIGxhc3RfdGltZV9yZW5kZXIgPSBEYXRlLm5vdygpO1xuICB9XG59O1xuXG52YXIgcmVzaXplQ2FudmFzID0gZnVuY3Rpb24oKSB7XG4gIGJvZHlfd2lkdGggID0gZG9jdW1lbnQuYm9keS5jbGllbnRXaWR0aCAqIDI7XG4gIGJvZHlfaGVpZ2h0ID0gZG9jdW1lbnQuYm9keS5jbGllbnRIZWlnaHQgKiAyO1xuXG4gIGNhbnZhcy53aWR0aCA9IGJvZHlfd2lkdGg7XG4gIGNhbnZhcy5oZWlnaHQgPSBib2R5X2hlaWdodDtcbiAgY2FudmFzLnN0eWxlLndpZHRoID0gYm9keV93aWR0aCAvIDIgKyAncHgnO1xuICBjYW52YXMuc3R5bGUuaGVpZ2h0ID0gYm9keV9oZWlnaHQgLyAyICsgJ3B4Jztcbn07XG5cbnZhciBzZXRFdmVudCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGV2ZW50VG91Y2hTdGFydCA9IGZ1bmN0aW9uKHgsIHkpIHtcbiAgfTtcbiAgXG4gIHZhciBldmVudFRvdWNoTW92ZSA9IGZ1bmN0aW9uKHgsIHkpIHtcbiAgfTtcbiAgXG4gIHZhciBldmVudFRvdWNoRW5kID0gZnVuY3Rpb24oeCwgeSkge1xuICB9O1xuXG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdjb250ZXh0bWVudScsIGZ1bmN0aW9uIChldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gIH0pO1xuXG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdzZWxlY3RzdGFydCcsIGZ1bmN0aW9uIChldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gIH0pO1xuXG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGV2ZW50VG91Y2hTdGFydChldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZKTtcbiAgfSk7XG5cbiAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGZ1bmN0aW9uIChldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgZXZlbnRUb3VjaE1vdmUoZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSk7XG4gIH0pO1xuXG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBldmVudFRvdWNoRW5kKCk7XG4gIH0pO1xuXG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBldmVudFRvdWNoU3RhcnQoZXZlbnQudG91Y2hlc1swXS5jbGllbnRYLCBldmVudC50b3VjaGVzWzBdLmNsaWVudFkpO1xuICB9KTtcblxuICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBldmVudFRvdWNoTW92ZShldmVudC50b3VjaGVzWzBdLmNsaWVudFgsIGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WSk7XG4gIH0pO1xuXG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIGZ1bmN0aW9uIChldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgZXZlbnRUb3VjaEVuZCgpO1xuICB9KTtcbn07XG5cbmluaXQoKTtcbiIsInZhciBVdGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG52YXIgdXRpbCA9IG5ldyBVdGlsKCk7XG52YXIgVmVjdG9yMiA9IHJlcXVpcmUoJy4vdmVjdG9yMicpO1xuXG52YXIgZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XG4gIHZhciBNb3ZlciA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucmFkaXVzID0gMDtcbiAgICB0aGlzLm1hc3MgPSAwO1xuICAgIHRoaXMucG9zaXRpb24gPSBuZXcgVmVjdG9yMigpO1xuICAgIHRoaXMudmVsb2NpdHkgPSBuZXcgVmVjdG9yMigpO1xuICAgIHRoaXMuYWNjZWxlcmF0aW9uID0gbmV3IFZlY3RvcjIoKTtcbiAgICB0aGlzLmRpcmVjdGlvbiA9IDA7XG4gICAgdGhpcy5yID0gdXRpbC5nZXRSYW5kb21JbnQoNjAsIDEyMCk7XG4gICAgdGhpcy5nID0gdXRpbC5nZXRSYW5kb21JbnQoMTIwLCAxODApO1xuICAgIHRoaXMuYiA9IHV0aWwuZ2V0UmFuZG9tSW50KDE4MCwgMjIwKTtcbiAgfTtcbiAgXG4gIE1vdmVyLnByb3RvdHlwZSA9IHtcbiAgICBtb3ZlOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuYXBwbHlGcmljdGlvbigpO1xuICAgICAgdGhpcy52ZWxvY2l0eS5hZGQodGhpcy5hY2NlbGVyYXRpb24pO1xuICAgICAgaWYgKHRoaXMudmVsb2NpdHkuZGlzdGFuY2VUbyh0aGlzLnBvc2l0aW9uKSA+PSAxKSB7XG4gICAgICAgIHRoaXMuZGlyZWN0KHRoaXMudmVsb2NpdHkpO1xuICAgICAgfVxuICAgIH0sXG4gICAgdXBkYXRlUG9zaXRpb246IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5wb3NpdGlvbi5jb3B5KHRoaXMudmVsb2NpdHkpO1xuICAgIH0sXG4gICAgYXBwbHlGb3VyY2U6IGZ1bmN0aW9uKHZlY3Rvcikge1xuICAgICAgdGhpcy5hY2NlbGVyYXRpb24uYWRkKHZlY3Rvcik7XG4gICAgfSxcbiAgICBhcHBseUZyaWN0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBmcmljdGlvbiA9IHRoaXMuYWNjZWxlcmF0aW9uLmNsb25lKCk7XG4gICAgICBmcmljdGlvbi5tdWx0U2NhbGFyKC0xKTtcbiAgICAgIGZyaWN0aW9uLm5vcm1hbGl6ZSgpO1xuICAgICAgZnJpY3Rpb24ubXVsdFNjYWxhcigwLjEpO1xuICAgICAgdGhpcy5hcHBseUZvdXJjZShmcmljdGlvbik7XG4gICAgfSxcbiAgICBkaXJlY3Q6IGZ1bmN0aW9uKHZlY3Rvcikge1xuICAgICAgdmFyIHYgPSB2ZWN0b3IuY2xvbmUoKS5zdWIodGhpcy5wb3NpdGlvbik7XG4gICAgICB0aGlzLmRpcmVjdGlvbiA9IE1hdGguYXRhbjIodi55LCB2LngpO1xuICAgIH0sXG4gICAgcmVib3VuZDogZnVuY3Rpb24odmVjdG9yKSB7XG4gICAgICB2YXIgZG90ID0gdGhpcy5hY2NlbGVyYXRpb24uY2xvbmUoKS5kb3QodmVjdG9yKTtcbiAgICAgIHRoaXMuYWNjZWxlcmF0aW9uLnN1Yih2ZWN0b3IubXVsdFNjYWxhcigyICogZG90KSk7XG4gICAgICB0aGlzLmFjY2VsZXJhdGlvbi5tdWx0U2NhbGFyKDAuOCk7XG4gICAgfSxcbiAgICBkcmF3OiBmdW5jdGlvbihjb250ZXh0KSB7XG4gICAgICBjb250ZXh0LmxpbmVXaWR0aCA9IDg7XG5cbiAgICAgIGNvbnRleHQuZmlsbFN0eWxlID0gJ3JnYignICsgdGhpcy5yICsgJywnICsgdGhpcy5nICsgJywnICsgdGhpcy5iICsgJyknO1xuICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgIGNvbnRleHQuYXJjKHRoaXMucG9zaXRpb24ueCwgdGhpcy5wb3NpdGlvbi55LCB0aGlzLnJhZGl1cywgMCwgTWF0aC5QSSAvIDE4MCwgdHJ1ZSk7XG4gICAgICAvLyBjb250ZXh0LnNoYWRvd0NvbG9yID0gJyMzMzMnXG4gICAgICAvLyBjb250ZXh0LnNoYWRvd09mZnNldFggPSAwO1xuICAgICAgLy8gY29udGV4dC5zaGFkb3dPZmZzZXRZID0gMDtcbiAgICAgIC8vIGNvbnRleHQuc2hhZG93Qmx1ciA9IDIwMDtcbiAgICAgIGNvbnRleHQuZmlsbCgpO1xuICAgICAgXG4gICAgICAvLyBjb250ZXh0LnN0cm9rZVN0eWxlID0gJyNmZmZmZmYnO1xuICAgICAgLy8gY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgIC8vIGNvbnRleHQubW92ZVRvKHRoaXMucG9zaXRpb24ueCwgdGhpcy5wb3NpdGlvbi55KTtcbiAgICAgIC8vIGNvbnRleHQubGluZVRvKHRoaXMucG9zaXRpb24ueCArIE1hdGguY29zKHRoaXMuZGlyZWN0aW9uKSAqIHRoaXMucmFkaXVzLCB0aGlzLnBvc2l0aW9uLnkgKyBNYXRoLnNpbih0aGlzLmRpcmVjdGlvbikgKiB0aGlzLnJhZGl1cyk7XG4gICAgICAvLyBjb250ZXh0LnN0cm9rZSgpO1xuICAgIH1cbiAgfTtcbiAgXG4gIHJldHVybiBNb3Zlcjtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cygpO1xuIiwidmFyIGV4cG9ydHMgPSBmdW5jdGlvbigpe1xuICB2YXIgVXRpbCA9IGZ1bmN0aW9uKCkge307XG4gIFxuICBVdGlsLnByb3RvdHlwZS5nZXRSYW5kb21JbnQgPSBmdW5jdGlvbihtaW4sIG1heCl7XG4gICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4pKSArIG1pbjtcbiAgfTtcbiAgXG4gIFV0aWwucHJvdG90eXBlLmdldERlZ3JlZSA9IGZ1bmN0aW9uKHJhZGlhbikge1xuICAgIHJldHVybiByYWRpYW4gLyBNYXRoLlBJICogMTgwO1xuICB9O1xuICBcbiAgVXRpbC5wcm90b3R5cGUuZ2V0UmFkaWFuID0gZnVuY3Rpb24oZGVncmVlcykge1xuICAgIHJldHVybiBkZWdyZWVzICogTWF0aC5QSSAvIDE4MDtcbiAgfTtcbiAgXG4gIFV0aWwucHJvdG90eXBlLmdldFNwaGVyaWNhbCA9IGZ1bmN0aW9uKHJhZDEsIHJhZDIsIHIpIHtcbiAgICB2YXIgeCA9IE1hdGguY29zKHJhZDEpICogTWF0aC5jb3MocmFkMikgKiByO1xuICAgIHZhciB6ID0gTWF0aC5jb3MocmFkMSkgKiBNYXRoLnNpbihyYWQyKSAqIHI7XG4gICAgdmFyIHkgPSBNYXRoLnNpbihyYWQxKSAqIHI7XG4gICAgcmV0dXJuIFt4LCB5LCB6XTtcbiAgfTtcbiAgXG4gIHJldHVybiBVdGlsO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzKCk7XG4iLCIvLyBcbi8vIOOBk+OBrlZlY3RvcjLjgq/jg6njgrnjga/jgIF0aHJlZS5qc+OBrlRIUkVFLlZlY3RvcjLjgq/jg6njgrnjga7oqIjnrpflvI/jga7kuIDpg6jjgpLliKnnlKjjgZfjgabjgYTjgb7jgZnjgIJcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9tcmRvb2IvdGhyZWUuanMvYmxvYi9tYXN0ZXIvc3JjL21hdGgvVmVjdG9yMi5qcyNMMzY3XG4vLyBcblxudmFyIGV4cG9ydHMgPSBmdW5jdGlvbigpe1xuICB2YXIgVmVjdG9yMiA9IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICB0aGlzLnggPSB4IHx8IDA7XG4gICAgdGhpcy55ID0geSB8fCAwO1xuICB9O1xuICBcbiAgVmVjdG9yMi5wcm90b3R5cGUgPSB7XG4gICAgc2V0OiBmdW5jdGlvbiAoeCwgeSkge1xuICAgICAgdGhpcy54ID0geDtcbiAgICAgIHRoaXMueSA9IHk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIGNvcHk6IGZ1bmN0aW9uICh2KSB7XG4gICAgICB0aGlzLnggPSB2Lng7XG4gICAgICB0aGlzLnkgPSB2Lnk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIGFkZDogZnVuY3Rpb24gKHYpIHtcbiAgICAgIHRoaXMueCArPSB2Lng7XG4gICAgICB0aGlzLnkgKz0gdi55O1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBhZGRTY2FsYXI6IGZ1bmN0aW9uIChzKSB7XG4gICAgICB0aGlzLnggKz0gcztcbiAgICAgIHRoaXMueSArPSBzO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBzdWI6IGZ1bmN0aW9uICh2KSB7XG4gICAgICB0aGlzLnggLT0gdi54O1xuICAgICAgdGhpcy55IC09IHYueTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgc3ViU2NhbGFyOiBmdW5jdGlvbiAocykge1xuICAgICAgdGhpcy54IC09IHM7XG4gICAgICB0aGlzLnkgLT0gcztcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgbXVsdDogZnVuY3Rpb24gKHYpIHtcbiAgICAgIHRoaXMueCAqPSB2Lng7XG4gICAgICB0aGlzLnkgKj0gdi55O1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBtdWx0U2NhbGFyOiBmdW5jdGlvbiAocykge1xuICAgICAgdGhpcy54ICo9IHM7XG4gICAgICB0aGlzLnkgKj0gcztcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgZGl2OiBmdW5jdGlvbiAodikge1xuICAgICAgdGhpcy54IC89IHYueDtcbiAgICAgIHRoaXMueSAvPSB2Lnk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIGRpdlNjYWxhcjogZnVuY3Rpb24gKHMpIHtcbiAgICAgIHRoaXMueCAvPSBzO1xuICAgICAgdGhpcy55IC89IHM7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIG1pbjogZnVuY3Rpb24gKHYpIHtcbiAgICAgIGlmICggdGhpcy54IDwgdi54ICkgdGhpcy54ID0gdi54O1xuICAgICAgaWYgKCB0aGlzLnkgPCB2LnkgKSB0aGlzLnkgPSB2Lnk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIG1heDogZnVuY3Rpb24gKHYpIHtcbiAgICAgIGlmICggdGhpcy54ID4gdi54ICkgdGhpcy54ID0gdi54O1xuICAgICAgaWYgKCB0aGlzLnkgPiB2LnkgKSB0aGlzLnkgPSB2Lnk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIGNsYW1wOiBmdW5jdGlvbiAodl9taW4sIHZfbWF4KSB7XG4gICAgICBpZiAoIHRoaXMueCA8IHZfbWluLnggKSB7XG4gICAgICAgIHRoaXMueCA9IHZfbWluLng7XG4gICAgICB9IGVsc2UgaWYgKCB0aGlzLnggPiB2X21heC54ICkge1xuICAgICAgICB0aGlzLnggPSB2X21heC54O1xuICAgICAgfVxuICAgICAgaWYgKCB0aGlzLnkgPCB2X21pbi55ICkge1xuICAgICAgICB0aGlzLnkgPSB2X21pbi55O1xuICAgICAgfSBlbHNlIGlmICggdGhpcy55ID4gdl9tYXgueSApIHtcbiAgICAgICAgdGhpcy55ID0gdl9tYXgueTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgZmxvb3I6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMueCA9IE1hdGguZmxvb3IoIHRoaXMueCApO1xuICAgICAgdGhpcy55ID0gTWF0aC5mbG9vciggdGhpcy55ICk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIGNlaWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMueCA9IE1hdGguY2VpbCggdGhpcy54ICk7XG4gICAgICB0aGlzLnkgPSBNYXRoLmNlaWwoIHRoaXMueSApO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICByb3VuZDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy54ID0gTWF0aC5yb3VuZCggdGhpcy54ICk7XG4gICAgICB0aGlzLnkgPSBNYXRoLnJvdW5kKCB0aGlzLnkgKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgcm91bmRUb1plcm86IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMueCA9ICggdGhpcy54IDwgMCApID8gTWF0aC5jZWlsKCB0aGlzLnggKSA6IE1hdGguZmxvb3IoIHRoaXMueCApO1xuICAgICAgdGhpcy55ID0gKCB0aGlzLnkgPCAwICkgPyBNYXRoLmNlaWwoIHRoaXMueSApIDogTWF0aC5mbG9vciggdGhpcy55ICk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIG5lZ2F0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy54ID0gLSB0aGlzLng7XG4gICAgICB0aGlzLnkgPSAtIHRoaXMueTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgZG90OiBmdW5jdGlvbiAodikge1xuICAgICAgcmV0dXJuIHRoaXMueCAqIHYueCArIHRoaXMueSAqIHYueTtcbiAgICB9LFxuICAgIGxlbmd0aFNxOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy54ICogdGhpcy54ICsgdGhpcy55ICogdGhpcy55O1xuICAgIH0sXG4gICAgbGVuZ3RoOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gTWF0aC5zcXJ0KHRoaXMubGVuZ3RoU3EoKSk7XG4gICAgfSxcbiAgICBub3JtYWxpemU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLmRpdlNjYWxhcih0aGlzLmxlbmd0aCgpKTtcbiAgICB9LFxuICAgIGRpc3RhbmNlVG86IGZ1bmN0aW9uICh2KSB7XG4gICAgICB2YXIgZHggPSB0aGlzLnggLSB2Lng7XG4gICAgICB2YXIgZHkgPSB0aGlzLnkgLSB2Lnk7XG4gICAgICByZXR1cm4gTWF0aC5zcXJ0KGR4ICogZHggKyBkeSAqIGR5KTtcbiAgICB9LFxuICAgIHNldExlbmd0aDogZnVuY3Rpb24gKGwpIHtcbiAgICAgIHZhciBvbGRMZW5ndGggPSB0aGlzLmxlbmd0aCgpO1xuICAgICAgaWYgKCBvbGRMZW5ndGggIT09IDAgJiYgbCAhPT0gb2xkTGVuZ3RoICkge1xuICAgICAgICB0aGlzLm11bHRTY2FsYXIobCAvIG9sZExlbmd0aCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIGNsb25lOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gbmV3IFZlY3RvcjIodGhpcy54LCB0aGlzLnkpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBWZWN0b3IyO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzKCk7XG4iXX0=
