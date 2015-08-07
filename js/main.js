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

var moversNum = 50;
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
      var scalar = util.getRandomInt(20, 40);
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
    mover.updatePosition();
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
    this.radius = util.getRandomInt(30, 90);
    this.mass = this.radius / 30;
    this.position = new Vector2();
    this.velocity = new Vector2();
    this.acceleration = new Vector2();
    this.direction = 0;
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
      friction.multScalar(0.2);
      this.applyFource(friction);
    },
    direct: function(vector) {
      var v = vector.clone().sub(this.position);
      this.direction = Math.atan2(v.y, v.x);
    },
    rebound: function(vector) {
      var dot = this.acceleration.clone().dot(vector);
      this.acceleration.sub(vector.multScalar(2 * dot));
    },
    draw: function(context) {
      context.lineWidth = 8;
      
      context.fillStyle = '#333333';
      context.beginPath();
      context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI / 180, true);
      context.fill();
      
      context.strokeStyle = '#ffffff';
      context.beginPath();
      context.moveTo(this.position.x, this.position.y);
      context.lineTo(this.position.x + Math.cos(this.direction) * this.radius, this.position.y + Math.sin(this.direction) * this.radius);
      context.stroke();
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvZGVib3VuY2UuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy9tb3Zlci5qcyIsInNyYy9qcy91dGlsLmpzIiwic3JjL2pzL3ZlY3RvcjIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDektBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9iamVjdCwgZXZlbnRUeXBlLCBjYWxsYmFjayl7XG4gIHZhciB0aW1lcjtcblxuICBvYmplY3QuYWRkRXZlbnRMaXN0ZW5lcihldmVudFR5cGUsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICB0aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgIGNhbGxiYWNrKGV2ZW50KTtcbiAgICB9LCA1MDApO1xuICB9LCBmYWxzZSk7XG59O1xuIiwidmFyIFV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcbnZhciB1dGlsID0gbmV3IFV0aWwoKTtcbnZhciBWZWN0b3IyID0gcmVxdWlyZSgnLi92ZWN0b3IyJyk7XG52YXIgTW92ZXIgPSByZXF1aXJlKCcuL21vdmVyJyk7XG52YXIgZGVib3VuY2UgPSByZXF1aXJlKCcuL2RlYm91bmNlJyk7XG5cbnZhciBib2R5X3dpZHRoICA9IGRvY3VtZW50LmJvZHkuY2xpZW50V2lkdGggKiAyO1xudmFyIGJvZHlfaGVpZ2h0ID0gZG9jdW1lbnQuYm9keS5jbGllbnRIZWlnaHQgKiAyO1xudmFyIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXMnKTtcbnZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbnZhciBmcHMgPSA2MDtcbnZhciBsYXN0X3RpbWVfcmVuZGVyID0gRGF0ZS5ub3coKTtcblxudmFyIG1vdmVyc051bSA9IDUwO1xudmFyIG1vdmVycyA9IFtdO1xuXG52YXIgaW5pdCA9IGZ1bmN0aW9uKCkge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG1vdmVyc051bTsgaSsrKSB7XG4gICAgdmFyIG1vdmVyID0gbmV3IE1vdmVyKCk7XG4gICAgdmFyIHJhZGlhbiA9IHV0aWwuZ2V0UmFkaWFuKHV0aWwuZ2V0UmFuZG9tSW50KDAsIDM2MCkpO1xuICAgIHZhciBzY2FsYXIgPSB1dGlsLmdldFJhbmRvbUludCgyMCwgNDApO1xuICAgIHZhciBmb3VyY2UgPSBuZXcgVmVjdG9yMihNYXRoLmNvcyhyYWRpYW4pICogc2NhbGFyLCBNYXRoLnNpbihyYWRpYW4pICogc2NhbGFyKTtcbiAgICB2YXIgeCA9IHV0aWwuZ2V0UmFuZG9tSW50KG1vdmVyLnJhZGl1cywgYm9keV93aWR0aCAtIG1vdmVyLnJhZGl1cyk7XG4gICAgdmFyIHkgPSB1dGlsLmdldFJhbmRvbUludChtb3Zlci5yYWRpdXMsIGJvZHlfaGVpZ2h0IC0gbW92ZXIucmFkaXVzKTtcbiAgICB2YXIgeCA9IGJvZHlfd2lkdGggLyAyO1xuICAgIHZhciB5ID0gYm9keV9oZWlnaHQgLyAyO1xuICAgIFxuICAgIG1vdmVyLnBvc2l0aW9uLnNldCh4LCB5KTtcbiAgICBtb3Zlci52ZWxvY2l0eS5zZXQoeCwgeSk7XG4gICAgZm91cmNlLmRpdlNjYWxhcihtb3Zlci5tYXNzKTtcbiAgICBtb3Zlci5hcHBseUZvdXJjZShmb3VyY2UpO1xuICAgIG1vdmVyc1tpXSA9IG1vdmVyO1xuICB9XG4gIFxuICBzZXRFdmVudCgpO1xuICByZXNpemVDYW52YXMoKTtcbiAgcmVuZGVybG9vcCgpO1xuICBkZWJvdW5jZSh3aW5kb3csICdyZXNpemUnLCBmdW5jdGlvbihldmVudCl7XG4gICAgcmVzaXplQ2FudmFzKCk7XG4gIH0pO1xufTtcblxudmFyIHVwZGF0ZU1vdmVyID0gZnVuY3Rpb24oKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbW92ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIG1vdmVyID0gbW92ZXJzW2ldO1xuICAgIHZhciBjb2xsaXNpb24gPSBmYWxzZTtcbiAgICBcbiAgICBtb3Zlci5tb3ZlKCk7XG4gICAgLy8g5Yqg6YCf5bqm44GMMOOBq+OBquOBo+OBn+OBqOOBjeOBq+WGjeW6puWKm+OCkuWKoOOBiOOCi+OAglxuICAgIGlmIChtb3Zlci5hY2NlbGVyYXRpb24ubGVuZ3RoKCkgPD0gMSkge1xuICAgICAgdmFyIHJhZGlhbiA9IHV0aWwuZ2V0UmFkaWFuKHV0aWwuZ2V0UmFuZG9tSW50KDAsIDM2MCkpO1xuICAgICAgdmFyIHNjYWxhciA9IHV0aWwuZ2V0UmFuZG9tSW50KDIwLCA0MCk7XG4gICAgICB2YXIgZm91cmNlID0gbmV3IFZlY3RvcjIoTWF0aC5jb3MocmFkaWFuKSAqIHNjYWxhciwgTWF0aC5zaW4ocmFkaWFuKSAqIHNjYWxhcik7XG4gICAgICBcbiAgICAgIGZvdXJjZS5kaXZTY2FsYXIobW92ZXIubWFzcyk7XG4gICAgICBtb3Zlci5hcHBseUZvdXJjZShmb3VyY2UpO1xuICAgIH1cbiAgICAvLyDlo4Hjgajjga7ooZ3nqoHliKTlrppcbiAgICBpZiAobW92ZXIucG9zaXRpb24ueSAtIG1vdmVyLnJhZGl1cyA8IDApIHtcbiAgICAgIHZhciBub3JtYWwgPSBuZXcgVmVjdG9yMigwLCAxKTtcbiAgICAgIG1vdmVyLnZlbG9jaXR5LnkgPSBtb3Zlci5yYWRpdXM7XG4gICAgICBjb2xsaXNpb24gPSB0cnVlO1xuICAgIH0gZWxzZSBpZiAobW92ZXIucG9zaXRpb24ueSArIG1vdmVyLnJhZGl1cyA+IGJvZHlfaGVpZ2h0KSB7XG4gICAgICB2YXIgbm9ybWFsID0gbmV3IFZlY3RvcjIoMCwgLTEpO1xuICAgICAgbW92ZXIudmVsb2NpdHkueSA9IGJvZHlfaGVpZ2h0IC0gbW92ZXIucmFkaXVzO1xuICAgICAgY29sbGlzaW9uID0gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKG1vdmVyLnBvc2l0aW9uLnggLSBtb3Zlci5yYWRpdXMgPCAwKSB7XG4gICAgICB2YXIgbm9ybWFsID0gbmV3IFZlY3RvcjIoMSwgMCk7XG4gICAgICBtb3Zlci52ZWxvY2l0eS54ID0gbW92ZXIucmFkaXVzO1xuICAgICAgY29sbGlzaW9uID0gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKG1vdmVyLnBvc2l0aW9uLnggKyBtb3Zlci5yYWRpdXMgPiBib2R5X3dpZHRoKSB7XG4gICAgICB2YXIgbm9ybWFsID0gbmV3IFZlY3RvcjIoLTEsIDApO1xuICAgICAgbW92ZXIudmVsb2NpdHkueCA9IGJvZHlfd2lkdGggLSBtb3Zlci5yYWRpdXM7XG4gICAgICBjb2xsaXNpb24gPSB0cnVlO1xuICAgIH1cbiAgICBpZiAoY29sbGlzaW9uKSB7XG4gICAgICBtb3Zlci5yZWJvdW5kKG5vcm1hbCk7XG4gICAgfVxuICAgIGZvciAodmFyIGluZGV4ID0gaSArIDE7IGluZGV4IDwgbW92ZXJzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgdmFyIGRpc3RhbmNlID0gbW92ZXIudmVsb2NpdHkuZGlzdGFuY2VUbyhtb3ZlcnNbaW5kZXhdLnZlbG9jaXR5KTtcbiAgICAgIHZhciByZWJvdW5kX2Rpc3RhbmNlID0gbW92ZXIucmFkaXVzICsgbW92ZXJzW2luZGV4XS5yYWRpdXM7XG4gICAgICBpZiAoZGlzdGFuY2UgPCByZWJvdW5kX2Rpc3RhbmNlKSB7XG4gICAgICAgIHZhciBvdmVybGFwID0gTWF0aC5hYnMoZGlzdGFuY2UgLSByZWJvdW5kX2Rpc3RhbmNlKTtcbiAgICAgICAgdmFyIG5vcm1hbCA9IG1vdmVyLnZlbG9jaXR5LmNsb25lKCkuc3ViKG1vdmVyc1tpbmRleF0udmVsb2NpdHkpLm5vcm1hbGl6ZSgpO1xuICAgICAgICBtb3Zlci52ZWxvY2l0eS5zdWIobm9ybWFsLmNsb25lKCkubXVsdFNjYWxhcihvdmVybGFwICogLTEpKTtcbiAgICAgICAgbW92ZXJzW2luZGV4XS52ZWxvY2l0eS5zdWIobm9ybWFsLmNsb25lKCkubXVsdFNjYWxhcihvdmVybGFwKSk7XG4gICAgICAgIG1vdmVyLnJlYm91bmQobm9ybWFsLmNsb25lKCkubXVsdFNjYWxhcigtMSkpO1xuICAgICAgICBtb3ZlcnNbaW5kZXhdLnJlYm91bmQobm9ybWFsLmNsb25lKCkpO1xuICAgICAgfVxuICAgIH1cbiAgICBtb3Zlci51cGRhdGVQb3NpdGlvbigpO1xuICAgIG1vdmVyLmRyYXcoY3R4KTtcbiAgfVxufTtcblxudmFyIHJlbmRlciA9IGZ1bmN0aW9uKCkge1xuICBjdHguY2xlYXJSZWN0KDAsIDAsIGJvZHlfd2lkdGgsIGJvZHlfaGVpZ2h0KTtcbiAgdXBkYXRlTW92ZXIoKTtcbn07XG5cbnZhciByZW5kZXJsb29wID0gZnVuY3Rpb24oKSB7XG4gIHZhciBub3cgPSBEYXRlLm5vdygpO1xuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVuZGVybG9vcCk7XG4gIGlmIChub3cgLSBsYXN0X3RpbWVfcmVuZGVyID4gMTAwMCAvIGZwcykge1xuICAgIHJlbmRlcigpO1xuICAgIGxhc3RfdGltZV9yZW5kZXIgPSBEYXRlLm5vdygpO1xuICB9XG59O1xuXG52YXIgcmVzaXplQ2FudmFzID0gZnVuY3Rpb24oKSB7XG4gIGJvZHlfd2lkdGggID0gZG9jdW1lbnQuYm9keS5jbGllbnRXaWR0aCAqIDI7XG4gIGJvZHlfaGVpZ2h0ID0gZG9jdW1lbnQuYm9keS5jbGllbnRIZWlnaHQgKiAyO1xuXG4gIGNhbnZhcy53aWR0aCA9IGJvZHlfd2lkdGg7XG4gIGNhbnZhcy5oZWlnaHQgPSBib2R5X2hlaWdodDtcbiAgY2FudmFzLnN0eWxlLndpZHRoID0gYm9keV93aWR0aCAvIDIgKyAncHgnO1xuICBjYW52YXMuc3R5bGUuaGVpZ2h0ID0gYm9keV9oZWlnaHQgLyAyICsgJ3B4Jztcbn07XG5cbnZhciBzZXRFdmVudCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGV2ZW50VG91Y2hTdGFydCA9IGZ1bmN0aW9uKHgsIHkpIHtcbiAgfTtcbiAgXG4gIHZhciBldmVudFRvdWNoTW92ZSA9IGZ1bmN0aW9uKHgsIHkpIHtcbiAgfTtcbiAgXG4gIHZhciBldmVudFRvdWNoRW5kID0gZnVuY3Rpb24oeCwgeSkge1xuICB9O1xuXG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdjb250ZXh0bWVudScsIGZ1bmN0aW9uIChldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gIH0pO1xuXG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdzZWxlY3RzdGFydCcsIGZ1bmN0aW9uIChldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gIH0pO1xuXG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGV2ZW50VG91Y2hTdGFydChldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZKTtcbiAgfSk7XG5cbiAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGZ1bmN0aW9uIChldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgZXZlbnRUb3VjaE1vdmUoZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSk7XG4gIH0pO1xuXG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBldmVudFRvdWNoRW5kKCk7XG4gIH0pO1xuXG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBldmVudFRvdWNoU3RhcnQoZXZlbnQudG91Y2hlc1swXS5jbGllbnRYLCBldmVudC50b3VjaGVzWzBdLmNsaWVudFkpO1xuICB9KTtcblxuICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBldmVudFRvdWNoTW92ZShldmVudC50b3VjaGVzWzBdLmNsaWVudFgsIGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WSk7XG4gIH0pO1xuXG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIGZ1bmN0aW9uIChldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgZXZlbnRUb3VjaEVuZCgpO1xuICB9KTtcbn07XG5cbmluaXQoKTtcbiIsInZhciBVdGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG52YXIgdXRpbCA9IG5ldyBVdGlsKCk7XG52YXIgVmVjdG9yMiA9IHJlcXVpcmUoJy4vdmVjdG9yMicpO1xuXG52YXIgZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XG4gIHZhciBNb3ZlciA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucmFkaXVzID0gdXRpbC5nZXRSYW5kb21JbnQoMzAsIDkwKTtcbiAgICB0aGlzLm1hc3MgPSB0aGlzLnJhZGl1cyAvIDMwO1xuICAgIHRoaXMucG9zaXRpb24gPSBuZXcgVmVjdG9yMigpO1xuICAgIHRoaXMudmVsb2NpdHkgPSBuZXcgVmVjdG9yMigpO1xuICAgIHRoaXMuYWNjZWxlcmF0aW9uID0gbmV3IFZlY3RvcjIoKTtcbiAgICB0aGlzLmRpcmVjdGlvbiA9IDA7XG4gIH07XG4gIFxuICBNb3Zlci5wcm90b3R5cGUgPSB7XG4gICAgbW92ZTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmFwcGx5RnJpY3Rpb24oKTtcbiAgICAgIHRoaXMudmVsb2NpdHkuYWRkKHRoaXMuYWNjZWxlcmF0aW9uKTtcbiAgICAgIGlmICh0aGlzLnZlbG9jaXR5LmRpc3RhbmNlVG8odGhpcy5wb3NpdGlvbikgPj0gMSkge1xuICAgICAgICB0aGlzLmRpcmVjdCh0aGlzLnZlbG9jaXR5KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHVwZGF0ZVBvc2l0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMucG9zaXRpb24uY29weSh0aGlzLnZlbG9jaXR5KTtcbiAgICB9LFxuICAgIGFwcGx5Rm91cmNlOiBmdW5jdGlvbih2ZWN0b3IpIHtcbiAgICAgIHRoaXMuYWNjZWxlcmF0aW9uLmFkZCh2ZWN0b3IpO1xuICAgIH0sXG4gICAgYXBwbHlGcmljdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZnJpY3Rpb24gPSB0aGlzLmFjY2VsZXJhdGlvbi5jbG9uZSgpO1xuICAgICAgZnJpY3Rpb24ubXVsdFNjYWxhcigtMSk7XG4gICAgICBmcmljdGlvbi5ub3JtYWxpemUoKTtcbiAgICAgIGZyaWN0aW9uLm11bHRTY2FsYXIoMC4yKTtcbiAgICAgIHRoaXMuYXBwbHlGb3VyY2UoZnJpY3Rpb24pO1xuICAgIH0sXG4gICAgZGlyZWN0OiBmdW5jdGlvbih2ZWN0b3IpIHtcbiAgICAgIHZhciB2ID0gdmVjdG9yLmNsb25lKCkuc3ViKHRoaXMucG9zaXRpb24pO1xuICAgICAgdGhpcy5kaXJlY3Rpb24gPSBNYXRoLmF0YW4yKHYueSwgdi54KTtcbiAgICB9LFxuICAgIHJlYm91bmQ6IGZ1bmN0aW9uKHZlY3Rvcikge1xuICAgICAgdmFyIGRvdCA9IHRoaXMuYWNjZWxlcmF0aW9uLmNsb25lKCkuZG90KHZlY3Rvcik7XG4gICAgICB0aGlzLmFjY2VsZXJhdGlvbi5zdWIodmVjdG9yLm11bHRTY2FsYXIoMiAqIGRvdCkpO1xuICAgIH0sXG4gICAgZHJhdzogZnVuY3Rpb24oY29udGV4dCkge1xuICAgICAgY29udGV4dC5saW5lV2lkdGggPSA4O1xuICAgICAgXG4gICAgICBjb250ZXh0LmZpbGxTdHlsZSA9ICcjMzMzMzMzJztcbiAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgICBjb250ZXh0LmFyYyh0aGlzLnBvc2l0aW9uLngsIHRoaXMucG9zaXRpb24ueSwgdGhpcy5yYWRpdXMsIDAsIE1hdGguUEkgLyAxODAsIHRydWUpO1xuICAgICAgY29udGV4dC5maWxsKCk7XG4gICAgICBcbiAgICAgIGNvbnRleHQuc3Ryb2tlU3R5bGUgPSAnI2ZmZmZmZic7XG4gICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgY29udGV4dC5tb3ZlVG8odGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnkpO1xuICAgICAgY29udGV4dC5saW5lVG8odGhpcy5wb3NpdGlvbi54ICsgTWF0aC5jb3ModGhpcy5kaXJlY3Rpb24pICogdGhpcy5yYWRpdXMsIHRoaXMucG9zaXRpb24ueSArIE1hdGguc2luKHRoaXMuZGlyZWN0aW9uKSAqIHRoaXMucmFkaXVzKTtcbiAgICAgIGNvbnRleHQuc3Ryb2tlKCk7XG4gICAgfVxuICB9O1xuICBcbiAgcmV0dXJuIE1vdmVyO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzKCk7XG4iLCJ2YXIgZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XG4gIHZhciBVdGlsID0gZnVuY3Rpb24oKSB7fTtcbiAgXG4gIFV0aWwucHJvdG90eXBlLmdldFJhbmRvbUludCA9IGZ1bmN0aW9uKG1pbiwgbWF4KXtcbiAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikpICsgbWluO1xuICB9O1xuICBcbiAgVXRpbC5wcm90b3R5cGUuZ2V0RGVncmVlID0gZnVuY3Rpb24ocmFkaWFuKSB7XG4gICAgcmV0dXJuIHJhZGlhbiAvIE1hdGguUEkgKiAxODA7XG4gIH07XG4gIFxuICBVdGlsLnByb3RvdHlwZS5nZXRSYWRpYW4gPSBmdW5jdGlvbihkZWdyZWVzKSB7XG4gICAgcmV0dXJuIGRlZ3JlZXMgKiBNYXRoLlBJIC8gMTgwO1xuICB9O1xuICBcbiAgVXRpbC5wcm90b3R5cGUuZ2V0U3BoZXJpY2FsID0gZnVuY3Rpb24ocmFkMSwgcmFkMiwgcikge1xuICAgIHZhciB4ID0gTWF0aC5jb3MocmFkMSkgKiBNYXRoLmNvcyhyYWQyKSAqIHI7XG4gICAgdmFyIHogPSBNYXRoLmNvcyhyYWQxKSAqIE1hdGguc2luKHJhZDIpICogcjtcbiAgICB2YXIgeSA9IE1hdGguc2luKHJhZDEpICogcjtcbiAgICByZXR1cm4gW3gsIHksIHpdO1xuICB9O1xuICBcbiAgcmV0dXJuIFV0aWw7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMoKTtcbiIsIi8vIFxuLy8g44GT44GuVmVjdG9yMuOCr+ODqeOCueOBr+OAgXRocmVlLmpz44GuVEhSRUUuVmVjdG9yMuOCr+ODqeOCueOBruioiOeul+W8j+OBruS4gOmDqOOCkuWIqeeUqOOBl+OBpuOBhOOBvuOBmeOAglxuLy8gaHR0cHM6Ly9naXRodWIuY29tL21yZG9vYi90aHJlZS5qcy9ibG9iL21hc3Rlci9zcmMvbWF0aC9WZWN0b3IyLmpzI0wzNjdcbi8vIFxuXG52YXIgZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XG4gIHZhciBWZWN0b3IyID0gZnVuY3Rpb24oeCwgeSkge1xuICAgIHRoaXMueCA9IHggfHwgMDtcbiAgICB0aGlzLnkgPSB5IHx8IDA7XG4gIH07XG4gIFxuICBWZWN0b3IyLnByb3RvdHlwZSA9IHtcbiAgICBzZXQ6IGZ1bmN0aW9uICh4LCB5KSB7XG4gICAgICB0aGlzLnggPSB4O1xuICAgICAgdGhpcy55ID0geTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgY29weTogZnVuY3Rpb24gKHYpIHtcbiAgICAgIHRoaXMueCA9IHYueDtcbiAgICAgIHRoaXMueSA9IHYueTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgYWRkOiBmdW5jdGlvbiAodikge1xuICAgICAgdGhpcy54ICs9IHYueDtcbiAgICAgIHRoaXMueSArPSB2Lnk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIGFkZFNjYWxhcjogZnVuY3Rpb24gKHMpIHtcbiAgICAgIHRoaXMueCArPSBzO1xuICAgICAgdGhpcy55ICs9IHM7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIHN1YjogZnVuY3Rpb24gKHYpIHtcbiAgICAgIHRoaXMueCAtPSB2Lng7XG4gICAgICB0aGlzLnkgLT0gdi55O1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBzdWJTY2FsYXI6IGZ1bmN0aW9uIChzKSB7XG4gICAgICB0aGlzLnggLT0gcztcbiAgICAgIHRoaXMueSAtPSBzO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBtdWx0OiBmdW5jdGlvbiAodikge1xuICAgICAgdGhpcy54ICo9IHYueDtcbiAgICAgIHRoaXMueSAqPSB2Lnk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIG11bHRTY2FsYXI6IGZ1bmN0aW9uIChzKSB7XG4gICAgICB0aGlzLnggKj0gcztcbiAgICAgIHRoaXMueSAqPSBzO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBkaXY6IGZ1bmN0aW9uICh2KSB7XG4gICAgICB0aGlzLnggLz0gdi54O1xuICAgICAgdGhpcy55IC89IHYueTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgZGl2U2NhbGFyOiBmdW5jdGlvbiAocykge1xuICAgICAgdGhpcy54IC89IHM7XG4gICAgICB0aGlzLnkgLz0gcztcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgbWluOiBmdW5jdGlvbiAodikge1xuICAgICAgaWYgKCB0aGlzLnggPCB2LnggKSB0aGlzLnggPSB2Lng7XG4gICAgICBpZiAoIHRoaXMueSA8IHYueSApIHRoaXMueSA9IHYueTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgbWF4OiBmdW5jdGlvbiAodikge1xuICAgICAgaWYgKCB0aGlzLnggPiB2LnggKSB0aGlzLnggPSB2Lng7XG4gICAgICBpZiAoIHRoaXMueSA+IHYueSApIHRoaXMueSA9IHYueTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgY2xhbXA6IGZ1bmN0aW9uICh2X21pbiwgdl9tYXgpIHtcbiAgICAgIGlmICggdGhpcy54IDwgdl9taW4ueCApIHtcbiAgICAgICAgdGhpcy54ID0gdl9taW4ueDtcbiAgICAgIH0gZWxzZSBpZiAoIHRoaXMueCA+IHZfbWF4LnggKSB7XG4gICAgICAgIHRoaXMueCA9IHZfbWF4Lng7XG4gICAgICB9XG4gICAgICBpZiAoIHRoaXMueSA8IHZfbWluLnkgKSB7XG4gICAgICAgIHRoaXMueSA9IHZfbWluLnk7XG4gICAgICB9IGVsc2UgaWYgKCB0aGlzLnkgPiB2X21heC55ICkge1xuICAgICAgICB0aGlzLnkgPSB2X21heC55O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBmbG9vcjogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy54ID0gTWF0aC5mbG9vciggdGhpcy54ICk7XG4gICAgICB0aGlzLnkgPSBNYXRoLmZsb29yKCB0aGlzLnkgKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgY2VpbDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy54ID0gTWF0aC5jZWlsKCB0aGlzLnggKTtcbiAgICAgIHRoaXMueSA9IE1hdGguY2VpbCggdGhpcy55ICk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIHJvdW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnggPSBNYXRoLnJvdW5kKCB0aGlzLnggKTtcbiAgICAgIHRoaXMueSA9IE1hdGgucm91bmQoIHRoaXMueSApO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICByb3VuZFRvWmVybzogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy54ID0gKCB0aGlzLnggPCAwICkgPyBNYXRoLmNlaWwoIHRoaXMueCApIDogTWF0aC5mbG9vciggdGhpcy54ICk7XG4gICAgICB0aGlzLnkgPSAoIHRoaXMueSA8IDAgKSA/IE1hdGguY2VpbCggdGhpcy55ICkgOiBNYXRoLmZsb29yKCB0aGlzLnkgKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgbmVnYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnggPSAtIHRoaXMueDtcbiAgICAgIHRoaXMueSA9IC0gdGhpcy55O1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBkb3Q6IGZ1bmN0aW9uICh2KSB7XG4gICAgICByZXR1cm4gdGhpcy54ICogdi54ICsgdGhpcy55ICogdi55O1xuICAgIH0sXG4gICAgbGVuZ3RoU3E6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLnggKiB0aGlzLnggKyB0aGlzLnkgKiB0aGlzLnk7XG4gICAgfSxcbiAgICBsZW5ndGg6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBNYXRoLnNxcnQodGhpcy5sZW5ndGhTcSgpKTtcbiAgICB9LFxuICAgIG5vcm1hbGl6ZTogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZGl2U2NhbGFyKHRoaXMubGVuZ3RoKCkpO1xuICAgIH0sXG4gICAgZGlzdGFuY2VUbzogZnVuY3Rpb24gKHYpIHtcbiAgICAgIHZhciBkeCA9IHRoaXMueCAtIHYueDtcbiAgICAgIHZhciBkeSA9IHRoaXMueSAtIHYueTtcbiAgICAgIHJldHVybiBNYXRoLnNxcnQoZHggKiBkeCArIGR5ICogZHkpO1xuICAgIH0sXG4gICAgc2V0TGVuZ3RoOiBmdW5jdGlvbiAobCkge1xuICAgICAgdmFyIG9sZExlbmd0aCA9IHRoaXMubGVuZ3RoKCk7XG4gICAgICBpZiAoIG9sZExlbmd0aCAhPT0gMCAmJiBsICE9PSBvbGRMZW5ndGggKSB7XG4gICAgICAgIHRoaXMubXVsdFNjYWxhcihsIC8gb2xkTGVuZ3RoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgY2xvbmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBuZXcgVmVjdG9yMih0aGlzLngsIHRoaXMueSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIFZlY3RvcjI7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMoKTtcbiJdfQ==
