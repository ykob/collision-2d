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

var moversNum = 80;
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
    var radius_base = 0;
    if (body_width < body_height) {
      radius_base = body_width / 4;
    } else {
      radius_base = body_height / 4;
    }
    
    mover.radius = util.getRandomInt(radius_base / 2, radius_base);
    mover.mass = mover.radius / 20;
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
      var scalar = util.getRandomInt(200, 300);
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
    // mover同士の衝突判定
    // for (var index = i + 1; index < movers.length; index++) {
    //   var distance = mover.velocity.distanceTo(movers[index].velocity);
    //   var rebound_distance = mover.radius + movers[index].radius;
    //   if (distance < rebound_distance) {
    //     var overlap = Math.abs(distance - rebound_distance);
    //     var normal = mover.velocity.clone().sub(movers[index].velocity).normalize();
    //     mover.velocity.sub(normal.clone().multScalar(overlap * -1));
    //     movers[index].velocity.sub(normal.clone().multScalar(overlap));
    //     mover.rebound(normal.clone().multScalar(-1));
    //     movers[index].rebound(normal.clone());
    //   }
    // }
    mover.updatePosition();
    mover.draw(ctx);
  }
};

var render = function() {
  ctx.clearRect(0, 0, body_width, body_height);
  ctx.globalCompositeOperation = 'lighter';
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
    this.r = util.getRandomInt(220, 255);
    this.g = util.getRandomInt(80, 220);
    this.b = util.getRandomInt(120, 140);
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
      var grad = context.createRadialGradient(this.position.x, this.position.y, 0, this.position.x, this.position.y, this.radius);

      grad.addColorStop(0, 'rgba(' + this.r + ',' + this.g + ',' + this.b + ', 0.3)');
      grad.addColorStop(1, 'rgba(' + this.r + ',' + this.g + ',' + this.b + ', 0)');
      // context.lineWidth = 8;
      // context.fillStyle = 'rgb(' + this.r + ',' + this.g + ',' + this.b + ')';
      context.fillStyle = grad;
      
      context.beginPath();
      // context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI / 180, true);
      // context.shadowColor = '#333'
      // context.shadowOffsetX = 0;
      // context.shadowOffsetY = 0;
      // context.shadowBlur = 200;
      context.rect(this.position.x - this.radius, this.position.y - this.radius, this.position.x + this.radius, this.position.y + this.radius);
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvZGVib3VuY2UuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy9tb3Zlci5qcyIsInNyYy9qcy91dGlsLmpzIiwic3JjL2pzL3ZlY3RvcjIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9iamVjdCwgZXZlbnRUeXBlLCBjYWxsYmFjayl7XHJcbiAgdmFyIHRpbWVyO1xyXG5cclxuICBvYmplY3QuYWRkRXZlbnRMaXN0ZW5lcihldmVudFR5cGUsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICBjbGVhclRpbWVvdXQodGltZXIpO1xyXG4gICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgIGNhbGxiYWNrKGV2ZW50KTtcclxuICAgIH0sIDUwMCk7XHJcbiAgfSwgZmFsc2UpO1xyXG59O1xyXG4iLCJ2YXIgVXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xyXG52YXIgdXRpbCA9IG5ldyBVdGlsKCk7XHJcbnZhciBWZWN0b3IyID0gcmVxdWlyZSgnLi92ZWN0b3IyJyk7XHJcbnZhciBNb3ZlciA9IHJlcXVpcmUoJy4vbW92ZXInKTtcclxudmFyIGRlYm91bmNlID0gcmVxdWlyZSgnLi9kZWJvdW5jZScpO1xyXG5cclxudmFyIGJvZHlfd2lkdGggID0gZG9jdW1lbnQuYm9keS5jbGllbnRXaWR0aCAqIDI7XHJcbnZhciBib2R5X2hlaWdodCA9IGRvY3VtZW50LmJvZHkuY2xpZW50SGVpZ2h0ICogMjtcclxudmFyIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXMnKTtcclxudmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG52YXIgZnBzID0gNjA7XHJcbnZhciBsYXN0X3RpbWVfcmVuZGVyID0gRGF0ZS5ub3coKTtcclxuXHJcbnZhciBtb3ZlcnNOdW0gPSA4MDtcclxudmFyIG1vdmVycyA9IFtdO1xyXG5cclxudmFyIGluaXQgPSBmdW5jdGlvbigpIHtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IG1vdmVyc051bTsgaSsrKSB7XHJcbiAgICB2YXIgbW92ZXIgPSBuZXcgTW92ZXIoKTtcclxuICAgIHZhciByYWRpYW4gPSB1dGlsLmdldFJhZGlhbih1dGlsLmdldFJhbmRvbUludCgwLCAzNjApKTtcclxuICAgIHZhciBzY2FsYXIgPSB1dGlsLmdldFJhbmRvbUludCgyMCwgNDApO1xyXG4gICAgdmFyIGZvdXJjZSA9IG5ldyBWZWN0b3IyKE1hdGguY29zKHJhZGlhbikgKiBzY2FsYXIsIE1hdGguc2luKHJhZGlhbikgKiBzY2FsYXIpO1xyXG4gICAgdmFyIHggPSB1dGlsLmdldFJhbmRvbUludChtb3Zlci5yYWRpdXMsIGJvZHlfd2lkdGggLSBtb3Zlci5yYWRpdXMpO1xyXG4gICAgdmFyIHkgPSB1dGlsLmdldFJhbmRvbUludChtb3Zlci5yYWRpdXMsIGJvZHlfaGVpZ2h0IC0gbW92ZXIucmFkaXVzKTtcclxuICAgIHZhciB4ID0gYm9keV93aWR0aCAvIDI7XHJcbiAgICB2YXIgeSA9IGJvZHlfaGVpZ2h0IC8gMjtcclxuICAgIHZhciByYWRpdXNfYmFzZSA9IDA7XHJcbiAgICBpZiAoYm9keV93aWR0aCA8IGJvZHlfaGVpZ2h0KSB7XHJcbiAgICAgIHJhZGl1c19iYXNlID0gYm9keV93aWR0aCAvIDQ7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByYWRpdXNfYmFzZSA9IGJvZHlfaGVpZ2h0IC8gNDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgbW92ZXIucmFkaXVzID0gdXRpbC5nZXRSYW5kb21JbnQocmFkaXVzX2Jhc2UgLyAyLCByYWRpdXNfYmFzZSk7XHJcbiAgICBtb3Zlci5tYXNzID0gbW92ZXIucmFkaXVzIC8gMjA7XHJcbiAgICBtb3Zlci5wb3NpdGlvbi5zZXQoeCwgeSk7XHJcbiAgICBtb3Zlci52ZWxvY2l0eS5zZXQoeCwgeSk7XHJcbiAgICBmb3VyY2UuZGl2U2NhbGFyKG1vdmVyLm1hc3MpO1xyXG4gICAgbW92ZXIuYXBwbHlGb3VyY2UoZm91cmNlKTtcclxuICAgIG1vdmVyc1tpXSA9IG1vdmVyO1xyXG4gIH1cclxuICBcclxuICBzZXRFdmVudCgpO1xyXG4gIHJlc2l6ZUNhbnZhcygpO1xyXG4gIHJlbmRlcmxvb3AoKTtcclxuICBkZWJvdW5jZSh3aW5kb3csICdyZXNpemUnLCBmdW5jdGlvbihldmVudCl7XHJcbiAgICByZXNpemVDYW52YXMoKTtcclxuICB9KTtcclxufTtcclxuXHJcbnZhciB1cGRhdGVNb3ZlciA9IGZ1bmN0aW9uKCkge1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbW92ZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICB2YXIgbW92ZXIgPSBtb3ZlcnNbaV07XHJcbiAgICB2YXIgY29sbGlzaW9uID0gZmFsc2U7XHJcbiAgICBcclxuICAgIG1vdmVyLm1vdmUoKTtcclxuICAgIC8vIOWKoOmAn+W6puOBjDDjgavjgarjgaPjgZ/jgajjgY3jgavlho3luqblipvjgpLliqDjgYjjgovjgIJcclxuICAgIGlmIChtb3Zlci5hY2NlbGVyYXRpb24ubGVuZ3RoKCkgPD0gMSkge1xyXG4gICAgICB2YXIgcmFkaWFuID0gdXRpbC5nZXRSYWRpYW4odXRpbC5nZXRSYW5kb21JbnQoMCwgMzYwKSk7XHJcbiAgICAgIHZhciBzY2FsYXIgPSB1dGlsLmdldFJhbmRvbUludCgyMDAsIDMwMCk7XHJcbiAgICAgIHZhciBmb3VyY2UgPSBuZXcgVmVjdG9yMihNYXRoLmNvcyhyYWRpYW4pICogc2NhbGFyLCBNYXRoLnNpbihyYWRpYW4pICogc2NhbGFyKTtcclxuICAgICAgXHJcbiAgICAgIGZvdXJjZS5kaXZTY2FsYXIobW92ZXIubWFzcyk7XHJcbiAgICAgIG1vdmVyLmFwcGx5Rm91cmNlKGZvdXJjZSk7XHJcbiAgICB9XHJcbiAgICAvLyDlo4Hjgajjga7ooZ3nqoHliKTlrppcclxuICAgIGlmIChtb3Zlci5wb3NpdGlvbi55IC0gbW92ZXIucmFkaXVzIDwgMCkge1xyXG4gICAgICB2YXIgbm9ybWFsID0gbmV3IFZlY3RvcjIoMCwgMSk7XHJcbiAgICAgIG1vdmVyLnZlbG9jaXR5LnkgPSBtb3Zlci5yYWRpdXM7XHJcbiAgICAgIGNvbGxpc2lvbiA9IHRydWU7XHJcbiAgICB9IGVsc2UgaWYgKG1vdmVyLnBvc2l0aW9uLnkgKyBtb3Zlci5yYWRpdXMgPiBib2R5X2hlaWdodCkge1xyXG4gICAgICB2YXIgbm9ybWFsID0gbmV3IFZlY3RvcjIoMCwgLTEpO1xyXG4gICAgICBtb3Zlci52ZWxvY2l0eS55ID0gYm9keV9oZWlnaHQgLSBtb3Zlci5yYWRpdXM7XHJcbiAgICAgIGNvbGxpc2lvbiA9IHRydWU7XHJcbiAgICB9IGVsc2UgaWYgKG1vdmVyLnBvc2l0aW9uLnggLSBtb3Zlci5yYWRpdXMgPCAwKSB7XHJcbiAgICAgIHZhciBub3JtYWwgPSBuZXcgVmVjdG9yMigxLCAwKTtcclxuICAgICAgbW92ZXIudmVsb2NpdHkueCA9IG1vdmVyLnJhZGl1cztcclxuICAgICAgY29sbGlzaW9uID0gdHJ1ZTtcclxuICAgIH0gZWxzZSBpZiAobW92ZXIucG9zaXRpb24ueCArIG1vdmVyLnJhZGl1cyA+IGJvZHlfd2lkdGgpIHtcclxuICAgICAgdmFyIG5vcm1hbCA9IG5ldyBWZWN0b3IyKC0xLCAwKTtcclxuICAgICAgbW92ZXIudmVsb2NpdHkueCA9IGJvZHlfd2lkdGggLSBtb3Zlci5yYWRpdXM7XHJcbiAgICAgIGNvbGxpc2lvbiA9IHRydWU7XHJcbiAgICB9XHJcbiAgICBpZiAoY29sbGlzaW9uKSB7XHJcbiAgICAgIG1vdmVyLnJlYm91bmQobm9ybWFsKTtcclxuICAgIH1cclxuICAgIC8vIG1vdmVy5ZCM5aOr44Gu6KGd56qB5Yik5a6aXHJcbiAgICAvLyBmb3IgKHZhciBpbmRleCA9IGkgKyAxOyBpbmRleCA8IG1vdmVycy5sZW5ndGg7IGluZGV4KyspIHtcclxuICAgIC8vICAgdmFyIGRpc3RhbmNlID0gbW92ZXIudmVsb2NpdHkuZGlzdGFuY2VUbyhtb3ZlcnNbaW5kZXhdLnZlbG9jaXR5KTtcclxuICAgIC8vICAgdmFyIHJlYm91bmRfZGlzdGFuY2UgPSBtb3Zlci5yYWRpdXMgKyBtb3ZlcnNbaW5kZXhdLnJhZGl1cztcclxuICAgIC8vICAgaWYgKGRpc3RhbmNlIDwgcmVib3VuZF9kaXN0YW5jZSkge1xyXG4gICAgLy8gICAgIHZhciBvdmVybGFwID0gTWF0aC5hYnMoZGlzdGFuY2UgLSByZWJvdW5kX2Rpc3RhbmNlKTtcclxuICAgIC8vICAgICB2YXIgbm9ybWFsID0gbW92ZXIudmVsb2NpdHkuY2xvbmUoKS5zdWIobW92ZXJzW2luZGV4XS52ZWxvY2l0eSkubm9ybWFsaXplKCk7XHJcbiAgICAvLyAgICAgbW92ZXIudmVsb2NpdHkuc3ViKG5vcm1hbC5jbG9uZSgpLm11bHRTY2FsYXIob3ZlcmxhcCAqIC0xKSk7XHJcbiAgICAvLyAgICAgbW92ZXJzW2luZGV4XS52ZWxvY2l0eS5zdWIobm9ybWFsLmNsb25lKCkubXVsdFNjYWxhcihvdmVybGFwKSk7XHJcbiAgICAvLyAgICAgbW92ZXIucmVib3VuZChub3JtYWwuY2xvbmUoKS5tdWx0U2NhbGFyKC0xKSk7XHJcbiAgICAvLyAgICAgbW92ZXJzW2luZGV4XS5yZWJvdW5kKG5vcm1hbC5jbG9uZSgpKTtcclxuICAgIC8vICAgfVxyXG4gICAgLy8gfVxyXG4gICAgbW92ZXIudXBkYXRlUG9zaXRpb24oKTtcclxuICAgIG1vdmVyLmRyYXcoY3R4KTtcclxuICB9XHJcbn07XHJcblxyXG52YXIgcmVuZGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgY3R4LmNsZWFyUmVjdCgwLCAwLCBib2R5X3dpZHRoLCBib2R5X2hlaWdodCk7XHJcbiAgY3R4Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdsaWdodGVyJztcclxuICB1cGRhdGVNb3ZlcigpO1xyXG59O1xyXG5cclxudmFyIHJlbmRlcmxvb3AgPSBmdW5jdGlvbigpIHtcclxuICB2YXIgbm93ID0gRGF0ZS5ub3coKTtcclxuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVuZGVybG9vcCk7XHJcbiAgaWYgKG5vdyAtIGxhc3RfdGltZV9yZW5kZXIgPiAxMDAwIC8gZnBzKSB7XHJcbiAgICByZW5kZXIoKTtcclxuICAgIGxhc3RfdGltZV9yZW5kZXIgPSBEYXRlLm5vdygpO1xyXG4gIH1cclxufTtcclxuXHJcbnZhciByZXNpemVDYW52YXMgPSBmdW5jdGlvbigpIHtcclxuICBib2R5X3dpZHRoICA9IGRvY3VtZW50LmJvZHkuY2xpZW50V2lkdGggKiAyO1xyXG4gIGJvZHlfaGVpZ2h0ID0gZG9jdW1lbnQuYm9keS5jbGllbnRIZWlnaHQgKiAyO1xyXG5cclxuICBjYW52YXMud2lkdGggPSBib2R5X3dpZHRoO1xyXG4gIGNhbnZhcy5oZWlnaHQgPSBib2R5X2hlaWdodDtcclxuICBjYW52YXMuc3R5bGUud2lkdGggPSBib2R5X3dpZHRoIC8gMiArICdweCc7XHJcbiAgY2FudmFzLnN0eWxlLmhlaWdodCA9IGJvZHlfaGVpZ2h0IC8gMiArICdweCc7XHJcbn07XHJcblxyXG52YXIgc2V0RXZlbnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgdmFyIGV2ZW50VG91Y2hTdGFydCA9IGZ1bmN0aW9uKHgsIHkpIHtcclxuICB9O1xyXG4gIFxyXG4gIHZhciBldmVudFRvdWNoTW92ZSA9IGZ1bmN0aW9uKHgsIHkpIHtcclxuICB9O1xyXG4gIFxyXG4gIHZhciBldmVudFRvdWNoRW5kID0gZnVuY3Rpb24oeCwgeSkge1xyXG4gIH07XHJcblxyXG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdjb250ZXh0bWVudScsIGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICB9KTtcclxuXHJcbiAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3NlbGVjdHN0YXJ0JywgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gIH0pO1xyXG5cclxuICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgZXZlbnRUb3VjaFN0YXJ0KGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkpO1xyXG4gIH0pO1xyXG5cclxuICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgZXZlbnRUb3VjaE1vdmUoZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSk7XHJcbiAgfSk7XHJcblxyXG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgZXZlbnRUb3VjaEVuZCgpO1xyXG4gIH0pO1xyXG5cclxuICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIGV2ZW50VG91Y2hTdGFydChldmVudC50b3VjaGVzWzBdLmNsaWVudFgsIGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WSk7XHJcbiAgfSk7XHJcblxyXG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBldmVudFRvdWNoTW92ZShldmVudC50b3VjaGVzWzBdLmNsaWVudFgsIGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WSk7XHJcbiAgfSk7XHJcblxyXG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIGV2ZW50VG91Y2hFbmQoKTtcclxuICB9KTtcclxufTtcclxuXHJcbmluaXQoKTtcclxuIiwidmFyIFV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcclxudmFyIHV0aWwgPSBuZXcgVXRpbCgpO1xyXG52YXIgVmVjdG9yMiA9IHJlcXVpcmUoJy4vdmVjdG9yMicpO1xyXG5cclxudmFyIGV4cG9ydHMgPSBmdW5jdGlvbigpe1xyXG4gIHZhciBNb3ZlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5yYWRpdXMgPSAwO1xyXG4gICAgdGhpcy5tYXNzID0gMDtcclxuICAgIHRoaXMucG9zaXRpb24gPSBuZXcgVmVjdG9yMigpO1xyXG4gICAgdGhpcy52ZWxvY2l0eSA9IG5ldyBWZWN0b3IyKCk7XHJcbiAgICB0aGlzLmFjY2VsZXJhdGlvbiA9IG5ldyBWZWN0b3IyKCk7XHJcbiAgICB0aGlzLmRpcmVjdGlvbiA9IDA7XHJcbiAgICB0aGlzLnIgPSB1dGlsLmdldFJhbmRvbUludCgyMjAsIDI1NSk7XHJcbiAgICB0aGlzLmcgPSB1dGlsLmdldFJhbmRvbUludCg4MCwgMjIwKTtcclxuICAgIHRoaXMuYiA9IHV0aWwuZ2V0UmFuZG9tSW50KDEyMCwgMTQwKTtcclxuICB9O1xyXG4gIFxyXG4gIE1vdmVyLnByb3RvdHlwZSA9IHtcclxuICAgIG1vdmU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICB0aGlzLmFwcGx5RnJpY3Rpb24oKTtcclxuICAgICAgdGhpcy52ZWxvY2l0eS5hZGQodGhpcy5hY2NlbGVyYXRpb24pO1xyXG4gICAgICBpZiAodGhpcy52ZWxvY2l0eS5kaXN0YW5jZVRvKHRoaXMucG9zaXRpb24pID49IDEpIHtcclxuICAgICAgICB0aGlzLmRpcmVjdCh0aGlzLnZlbG9jaXR5KTtcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIHVwZGF0ZVBvc2l0aW9uOiBmdW5jdGlvbigpIHtcclxuICAgICAgdGhpcy5wb3NpdGlvbi5jb3B5KHRoaXMudmVsb2NpdHkpO1xyXG4gICAgfSxcclxuICAgIGFwcGx5Rm91cmNlOiBmdW5jdGlvbih2ZWN0b3IpIHtcclxuICAgICAgdGhpcy5hY2NlbGVyYXRpb24uYWRkKHZlY3Rvcik7XHJcbiAgICB9LFxyXG4gICAgYXBwbHlGcmljdGlvbjogZnVuY3Rpb24oKSB7XHJcbiAgICAgIHZhciBmcmljdGlvbiA9IHRoaXMuYWNjZWxlcmF0aW9uLmNsb25lKCk7XHJcbiAgICAgIGZyaWN0aW9uLm11bHRTY2FsYXIoLTEpO1xyXG4gICAgICBmcmljdGlvbi5ub3JtYWxpemUoKTtcclxuICAgICAgZnJpY3Rpb24ubXVsdFNjYWxhcigwLjEpO1xyXG4gICAgICB0aGlzLmFwcGx5Rm91cmNlKGZyaWN0aW9uKTtcclxuICAgIH0sXHJcbiAgICBkaXJlY3Q6IGZ1bmN0aW9uKHZlY3Rvcikge1xyXG4gICAgICB2YXIgdiA9IHZlY3Rvci5jbG9uZSgpLnN1Yih0aGlzLnBvc2l0aW9uKTtcclxuICAgICAgdGhpcy5kaXJlY3Rpb24gPSBNYXRoLmF0YW4yKHYueSwgdi54KTtcclxuICAgIH0sXHJcbiAgICByZWJvdW5kOiBmdW5jdGlvbih2ZWN0b3IpIHtcclxuICAgICAgdmFyIGRvdCA9IHRoaXMuYWNjZWxlcmF0aW9uLmNsb25lKCkuZG90KHZlY3Rvcik7XHJcbiAgICAgIHRoaXMuYWNjZWxlcmF0aW9uLnN1Yih2ZWN0b3IubXVsdFNjYWxhcigyICogZG90KSk7XHJcbiAgICAgIHRoaXMuYWNjZWxlcmF0aW9uLm11bHRTY2FsYXIoMC44KTtcclxuICAgIH0sXHJcbiAgICBkcmF3OiBmdW5jdGlvbihjb250ZXh0KSB7XHJcbiAgICAgIHZhciBncmFkID0gY29udGV4dC5jcmVhdGVSYWRpYWxHcmFkaWVudCh0aGlzLnBvc2l0aW9uLngsIHRoaXMucG9zaXRpb24ueSwgMCwgdGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnksIHRoaXMucmFkaXVzKTtcclxuXHJcbiAgICAgIGdyYWQuYWRkQ29sb3JTdG9wKDAsICdyZ2JhKCcgKyB0aGlzLnIgKyAnLCcgKyB0aGlzLmcgKyAnLCcgKyB0aGlzLmIgKyAnLCAwLjMpJyk7XHJcbiAgICAgIGdyYWQuYWRkQ29sb3JTdG9wKDEsICdyZ2JhKCcgKyB0aGlzLnIgKyAnLCcgKyB0aGlzLmcgKyAnLCcgKyB0aGlzLmIgKyAnLCAwKScpO1xyXG4gICAgICAvLyBjb250ZXh0LmxpbmVXaWR0aCA9IDg7XHJcbiAgICAgIC8vIGNvbnRleHQuZmlsbFN0eWxlID0gJ3JnYignICsgdGhpcy5yICsgJywnICsgdGhpcy5nICsgJywnICsgdGhpcy5iICsgJyknO1xyXG4gICAgICBjb250ZXh0LmZpbGxTdHlsZSA9IGdyYWQ7XHJcbiAgICAgIFxyXG4gICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xyXG4gICAgICAvLyBjb250ZXh0LmFyYyh0aGlzLnBvc2l0aW9uLngsIHRoaXMucG9zaXRpb24ueSwgdGhpcy5yYWRpdXMsIDAsIE1hdGguUEkgLyAxODAsIHRydWUpO1xyXG4gICAgICAvLyBjb250ZXh0LnNoYWRvd0NvbG9yID0gJyMzMzMnXHJcbiAgICAgIC8vIGNvbnRleHQuc2hhZG93T2Zmc2V0WCA9IDA7XHJcbiAgICAgIC8vIGNvbnRleHQuc2hhZG93T2Zmc2V0WSA9IDA7XHJcbiAgICAgIC8vIGNvbnRleHQuc2hhZG93Qmx1ciA9IDIwMDtcclxuICAgICAgY29udGV4dC5yZWN0KHRoaXMucG9zaXRpb24ueCAtIHRoaXMucmFkaXVzLCB0aGlzLnBvc2l0aW9uLnkgLSB0aGlzLnJhZGl1cywgdGhpcy5wb3NpdGlvbi54ICsgdGhpcy5yYWRpdXMsIHRoaXMucG9zaXRpb24ueSArIHRoaXMucmFkaXVzKTtcclxuICAgICAgY29udGV4dC5maWxsKCk7XHJcbiAgICAgIFxyXG4gICAgICAvLyBjb250ZXh0LnN0cm9rZVN0eWxlID0gJyNmZmZmZmYnO1xyXG4gICAgICAvLyBjb250ZXh0LmJlZ2luUGF0aCgpO1xyXG4gICAgICAvLyBjb250ZXh0Lm1vdmVUbyh0aGlzLnBvc2l0aW9uLngsIHRoaXMucG9zaXRpb24ueSk7XHJcbiAgICAgIC8vIGNvbnRleHQubGluZVRvKHRoaXMucG9zaXRpb24ueCArIE1hdGguY29zKHRoaXMuZGlyZWN0aW9uKSAqIHRoaXMucmFkaXVzLCB0aGlzLnBvc2l0aW9uLnkgKyBNYXRoLnNpbih0aGlzLmRpcmVjdGlvbikgKiB0aGlzLnJhZGl1cyk7XHJcbiAgICAgIC8vIGNvbnRleHQuc3Ryb2tlKCk7XHJcbiAgICB9XHJcbiAgfTtcclxuICBcclxuICByZXR1cm4gTW92ZXI7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMoKTtcclxuIiwidmFyIGV4cG9ydHMgPSBmdW5jdGlvbigpe1xyXG4gIHZhciBVdGlsID0gZnVuY3Rpb24oKSB7fTtcclxuICBcclxuICBVdGlsLnByb3RvdHlwZS5nZXRSYW5kb21JbnQgPSBmdW5jdGlvbihtaW4sIG1heCl7XHJcbiAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikpICsgbWluO1xyXG4gIH07XHJcbiAgXHJcbiAgVXRpbC5wcm90b3R5cGUuZ2V0RGVncmVlID0gZnVuY3Rpb24ocmFkaWFuKSB7XHJcbiAgICByZXR1cm4gcmFkaWFuIC8gTWF0aC5QSSAqIDE4MDtcclxuICB9O1xyXG4gIFxyXG4gIFV0aWwucHJvdG90eXBlLmdldFJhZGlhbiA9IGZ1bmN0aW9uKGRlZ3JlZXMpIHtcclxuICAgIHJldHVybiBkZWdyZWVzICogTWF0aC5QSSAvIDE4MDtcclxuICB9O1xyXG4gIFxyXG4gIFV0aWwucHJvdG90eXBlLmdldFNwaGVyaWNhbCA9IGZ1bmN0aW9uKHJhZDEsIHJhZDIsIHIpIHtcclxuICAgIHZhciB4ID0gTWF0aC5jb3MocmFkMSkgKiBNYXRoLmNvcyhyYWQyKSAqIHI7XHJcbiAgICB2YXIgeiA9IE1hdGguY29zKHJhZDEpICogTWF0aC5zaW4ocmFkMikgKiByO1xyXG4gICAgdmFyIHkgPSBNYXRoLnNpbihyYWQxKSAqIHI7XHJcbiAgICByZXR1cm4gW3gsIHksIHpdO1xyXG4gIH07XHJcbiAgXHJcbiAgcmV0dXJuIFV0aWw7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMoKTtcclxuIiwiLy8gXHJcbi8vIOOBk+OBrlZlY3RvcjLjgq/jg6njgrnjga/jgIF0aHJlZS5qc+OBrlRIUkVFLlZlY3RvcjLjgq/jg6njgrnjga7oqIjnrpflvI/jga7kuIDpg6jjgpLliKnnlKjjgZfjgabjgYTjgb7jgZnjgIJcclxuLy8gaHR0cHM6Ly9naXRodWIuY29tL21yZG9vYi90aHJlZS5qcy9ibG9iL21hc3Rlci9zcmMvbWF0aC9WZWN0b3IyLmpzI0wzNjdcclxuLy8gXHJcblxyXG52YXIgZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XHJcbiAgdmFyIFZlY3RvcjIgPSBmdW5jdGlvbih4LCB5KSB7XHJcbiAgICB0aGlzLnggPSB4IHx8IDA7XHJcbiAgICB0aGlzLnkgPSB5IHx8IDA7XHJcbiAgfTtcclxuICBcclxuICBWZWN0b3IyLnByb3RvdHlwZSA9IHtcclxuICAgIHNldDogZnVuY3Rpb24gKHgsIHkpIHtcclxuICAgICAgdGhpcy54ID0geDtcclxuICAgICAgdGhpcy55ID0geTtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG4gICAgY29weTogZnVuY3Rpb24gKHYpIHtcclxuICAgICAgdGhpcy54ID0gdi54O1xyXG4gICAgICB0aGlzLnkgPSB2Lnk7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuICAgIGFkZDogZnVuY3Rpb24gKHYpIHtcclxuICAgICAgdGhpcy54ICs9IHYueDtcclxuICAgICAgdGhpcy55ICs9IHYueTtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG4gICAgYWRkU2NhbGFyOiBmdW5jdGlvbiAocykge1xyXG4gICAgICB0aGlzLnggKz0gcztcclxuICAgICAgdGhpcy55ICs9IHM7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuICAgIHN1YjogZnVuY3Rpb24gKHYpIHtcclxuICAgICAgdGhpcy54IC09IHYueDtcclxuICAgICAgdGhpcy55IC09IHYueTtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG4gICAgc3ViU2NhbGFyOiBmdW5jdGlvbiAocykge1xyXG4gICAgICB0aGlzLnggLT0gcztcclxuICAgICAgdGhpcy55IC09IHM7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuICAgIG11bHQ6IGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgIHRoaXMueCAqPSB2Lng7XHJcbiAgICAgIHRoaXMueSAqPSB2Lnk7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuICAgIG11bHRTY2FsYXI6IGZ1bmN0aW9uIChzKSB7XHJcbiAgICAgIHRoaXMueCAqPSBzO1xyXG4gICAgICB0aGlzLnkgKj0gcztcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG4gICAgZGl2OiBmdW5jdGlvbiAodikge1xyXG4gICAgICB0aGlzLnggLz0gdi54O1xyXG4gICAgICB0aGlzLnkgLz0gdi55O1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH0sXHJcbiAgICBkaXZTY2FsYXI6IGZ1bmN0aW9uIChzKSB7XHJcbiAgICAgIHRoaXMueCAvPSBzO1xyXG4gICAgICB0aGlzLnkgLz0gcztcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG4gICAgbWluOiBmdW5jdGlvbiAodikge1xyXG4gICAgICBpZiAoIHRoaXMueCA8IHYueCApIHRoaXMueCA9IHYueDtcclxuICAgICAgaWYgKCB0aGlzLnkgPCB2LnkgKSB0aGlzLnkgPSB2Lnk7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuICAgIG1heDogZnVuY3Rpb24gKHYpIHtcclxuICAgICAgaWYgKCB0aGlzLnggPiB2LnggKSB0aGlzLnggPSB2Lng7XHJcbiAgICAgIGlmICggdGhpcy55ID4gdi55ICkgdGhpcy55ID0gdi55O1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH0sXHJcbiAgICBjbGFtcDogZnVuY3Rpb24gKHZfbWluLCB2X21heCkge1xyXG4gICAgICBpZiAoIHRoaXMueCA8IHZfbWluLnggKSB7XHJcbiAgICAgICAgdGhpcy54ID0gdl9taW4ueDtcclxuICAgICAgfSBlbHNlIGlmICggdGhpcy54ID4gdl9tYXgueCApIHtcclxuICAgICAgICB0aGlzLnggPSB2X21heC54O1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggdGhpcy55IDwgdl9taW4ueSApIHtcclxuICAgICAgICB0aGlzLnkgPSB2X21pbi55O1xyXG4gICAgICB9IGVsc2UgaWYgKCB0aGlzLnkgPiB2X21heC55ICkge1xyXG4gICAgICAgIHRoaXMueSA9IHZfbWF4Lnk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG4gICAgZmxvb3I6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgdGhpcy54ID0gTWF0aC5mbG9vciggdGhpcy54ICk7XHJcbiAgICAgIHRoaXMueSA9IE1hdGguZmxvb3IoIHRoaXMueSApO1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH0sXHJcbiAgICBjZWlsOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHRoaXMueCA9IE1hdGguY2VpbCggdGhpcy54ICk7XHJcbiAgICAgIHRoaXMueSA9IE1hdGguY2VpbCggdGhpcy55ICk7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuICAgIHJvdW5kOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHRoaXMueCA9IE1hdGgucm91bmQoIHRoaXMueCApO1xyXG4gICAgICB0aGlzLnkgPSBNYXRoLnJvdW5kKCB0aGlzLnkgKTtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG4gICAgcm91bmRUb1plcm86IGZ1bmN0aW9uICgpIHtcclxuICAgICAgdGhpcy54ID0gKCB0aGlzLnggPCAwICkgPyBNYXRoLmNlaWwoIHRoaXMueCApIDogTWF0aC5mbG9vciggdGhpcy54ICk7XHJcbiAgICAgIHRoaXMueSA9ICggdGhpcy55IDwgMCApID8gTWF0aC5jZWlsKCB0aGlzLnkgKSA6IE1hdGguZmxvb3IoIHRoaXMueSApO1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH0sXHJcbiAgICBuZWdhdGU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgdGhpcy54ID0gLSB0aGlzLng7XHJcbiAgICAgIHRoaXMueSA9IC0gdGhpcy55O1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH0sXHJcbiAgICBkb3Q6IGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgIHJldHVybiB0aGlzLnggKiB2LnggKyB0aGlzLnkgKiB2Lnk7XHJcbiAgICB9LFxyXG4gICAgbGVuZ3RoU3E6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgcmV0dXJuIHRoaXMueCAqIHRoaXMueCArIHRoaXMueSAqIHRoaXMueTtcclxuICAgIH0sXHJcbiAgICBsZW5ndGg6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgcmV0dXJuIE1hdGguc3FydCh0aGlzLmxlbmd0aFNxKCkpO1xyXG4gICAgfSxcclxuICAgIG5vcm1hbGl6ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICByZXR1cm4gdGhpcy5kaXZTY2FsYXIodGhpcy5sZW5ndGgoKSk7XHJcbiAgICB9LFxyXG4gICAgZGlzdGFuY2VUbzogZnVuY3Rpb24gKHYpIHtcclxuICAgICAgdmFyIGR4ID0gdGhpcy54IC0gdi54O1xyXG4gICAgICB2YXIgZHkgPSB0aGlzLnkgLSB2Lnk7XHJcbiAgICAgIHJldHVybiBNYXRoLnNxcnQoZHggKiBkeCArIGR5ICogZHkpO1xyXG4gICAgfSxcclxuICAgIHNldExlbmd0aDogZnVuY3Rpb24gKGwpIHtcclxuICAgICAgdmFyIG9sZExlbmd0aCA9IHRoaXMubGVuZ3RoKCk7XHJcbiAgICAgIGlmICggb2xkTGVuZ3RoICE9PSAwICYmIGwgIT09IG9sZExlbmd0aCApIHtcclxuICAgICAgICB0aGlzLm11bHRTY2FsYXIobCAvIG9sZExlbmd0aCk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG4gICAgY2xvbmU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgcmV0dXJuIG5ldyBWZWN0b3IyKHRoaXMueCwgdGhpcy55KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiBWZWN0b3IyO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzKCk7XHJcbiJdfQ==
