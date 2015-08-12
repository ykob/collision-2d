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

var moversNum = 100;
var movers = [];

var init = function() {
  for (var i = 0; i < moversNum; i++) {
    var mover = new Mover();
    var radian = util.getRadian(util.getRandomInt(0, 360));
    var scalar = util.getRandomInt(20, 40);
    var force = new Vector2(Math.cos(radian) * scalar, Math.sin(radian) * scalar);
    var x = body_width / 2;
    var y = body_height / 2;
    var radius_base = 0;
    
    mover.radius = util.getRandomInt(20, 40);
    mover.mass = mover.radius / 10;
    mover.position.set(x, y);
    mover.velocity.set(x, y);
    force.divScalar(mover.mass);
    mover.applyForce(force);
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
      // var radian = util.getRadian(util.getRandomInt(0, 360));
      // var scalar = util.getRandomInt(200, 300);
      // var force = new Vector2(Math.cos(radian) * scalar, Math.sin(radian) * scalar);
      
      // force.divScalar(mover.mass);
      // mover.applyForce(force);
    }
    // 壁との衝突判定
    // if (mover.position.y - mover.radius < 0) {
    //   var normal = new Vector2(0, 1);
    //   mover.velocity.y = mover.radius;
    //   collision = true;
    // } else if (mover.position.y + mover.radius > body_height) {
    //   var normal = new Vector2(0, -1);
    //   mover.velocity.y = body_height - mover.radius;
    //   collision = true;
    // } else if (mover.position.x - mover.radius < 0) {
    //   var normal = new Vector2(1, 0);
    //   mover.velocity.x = mover.radius;
    //   collision = true;
    // } else if (mover.position.x + mover.radius > body_width) {
    //   var normal = new Vector2(-1, 0);
    //   mover.velocity.x = body_width - mover.radius;
    //   collision = true;
    // }
    // if (collision) {
    //   mover.rebound(normal);
    // }
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
    this.position = new Vector2();
    this.velocity = new Vector2();
    this.acceleration = new Vector2();
    this.radius = 0;
    this.mass = 0;
    this.direction = 0;
    this.r = util.getRandomInt(220, 255);
    this.g = util.getRandomInt(80, 220);
    this.b = util.getRandomInt(120, 140);
  };
  
  Mover.prototype = {
    move: function() {
      if (this.acceleration.length() > 0) {
        this.applyFriction();
      }
      this.velocity.add(this.acceleration);
      if (this.velocity.distanceTo(this.position) >= 1) {
        this.direct(this.velocity);
      }
    },
    updatePosition: function() {
      this.position.copy(this.velocity);
      if (this.acceleration.length() < 1) {
        this.acceleration.set(0, 0);
      }
    },
    applyForce: function(vector) {
      this.acceleration.add(vector);
    },
    applyFriction: function() {
      var friction = this.acceleration.clone();
      friction.multScalar(-1);
      friction.normalize();
      friction.multScalar(0.1);
      this.applyForce(friction);
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
      context.fill();
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvZGVib3VuY2UuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy9tb3Zlci5qcyIsInNyYy9qcy91dGlsLmpzIiwic3JjL2pzL3ZlY3RvcjIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob2JqZWN0LCBldmVudFR5cGUsIGNhbGxiYWNrKXtcbiAgdmFyIHRpbWVyO1xuXG4gIG9iamVjdC5hZGRFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgY2FsbGJhY2soZXZlbnQpO1xuICAgIH0sIDUwMCk7XG4gIH0sIGZhbHNlKTtcbn07XG4iLCJ2YXIgVXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xudmFyIHV0aWwgPSBuZXcgVXRpbCgpO1xudmFyIFZlY3RvcjIgPSByZXF1aXJlKCcuL3ZlY3RvcjInKTtcbnZhciBNb3ZlciA9IHJlcXVpcmUoJy4vbW92ZXInKTtcbnZhciBkZWJvdW5jZSA9IHJlcXVpcmUoJy4vZGVib3VuY2UnKTtcblxudmFyIGJvZHlfd2lkdGggID0gZG9jdW1lbnQuYm9keS5jbGllbnRXaWR0aCAqIDI7XG52YXIgYm9keV9oZWlnaHQgPSBkb2N1bWVudC5ib2R5LmNsaWVudEhlaWdodCAqIDI7XG52YXIgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhcycpO1xudmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xudmFyIGZwcyA9IDYwO1xudmFyIGxhc3RfdGltZV9yZW5kZXIgPSBEYXRlLm5vdygpO1xuXG52YXIgbW92ZXJzTnVtID0gMTAwO1xudmFyIG1vdmVycyA9IFtdO1xuXG52YXIgaW5pdCA9IGZ1bmN0aW9uKCkge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG1vdmVyc051bTsgaSsrKSB7XG4gICAgdmFyIG1vdmVyID0gbmV3IE1vdmVyKCk7XG4gICAgdmFyIHJhZGlhbiA9IHV0aWwuZ2V0UmFkaWFuKHV0aWwuZ2V0UmFuZG9tSW50KDAsIDM2MCkpO1xuICAgIHZhciBzY2FsYXIgPSB1dGlsLmdldFJhbmRvbUludCgyMCwgNDApO1xuICAgIHZhciBmb3JjZSA9IG5ldyBWZWN0b3IyKE1hdGguY29zKHJhZGlhbikgKiBzY2FsYXIsIE1hdGguc2luKHJhZGlhbikgKiBzY2FsYXIpO1xuICAgIHZhciB4ID0gYm9keV93aWR0aCAvIDI7XG4gICAgdmFyIHkgPSBib2R5X2hlaWdodCAvIDI7XG4gICAgdmFyIHJhZGl1c19iYXNlID0gMDtcbiAgICBcbiAgICBtb3Zlci5yYWRpdXMgPSB1dGlsLmdldFJhbmRvbUludCgyMCwgNDApO1xuICAgIG1vdmVyLm1hc3MgPSBtb3Zlci5yYWRpdXMgLyAxMDtcbiAgICBtb3Zlci5wb3NpdGlvbi5zZXQoeCwgeSk7XG4gICAgbW92ZXIudmVsb2NpdHkuc2V0KHgsIHkpO1xuICAgIGZvcmNlLmRpdlNjYWxhcihtb3Zlci5tYXNzKTtcbiAgICBtb3Zlci5hcHBseUZvcmNlKGZvcmNlKTtcbiAgICBtb3ZlcnNbaV0gPSBtb3ZlcjtcbiAgfVxuICBcbiAgc2V0RXZlbnQoKTtcbiAgcmVzaXplQ2FudmFzKCk7XG4gIHJlbmRlcmxvb3AoKTtcbiAgZGVib3VuY2Uod2luZG93LCAncmVzaXplJywgZnVuY3Rpb24oZXZlbnQpe1xuICAgIHJlc2l6ZUNhbnZhcygpO1xuICB9KTtcbn07XG5cbnZhciB1cGRhdGVNb3ZlciA9IGZ1bmN0aW9uKCkge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG1vdmVycy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBtb3ZlciA9IG1vdmVyc1tpXTtcbiAgICB2YXIgY29sbGlzaW9uID0gZmFsc2U7XG4gICAgXG4gICAgbW92ZXIubW92ZSgpO1xuICAgIFxuICAgIC8vIOWKoOmAn+W6puOBjDDjgavjgarjgaPjgZ/jgajjgY3jgavlho3luqblipvjgpLliqDjgYjjgovjgIJcbiAgICBpZiAobW92ZXIuYWNjZWxlcmF0aW9uLmxlbmd0aCgpIDw9IDEpIHtcbiAgICAgIC8vIHZhciByYWRpYW4gPSB1dGlsLmdldFJhZGlhbih1dGlsLmdldFJhbmRvbUludCgwLCAzNjApKTtcbiAgICAgIC8vIHZhciBzY2FsYXIgPSB1dGlsLmdldFJhbmRvbUludCgyMDAsIDMwMCk7XG4gICAgICAvLyB2YXIgZm9yY2UgPSBuZXcgVmVjdG9yMihNYXRoLmNvcyhyYWRpYW4pICogc2NhbGFyLCBNYXRoLnNpbihyYWRpYW4pICogc2NhbGFyKTtcbiAgICAgIFxuICAgICAgLy8gZm9yY2UuZGl2U2NhbGFyKG1vdmVyLm1hc3MpO1xuICAgICAgLy8gbW92ZXIuYXBwbHlGb3JjZShmb3JjZSk7XG4gICAgfVxuICAgIC8vIOWjgeOBqOOBruihneeqgeWIpOWumlxuICAgIC8vIGlmIChtb3Zlci5wb3NpdGlvbi55IC0gbW92ZXIucmFkaXVzIDwgMCkge1xuICAgIC8vICAgdmFyIG5vcm1hbCA9IG5ldyBWZWN0b3IyKDAsIDEpO1xuICAgIC8vICAgbW92ZXIudmVsb2NpdHkueSA9IG1vdmVyLnJhZGl1cztcbiAgICAvLyAgIGNvbGxpc2lvbiA9IHRydWU7XG4gICAgLy8gfSBlbHNlIGlmIChtb3Zlci5wb3NpdGlvbi55ICsgbW92ZXIucmFkaXVzID4gYm9keV9oZWlnaHQpIHtcbiAgICAvLyAgIHZhciBub3JtYWwgPSBuZXcgVmVjdG9yMigwLCAtMSk7XG4gICAgLy8gICBtb3Zlci52ZWxvY2l0eS55ID0gYm9keV9oZWlnaHQgLSBtb3Zlci5yYWRpdXM7XG4gICAgLy8gICBjb2xsaXNpb24gPSB0cnVlO1xuICAgIC8vIH0gZWxzZSBpZiAobW92ZXIucG9zaXRpb24ueCAtIG1vdmVyLnJhZGl1cyA8IDApIHtcbiAgICAvLyAgIHZhciBub3JtYWwgPSBuZXcgVmVjdG9yMigxLCAwKTtcbiAgICAvLyAgIG1vdmVyLnZlbG9jaXR5LnggPSBtb3Zlci5yYWRpdXM7XG4gICAgLy8gICBjb2xsaXNpb24gPSB0cnVlO1xuICAgIC8vIH0gZWxzZSBpZiAobW92ZXIucG9zaXRpb24ueCArIG1vdmVyLnJhZGl1cyA+IGJvZHlfd2lkdGgpIHtcbiAgICAvLyAgIHZhciBub3JtYWwgPSBuZXcgVmVjdG9yMigtMSwgMCk7XG4gICAgLy8gICBtb3Zlci52ZWxvY2l0eS54ID0gYm9keV93aWR0aCAtIG1vdmVyLnJhZGl1cztcbiAgICAvLyAgIGNvbGxpc2lvbiA9IHRydWU7XG4gICAgLy8gfVxuICAgIC8vIGlmIChjb2xsaXNpb24pIHtcbiAgICAvLyAgIG1vdmVyLnJlYm91bmQobm9ybWFsKTtcbiAgICAvLyB9XG4gICAgLy8gbW92ZXLlkIzlo6vjga7ooZ3nqoHliKTlrppcbiAgICAvLyBmb3IgKHZhciBpbmRleCA9IGkgKyAxOyBpbmRleCA8IG1vdmVycy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAvLyAgIHZhciBkaXN0YW5jZSA9IG1vdmVyLnZlbG9jaXR5LmRpc3RhbmNlVG8obW92ZXJzW2luZGV4XS52ZWxvY2l0eSk7XG4gICAgLy8gICB2YXIgcmVib3VuZF9kaXN0YW5jZSA9IG1vdmVyLnJhZGl1cyArIG1vdmVyc1tpbmRleF0ucmFkaXVzO1xuICAgIC8vICAgaWYgKGRpc3RhbmNlIDwgcmVib3VuZF9kaXN0YW5jZSkge1xuICAgIC8vICAgICB2YXIgb3ZlcmxhcCA9IE1hdGguYWJzKGRpc3RhbmNlIC0gcmVib3VuZF9kaXN0YW5jZSk7XG4gICAgLy8gICAgIHZhciBub3JtYWwgPSBtb3Zlci52ZWxvY2l0eS5jbG9uZSgpLnN1Yihtb3ZlcnNbaW5kZXhdLnZlbG9jaXR5KS5ub3JtYWxpemUoKTtcbiAgICAvLyAgICAgbW92ZXIudmVsb2NpdHkuc3ViKG5vcm1hbC5jbG9uZSgpLm11bHRTY2FsYXIob3ZlcmxhcCAqIC0xKSk7XG4gICAgLy8gICAgIG1vdmVyc1tpbmRleF0udmVsb2NpdHkuc3ViKG5vcm1hbC5jbG9uZSgpLm11bHRTY2FsYXIob3ZlcmxhcCkpO1xuICAgIC8vICAgICBtb3Zlci5yZWJvdW5kKG5vcm1hbC5jbG9uZSgpLm11bHRTY2FsYXIoLTEpKTtcbiAgICAvLyAgICAgbW92ZXJzW2luZGV4XS5yZWJvdW5kKG5vcm1hbC5jbG9uZSgpKTtcbiAgICAvLyAgIH1cbiAgICAvLyB9XG4gICAgbW92ZXIudXBkYXRlUG9zaXRpb24oKTtcbiAgICBtb3Zlci5kcmF3KGN0eCk7XG4gIH1cbn07XG5cbnZhciByZW5kZXIgPSBmdW5jdGlvbigpIHtcbiAgY3R4LmNsZWFyUmVjdCgwLCAwLCBib2R5X3dpZHRoLCBib2R5X2hlaWdodCk7XG4gIGN0eC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnbGlnaHRlcic7XG4gIHVwZGF0ZU1vdmVyKCk7XG59O1xuXG52YXIgcmVuZGVybG9vcCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgbm93ID0gRGF0ZS5ub3coKTtcbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlbmRlcmxvb3ApO1xuICBpZiAobm93IC0gbGFzdF90aW1lX3JlbmRlciA+IDEwMDAgLyBmcHMpIHtcbiAgICByZW5kZXIoKTtcbiAgICBsYXN0X3RpbWVfcmVuZGVyID0gRGF0ZS5ub3coKTtcbiAgfVxufTtcblxudmFyIHJlc2l6ZUNhbnZhcyA9IGZ1bmN0aW9uKCkge1xuICBib2R5X3dpZHRoICA9IGRvY3VtZW50LmJvZHkuY2xpZW50V2lkdGggKiAyO1xuICBib2R5X2hlaWdodCA9IGRvY3VtZW50LmJvZHkuY2xpZW50SGVpZ2h0ICogMjtcblxuICBjYW52YXMud2lkdGggPSBib2R5X3dpZHRoO1xuICBjYW52YXMuaGVpZ2h0ID0gYm9keV9oZWlnaHQ7XG4gIGNhbnZhcy5zdHlsZS53aWR0aCA9IGJvZHlfd2lkdGggLyAyICsgJ3B4JztcbiAgY2FudmFzLnN0eWxlLmhlaWdodCA9IGJvZHlfaGVpZ2h0IC8gMiArICdweCc7XG59O1xuXG52YXIgc2V0RXZlbnQgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBldmVudFRvdWNoU3RhcnQgPSBmdW5jdGlvbih4LCB5KSB7XG4gIH07XG4gIFxuICB2YXIgZXZlbnRUb3VjaE1vdmUgPSBmdW5jdGlvbih4LCB5KSB7XG4gIH07XG4gIFxuICB2YXIgZXZlbnRUb3VjaEVuZCA9IGZ1bmN0aW9uKHgsIHkpIHtcbiAgfTtcblxuICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICB9KTtcblxuICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignc2VsZWN0c3RhcnQnLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICB9KTtcblxuICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBldmVudFRvdWNoU3RhcnQoZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSk7XG4gIH0pO1xuXG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGV2ZW50VG91Y2hNb3ZlKGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkpO1xuICB9KTtcblxuICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGZ1bmN0aW9uIChldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgZXZlbnRUb3VjaEVuZCgpO1xuICB9KTtcblxuICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIGZ1bmN0aW9uIChldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgZXZlbnRUb3VjaFN0YXJ0KGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WCwgZXZlbnQudG91Y2hlc1swXS5jbGllbnRZKTtcbiAgfSk7XG5cbiAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIGZ1bmN0aW9uIChldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgZXZlbnRUb3VjaE1vdmUoZXZlbnQudG91Y2hlc1swXS5jbGllbnRYLCBldmVudC50b3VjaGVzWzBdLmNsaWVudFkpO1xuICB9KTtcblxuICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGV2ZW50VG91Y2hFbmQoKTtcbiAgfSk7XG59O1xuXG5pbml0KCk7XG4iLCJ2YXIgVXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xudmFyIHV0aWwgPSBuZXcgVXRpbCgpO1xudmFyIFZlY3RvcjIgPSByZXF1aXJlKCcuL3ZlY3RvcjInKTtcblxudmFyIGV4cG9ydHMgPSBmdW5jdGlvbigpe1xuICB2YXIgTW92ZXIgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnBvc2l0aW9uID0gbmV3IFZlY3RvcjIoKTtcbiAgICB0aGlzLnZlbG9jaXR5ID0gbmV3IFZlY3RvcjIoKTtcbiAgICB0aGlzLmFjY2VsZXJhdGlvbiA9IG5ldyBWZWN0b3IyKCk7XG4gICAgdGhpcy5yYWRpdXMgPSAwO1xuICAgIHRoaXMubWFzcyA9IDA7XG4gICAgdGhpcy5kaXJlY3Rpb24gPSAwO1xuICAgIHRoaXMuciA9IHV0aWwuZ2V0UmFuZG9tSW50KDIyMCwgMjU1KTtcbiAgICB0aGlzLmcgPSB1dGlsLmdldFJhbmRvbUludCg4MCwgMjIwKTtcbiAgICB0aGlzLmIgPSB1dGlsLmdldFJhbmRvbUludCgxMjAsIDE0MCk7XG4gIH07XG4gIFxuICBNb3Zlci5wcm90b3R5cGUgPSB7XG4gICAgbW92ZTogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5hY2NlbGVyYXRpb24ubGVuZ3RoKCkgPiAwKSB7XG4gICAgICAgIHRoaXMuYXBwbHlGcmljdGlvbigpO1xuICAgICAgfVxuICAgICAgdGhpcy52ZWxvY2l0eS5hZGQodGhpcy5hY2NlbGVyYXRpb24pO1xuICAgICAgaWYgKHRoaXMudmVsb2NpdHkuZGlzdGFuY2VUbyh0aGlzLnBvc2l0aW9uKSA+PSAxKSB7XG4gICAgICAgIHRoaXMuZGlyZWN0KHRoaXMudmVsb2NpdHkpO1xuICAgICAgfVxuICAgIH0sXG4gICAgdXBkYXRlUG9zaXRpb246IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5wb3NpdGlvbi5jb3B5KHRoaXMudmVsb2NpdHkpO1xuICAgICAgaWYgKHRoaXMuYWNjZWxlcmF0aW9uLmxlbmd0aCgpIDwgMSkge1xuICAgICAgICB0aGlzLmFjY2VsZXJhdGlvbi5zZXQoMCwgMCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBhcHBseUZvcmNlOiBmdW5jdGlvbih2ZWN0b3IpIHtcbiAgICAgIHRoaXMuYWNjZWxlcmF0aW9uLmFkZCh2ZWN0b3IpO1xuICAgIH0sXG4gICAgYXBwbHlGcmljdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZnJpY3Rpb24gPSB0aGlzLmFjY2VsZXJhdGlvbi5jbG9uZSgpO1xuICAgICAgZnJpY3Rpb24ubXVsdFNjYWxhcigtMSk7XG4gICAgICBmcmljdGlvbi5ub3JtYWxpemUoKTtcbiAgICAgIGZyaWN0aW9uLm11bHRTY2FsYXIoMC4xKTtcbiAgICAgIHRoaXMuYXBwbHlGb3JjZShmcmljdGlvbik7XG4gICAgfSxcbiAgICBkaXJlY3Q6IGZ1bmN0aW9uKHZlY3Rvcikge1xuICAgICAgdmFyIHYgPSB2ZWN0b3IuY2xvbmUoKS5zdWIodGhpcy5wb3NpdGlvbik7XG4gICAgICB0aGlzLmRpcmVjdGlvbiA9IE1hdGguYXRhbjIodi55LCB2LngpO1xuICAgIH0sXG4gICAgcmVib3VuZDogZnVuY3Rpb24odmVjdG9yKSB7XG4gICAgICB2YXIgZG90ID0gdGhpcy5hY2NlbGVyYXRpb24uY2xvbmUoKS5kb3QodmVjdG9yKTtcbiAgICAgIHRoaXMuYWNjZWxlcmF0aW9uLnN1Yih2ZWN0b3IubXVsdFNjYWxhcigyICogZG90KSk7XG4gICAgICB0aGlzLmFjY2VsZXJhdGlvbi5tdWx0U2NhbGFyKDAuOCk7XG4gICAgfSxcbiAgICBkcmF3OiBmdW5jdGlvbihjb250ZXh0KSB7XG4gICAgICBjb250ZXh0LmxpbmVXaWR0aCA9IDg7XG4gICAgICBjb250ZXh0LmZpbGxTdHlsZSA9ICdyZ2IoJyArIHRoaXMuciArICcsJyArIHRoaXMuZyArICcsJyArIHRoaXMuYiArICcpJztcbiAgICAgIFxuICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgIGNvbnRleHQuYXJjKHRoaXMucG9zaXRpb24ueCwgdGhpcy5wb3NpdGlvbi55LCB0aGlzLnJhZGl1cywgMCwgTWF0aC5QSSAvIDE4MCwgdHJ1ZSk7XG4gICAgICBjb250ZXh0LmZpbGwoKTtcbiAgICB9XG4gIH07XG4gIFxuICByZXR1cm4gTW92ZXI7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMoKTtcbiIsInZhciBleHBvcnRzID0gZnVuY3Rpb24oKXtcbiAgdmFyIFV0aWwgPSBmdW5jdGlvbigpIHt9O1xuICBcbiAgVXRpbC5wcm90b3R5cGUuZ2V0UmFuZG9tSW50ID0gZnVuY3Rpb24obWluLCBtYXgpe1xuICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSkgKyBtaW47XG4gIH07XG4gIFxuICBVdGlsLnByb3RvdHlwZS5nZXREZWdyZWUgPSBmdW5jdGlvbihyYWRpYW4pIHtcbiAgICByZXR1cm4gcmFkaWFuIC8gTWF0aC5QSSAqIDE4MDtcbiAgfTtcbiAgXG4gIFV0aWwucHJvdG90eXBlLmdldFJhZGlhbiA9IGZ1bmN0aW9uKGRlZ3JlZXMpIHtcbiAgICByZXR1cm4gZGVncmVlcyAqIE1hdGguUEkgLyAxODA7XG4gIH07XG4gIFxuICBVdGlsLnByb3RvdHlwZS5nZXRTcGhlcmljYWwgPSBmdW5jdGlvbihyYWQxLCByYWQyLCByKSB7XG4gICAgdmFyIHggPSBNYXRoLmNvcyhyYWQxKSAqIE1hdGguY29zKHJhZDIpICogcjtcbiAgICB2YXIgeiA9IE1hdGguY29zKHJhZDEpICogTWF0aC5zaW4ocmFkMikgKiByO1xuICAgIHZhciB5ID0gTWF0aC5zaW4ocmFkMSkgKiByO1xuICAgIHJldHVybiBbeCwgeSwgel07XG4gIH07XG4gIFxuICByZXR1cm4gVXRpbDtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cygpO1xuIiwiLy8gXG4vLyDjgZPjga5WZWN0b3Iy44Kv44Op44K544Gv44CBdGhyZWUuanPjga5USFJFRS5WZWN0b3Iy44Kv44Op44K544Gu6KiI566X5byP44Gu5LiA6YOo44KS5Yip55So44GX44Gm44GE44G+44GZ44CCXG4vLyBodHRwczovL2dpdGh1Yi5jb20vbXJkb29iL3RocmVlLmpzL2Jsb2IvbWFzdGVyL3NyYy9tYXRoL1ZlY3RvcjIuanMjTDM2N1xuLy8gXG5cbnZhciBleHBvcnRzID0gZnVuY3Rpb24oKXtcbiAgdmFyIFZlY3RvcjIgPSBmdW5jdGlvbih4LCB5KSB7XG4gICAgdGhpcy54ID0geCB8fCAwO1xuICAgIHRoaXMueSA9IHkgfHwgMDtcbiAgfTtcbiAgXG4gIFZlY3RvcjIucHJvdG90eXBlID0ge1xuICAgIHNldDogZnVuY3Rpb24gKHgsIHkpIHtcbiAgICAgIHRoaXMueCA9IHg7XG4gICAgICB0aGlzLnkgPSB5O1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBjb3B5OiBmdW5jdGlvbiAodikge1xuICAgICAgdGhpcy54ID0gdi54O1xuICAgICAgdGhpcy55ID0gdi55O1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBhZGQ6IGZ1bmN0aW9uICh2KSB7XG4gICAgICB0aGlzLnggKz0gdi54O1xuICAgICAgdGhpcy55ICs9IHYueTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgYWRkU2NhbGFyOiBmdW5jdGlvbiAocykge1xuICAgICAgdGhpcy54ICs9IHM7XG4gICAgICB0aGlzLnkgKz0gcztcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgc3ViOiBmdW5jdGlvbiAodikge1xuICAgICAgdGhpcy54IC09IHYueDtcbiAgICAgIHRoaXMueSAtPSB2Lnk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIHN1YlNjYWxhcjogZnVuY3Rpb24gKHMpIHtcbiAgICAgIHRoaXMueCAtPSBzO1xuICAgICAgdGhpcy55IC09IHM7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIG11bHQ6IGZ1bmN0aW9uICh2KSB7XG4gICAgICB0aGlzLnggKj0gdi54O1xuICAgICAgdGhpcy55ICo9IHYueTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgbXVsdFNjYWxhcjogZnVuY3Rpb24gKHMpIHtcbiAgICAgIHRoaXMueCAqPSBzO1xuICAgICAgdGhpcy55ICo9IHM7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIGRpdjogZnVuY3Rpb24gKHYpIHtcbiAgICAgIHRoaXMueCAvPSB2Lng7XG4gICAgICB0aGlzLnkgLz0gdi55O1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBkaXZTY2FsYXI6IGZ1bmN0aW9uIChzKSB7XG4gICAgICB0aGlzLnggLz0gcztcbiAgICAgIHRoaXMueSAvPSBzO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBtaW46IGZ1bmN0aW9uICh2KSB7XG4gICAgICBpZiAoIHRoaXMueCA8IHYueCApIHRoaXMueCA9IHYueDtcbiAgICAgIGlmICggdGhpcy55IDwgdi55ICkgdGhpcy55ID0gdi55O1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBtYXg6IGZ1bmN0aW9uICh2KSB7XG4gICAgICBpZiAoIHRoaXMueCA+IHYueCApIHRoaXMueCA9IHYueDtcbiAgICAgIGlmICggdGhpcy55ID4gdi55ICkgdGhpcy55ID0gdi55O1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBjbGFtcDogZnVuY3Rpb24gKHZfbWluLCB2X21heCkge1xuICAgICAgaWYgKCB0aGlzLnggPCB2X21pbi54ICkge1xuICAgICAgICB0aGlzLnggPSB2X21pbi54O1xuICAgICAgfSBlbHNlIGlmICggdGhpcy54ID4gdl9tYXgueCApIHtcbiAgICAgICAgdGhpcy54ID0gdl9tYXgueDtcbiAgICAgIH1cbiAgICAgIGlmICggdGhpcy55IDwgdl9taW4ueSApIHtcbiAgICAgICAgdGhpcy55ID0gdl9taW4ueTtcbiAgICAgIH0gZWxzZSBpZiAoIHRoaXMueSA+IHZfbWF4LnkgKSB7XG4gICAgICAgIHRoaXMueSA9IHZfbWF4Lnk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIGZsb29yOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnggPSBNYXRoLmZsb29yKCB0aGlzLnggKTtcbiAgICAgIHRoaXMueSA9IE1hdGguZmxvb3IoIHRoaXMueSApO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBjZWlsOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnggPSBNYXRoLmNlaWwoIHRoaXMueCApO1xuICAgICAgdGhpcy55ID0gTWF0aC5jZWlsKCB0aGlzLnkgKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgcm91bmQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMueCA9IE1hdGgucm91bmQoIHRoaXMueCApO1xuICAgICAgdGhpcy55ID0gTWF0aC5yb3VuZCggdGhpcy55ICk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIHJvdW5kVG9aZXJvOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnggPSAoIHRoaXMueCA8IDAgKSA/IE1hdGguY2VpbCggdGhpcy54ICkgOiBNYXRoLmZsb29yKCB0aGlzLnggKTtcbiAgICAgIHRoaXMueSA9ICggdGhpcy55IDwgMCApID8gTWF0aC5jZWlsKCB0aGlzLnkgKSA6IE1hdGguZmxvb3IoIHRoaXMueSApO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBuZWdhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMueCA9IC0gdGhpcy54O1xuICAgICAgdGhpcy55ID0gLSB0aGlzLnk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIGRvdDogZnVuY3Rpb24gKHYpIHtcbiAgICAgIHJldHVybiB0aGlzLnggKiB2LnggKyB0aGlzLnkgKiB2Lnk7XG4gICAgfSxcbiAgICBsZW5ndGhTcTogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMueCAqIHRoaXMueCArIHRoaXMueSAqIHRoaXMueTtcbiAgICB9LFxuICAgIGxlbmd0aDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIE1hdGguc3FydCh0aGlzLmxlbmd0aFNxKCkpO1xuICAgIH0sXG4gICAgbm9ybWFsaXplOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5kaXZTY2FsYXIodGhpcy5sZW5ndGgoKSk7XG4gICAgfSxcbiAgICBkaXN0YW5jZVRvOiBmdW5jdGlvbiAodikge1xuICAgICAgdmFyIGR4ID0gdGhpcy54IC0gdi54O1xuICAgICAgdmFyIGR5ID0gdGhpcy55IC0gdi55O1xuICAgICAgcmV0dXJuIE1hdGguc3FydChkeCAqIGR4ICsgZHkgKiBkeSk7XG4gICAgfSxcbiAgICBzZXRMZW5ndGg6IGZ1bmN0aW9uIChsKSB7XG4gICAgICB2YXIgb2xkTGVuZ3RoID0gdGhpcy5sZW5ndGgoKTtcbiAgICAgIGlmICggb2xkTGVuZ3RoICE9PSAwICYmIGwgIT09IG9sZExlbmd0aCApIHtcbiAgICAgICAgdGhpcy5tdWx0U2NhbGFyKGwgLyBvbGRMZW5ndGgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBjbG9uZTogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIG5ldyBWZWN0b3IyKHRoaXMueCwgdGhpcy55KTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gVmVjdG9yMjtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cygpO1xuIl19
