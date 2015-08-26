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
var Vector2 = require('./vector2');

var exports = {
  friction: function(vector, value) {
    var force = vector.clone();
    force.multScalar(-1);
    force.normalize();
    force.multScalar(value);
    return force;
  },
  drag: function(vector, value) {
    var force = vector.clone();
    force.multScalar(-1);
    force.normalize();
    force.multScalar(vector.length() * value);
    return force;
  },
  hook: function(v_velocity, v_anchor, k) {
    var force = v_velocity.clone().sub(v_anchor);
    var distance = force.length();
    if (distance > 0) {
      force.normalize();
      force.multScalar(-1 * k * distance);
      return force;
    } else {
      return new Vector2();
    }
  }
};

module.exports = exports;

},{"./vector2":6}],3:[function(require,module,exports){
var Util = require('./util');
var Vector2 = require('./vector2');
var Mover = require('./mover');
var debounce = require('./debounce');

var body_width  = document.body.clientWidth * 2;
var body_height = document.body.clientHeight * 2;
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var fps = 60;
var last_time_render = Date.now();
var last_time_force = Date.now();

var moversNum = 50;
var movers = [];
var mode = 'normal';
var body = document.body;
var $select_effect = $('.select-effects');
var $effect_normal = $('.normal', $select_effect);
var $effect_glow = $('.glow', $select_effect);
var $effect_ameba = $('.ameba', $select_effect);
var classname_select = 'is-selected';

var is_drag = false;

var init = function() {
  for (var i = 0; i < moversNum; i++) {
    var mover = new Mover();
    var radian = Util.getRadian(Util.getRandomInt(0, 360));
    var scalar = Util.getRandomInt(10, 20);
    var force = new Vector2(Math.cos(radian) * scalar, Math.sin(radian) * scalar);
    var x = body_width / 2;
    var y = body_height / 2;
    var size = 0;
    
    if (body_width > body_height) {
      size = body_height / 36;
    } else {
      size = body_width / 36;
    }
    
    mover.radius = Util.getRandomInt(size, size * 3);
    mover.mass = mover.radius / 10;
    mover.position.set(x, y);
    mover.velocity.set(x, y);
    mover.anchor.set(x, y);
    mover.applyForce(force);
    movers[i] = mover;
  }
  
  changeMode(0);
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
    
    mover.applyFriction();
    //mover.applyDragForce();
    // 加速度が0になったときに再度力を加える。
    if (mover.acceleration.length() <= 1) {
      var radian = Util.getRadian(Util.getRandomInt(0, 360));
      var scalar = Util.getRandomInt(100, 200);
      var force = new Vector2(Math.cos(radian) * scalar, Math.sin(radian) * scalar);
      
      force.divScalar(mover.mass);
      mover.applyForce(force);
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
    // //mover同士の衝突判定
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
    mover.updateVelocity();
    mover.updatePosition();
    mover.draw(ctx, mode);
  }
};

var applyForceClick = function(v) {
  for (var i = 0; i < movers.length; i++) {
    var distance = v.distanceTo(movers[i].position);
    var direct = v.clone().sub(movers[i].position);
    var scalar = (body_width - distance) / 1000;
    var force = null;
    
    if (scalar < 0) scalar = 0;
    direct.normalize();
    force = direct.multScalar(scalar * -1);
    movers[i].applyForce(force);
    console.log(v);
  };
};

var changeMode = function(num) {
  $select_effect.find('.' + classname_select).removeClass(classname_select);
  switch (num) {
    case 0:
      mode = 'normal';
      $effect_normal.addClass(classname_select);
      break;
    case 1:
      mode = 'glow';
      $effect_glow.addClass(classname_select);
      break;
    case 2:
      mode = 'ameba';
      $effect_ameba.addClass(classname_select);
      break;
  }
  body.className = 'mode-' + mode;
};

var render = function() {
  ctx.clearRect(0, 0, body_width, body_height);
  if (mode == 'glow') {
    ctx.globalCompositeOperation = 'lighter';
  } else {
    ctx.globalCompositeOperation = 'normal';
  }
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
  var eventTouchStart = function(v) {
    is_drag = true;
    applyForceClick(v);
  };
  
  var eventTouchMove = function(v) {
    if (is_drag) {
      applyForceClick(v);
    }
  };
  
  var eventTouchEnd = function(v) {
    is_drag = false;
  };

  canvas.addEventListener('contextmenu', function (event) {
    event.preventDefault();
  });

  canvas.addEventListener('selectstart', function (event) {
    event.preventDefault();
  });

  canvas.addEventListener('mousedown', function (event) {
    event.preventDefault();
    var vector = new Vector2(event.clientX * 2, event.clientY * 2);
    eventTouchStart(vector);
  });

  canvas.addEventListener('mousemove', function (event) {
    event.preventDefault();
    var vector = new Vector2(event.clientX * 2, event.clientY * 2);
    eventTouchMove(vector);
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
  
  $effect_normal.on('click', function(event) {
    event.preventDefault();
    changeMode(0);
  });
  
  $effect_glow.on('click', function(event) {
    event.preventDefault();
    changeMode(1);
  });
  
  $effect_ameba.on('click', function(event) {
    event.preventDefault();
    changeMode(2);
  });
};

init();

},{"./debounce":1,"./mover":4,"./util":5,"./vector2":6}],4:[function(require,module,exports){
var Util = require('./util');
var Vector2 = require('./vector2');
var Force = require('./force');

var exports = function(){
  var Mover = function() {
    this.position = new Vector2();
    this.velocity = new Vector2();
    this.acceleration = new Vector2();
    this.anchor = new Vector2();
    this.radius = 0;
    this.mass = 0;
    this.direction = 0;
    this.k = 0.05;
    this.r = Util.getRandomInt(220, 255);
    this.g = Util.getRandomInt(100, 220);
    this.b = Util.getRandomInt(120, 140);
  };
  
  Mover.prototype = {
    updatePosition: function() {
      this.position.copy(this.velocity);
    },
    updateVelocity: function() {
      this.velocity.add(this.acceleration);
      if (this.velocity.distanceTo(this.position) >= 1) {
        this.direct(this.velocity);
      }
    },
    applyForce: function(vector) {
      this.acceleration.add(vector);
    },
    applyFriction: function() {
      var friction = Force.friction(this.acceleration, 0.1);
      this.applyForce(friction);
    },
    applyDragForce: function() {
      var drag = Force.drag(this.acceleration, 0.1);
      this.applyForce(drag);
    },
    hook: function() {
      var force = Force.hook(this.velocity, this.anchor, this.k);
      this.applyForce(force);
    },
    rebound: function(vector) {
      var dot = this.acceleration.clone().dot(vector);
      this.acceleration.sub(vector.multScalar(2 * dot));
      this.acceleration.multScalar(0.8);
    },
    direct: function(vector) {
      var v = vector.clone().sub(this.position);
      this.direction = Math.atan2(v.y, v.x);
    },
    draw: function(context, mode) {
      switch (mode) {
        case 'normal':
          context.lineWidth = 8;
          context.fillStyle = 'rgb(' + this.r + ',' + this.g + ',' + this.b + ')';
          context.beginPath();
          context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI / 180, true);
          context.fill();
          break;
        case 'glow':
          var radius = this.radius * 8;
          var grad = context.createRadialGradient(this.position.x, this.position.y, 0, this.position.x, this.position.y, radius);
          var x1 = this.position.x - radius;
          var x2 = this.position.x + radius;
          var y1 = this.position.y - radius;
          var y2 = this.position.y + radius;
          
          if (x1 < 0) x1 = 0;
          if (y1 < 0) y1 = 0;

          grad.addColorStop(0.1, 'rgba(' + this.r + ',' + this.g + ',' + this.b + ', 0.2)');
          grad.addColorStop(1, 'rgba(' + this.r + ',' + this.g + ',' + this.b + ', 0)');
          context.fillStyle = grad;
          context.beginPath();
          context.rect(x1, y1, x2, y2);
          context.fill();

          break;
        case 'ameba':
          context.lineWidth = 8;
          context.fillStyle = 'rgb(' + this.r + ',' + this.g + ',' + this.b + ')';
          context.beginPath();
          context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI / 180, true);
          context.fill();
          break;
      }
    }
  };
  
  return Mover;
};

module.exports = exports();

},{"./force":2,"./util":5,"./vector2":6}],5:[function(require,module,exports){
var exports = {
  getRandomInt: function(min, max){
    return Math.floor(Math.random() * (max - min)) + min;
  },
  getDegree: function(radian) {
    return radian / Math.PI * 180;
  },
  getRadian: function(degrees) {
    return degrees * Math.PI / 180;
  },
  getSpherical: function(rad1, rad2, r) {
    var x = Math.cos(rad1) * Math.cos(rad2) * r;
    var z = Math.cos(rad1) * Math.sin(rad2) * r;
    var y = Math.sin(rad1) * r;
    return [x, y, z];
  }
};

module.exports = exports;

},{}],6:[function(require,module,exports){
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

},{}]},{},[3])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvZGVib3VuY2UuanMiLCJzcmMvanMvZm9yY2UuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy9tb3Zlci5qcyIsInNyYy9qcy91dGlsLmpzIiwic3JjL2pzL3ZlY3RvcjIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9iamVjdCwgZXZlbnRUeXBlLCBjYWxsYmFjayl7XHJcbiAgdmFyIHRpbWVyO1xyXG5cclxuICBvYmplY3QuYWRkRXZlbnRMaXN0ZW5lcihldmVudFR5cGUsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICBjbGVhclRpbWVvdXQodGltZXIpO1xyXG4gICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgIGNhbGxiYWNrKGV2ZW50KTtcclxuICAgIH0sIDUwMCk7XHJcbiAgfSwgZmFsc2UpO1xyXG59O1xyXG4iLCJ2YXIgVmVjdG9yMiA9IHJlcXVpcmUoJy4vdmVjdG9yMicpO1xyXG5cclxudmFyIGV4cG9ydHMgPSB7XHJcbiAgZnJpY3Rpb246IGZ1bmN0aW9uKHZlY3RvciwgdmFsdWUpIHtcclxuICAgIHZhciBmb3JjZSA9IHZlY3Rvci5jbG9uZSgpO1xyXG4gICAgZm9yY2UubXVsdFNjYWxhcigtMSk7XHJcbiAgICBmb3JjZS5ub3JtYWxpemUoKTtcclxuICAgIGZvcmNlLm11bHRTY2FsYXIodmFsdWUpO1xyXG4gICAgcmV0dXJuIGZvcmNlO1xyXG4gIH0sXHJcbiAgZHJhZzogZnVuY3Rpb24odmVjdG9yLCB2YWx1ZSkge1xyXG4gICAgdmFyIGZvcmNlID0gdmVjdG9yLmNsb25lKCk7XHJcbiAgICBmb3JjZS5tdWx0U2NhbGFyKC0xKTtcclxuICAgIGZvcmNlLm5vcm1hbGl6ZSgpO1xyXG4gICAgZm9yY2UubXVsdFNjYWxhcih2ZWN0b3IubGVuZ3RoKCkgKiB2YWx1ZSk7XHJcbiAgICByZXR1cm4gZm9yY2U7XHJcbiAgfSxcclxuICBob29rOiBmdW5jdGlvbih2X3ZlbG9jaXR5LCB2X2FuY2hvciwgaykge1xyXG4gICAgdmFyIGZvcmNlID0gdl92ZWxvY2l0eS5jbG9uZSgpLnN1Yih2X2FuY2hvcik7XHJcbiAgICB2YXIgZGlzdGFuY2UgPSBmb3JjZS5sZW5ndGgoKTtcclxuICAgIGlmIChkaXN0YW5jZSA+IDApIHtcclxuICAgICAgZm9yY2Uubm9ybWFsaXplKCk7XHJcbiAgICAgIGZvcmNlLm11bHRTY2FsYXIoLTEgKiBrICogZGlzdGFuY2UpO1xyXG4gICAgICByZXR1cm4gZm9yY2U7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gbmV3IFZlY3RvcjIoKTtcclxuICAgIH1cclxuICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHM7XHJcbiIsInZhciBVdGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XHJcbnZhciBWZWN0b3IyID0gcmVxdWlyZSgnLi92ZWN0b3IyJyk7XHJcbnZhciBNb3ZlciA9IHJlcXVpcmUoJy4vbW92ZXInKTtcclxudmFyIGRlYm91bmNlID0gcmVxdWlyZSgnLi9kZWJvdW5jZScpO1xyXG5cclxudmFyIGJvZHlfd2lkdGggID0gZG9jdW1lbnQuYm9keS5jbGllbnRXaWR0aCAqIDI7XHJcbnZhciBib2R5X2hlaWdodCA9IGRvY3VtZW50LmJvZHkuY2xpZW50SGVpZ2h0ICogMjtcclxudmFyIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXMnKTtcclxudmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG52YXIgZnBzID0gNjA7XHJcbnZhciBsYXN0X3RpbWVfcmVuZGVyID0gRGF0ZS5ub3coKTtcclxudmFyIGxhc3RfdGltZV9mb3JjZSA9IERhdGUubm93KCk7XHJcblxyXG52YXIgbW92ZXJzTnVtID0gNTA7XHJcbnZhciBtb3ZlcnMgPSBbXTtcclxudmFyIG1vZGUgPSAnbm9ybWFsJztcclxudmFyIGJvZHkgPSBkb2N1bWVudC5ib2R5O1xyXG52YXIgJHNlbGVjdF9lZmZlY3QgPSAkKCcuc2VsZWN0LWVmZmVjdHMnKTtcclxudmFyICRlZmZlY3Rfbm9ybWFsID0gJCgnLm5vcm1hbCcsICRzZWxlY3RfZWZmZWN0KTtcclxudmFyICRlZmZlY3RfZ2xvdyA9ICQoJy5nbG93JywgJHNlbGVjdF9lZmZlY3QpO1xyXG52YXIgJGVmZmVjdF9hbWViYSA9ICQoJy5hbWViYScsICRzZWxlY3RfZWZmZWN0KTtcclxudmFyIGNsYXNzbmFtZV9zZWxlY3QgPSAnaXMtc2VsZWN0ZWQnO1xyXG5cclxudmFyIGlzX2RyYWcgPSBmYWxzZTtcclxuXHJcbnZhciBpbml0ID0gZnVuY3Rpb24oKSB7XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBtb3ZlcnNOdW07IGkrKykge1xyXG4gICAgdmFyIG1vdmVyID0gbmV3IE1vdmVyKCk7XHJcbiAgICB2YXIgcmFkaWFuID0gVXRpbC5nZXRSYWRpYW4oVXRpbC5nZXRSYW5kb21JbnQoMCwgMzYwKSk7XHJcbiAgICB2YXIgc2NhbGFyID0gVXRpbC5nZXRSYW5kb21JbnQoMTAsIDIwKTtcclxuICAgIHZhciBmb3JjZSA9IG5ldyBWZWN0b3IyKE1hdGguY29zKHJhZGlhbikgKiBzY2FsYXIsIE1hdGguc2luKHJhZGlhbikgKiBzY2FsYXIpO1xyXG4gICAgdmFyIHggPSBib2R5X3dpZHRoIC8gMjtcclxuICAgIHZhciB5ID0gYm9keV9oZWlnaHQgLyAyO1xyXG4gICAgdmFyIHNpemUgPSAwO1xyXG4gICAgXHJcbiAgICBpZiAoYm9keV93aWR0aCA+IGJvZHlfaGVpZ2h0KSB7XHJcbiAgICAgIHNpemUgPSBib2R5X2hlaWdodCAvIDM2O1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc2l6ZSA9IGJvZHlfd2lkdGggLyAzNjtcclxuICAgIH1cclxuICAgIFxyXG4gICAgbW92ZXIucmFkaXVzID0gVXRpbC5nZXRSYW5kb21JbnQoc2l6ZSwgc2l6ZSAqIDMpO1xyXG4gICAgbW92ZXIubWFzcyA9IG1vdmVyLnJhZGl1cyAvIDEwO1xyXG4gICAgbW92ZXIucG9zaXRpb24uc2V0KHgsIHkpO1xyXG4gICAgbW92ZXIudmVsb2NpdHkuc2V0KHgsIHkpO1xyXG4gICAgbW92ZXIuYW5jaG9yLnNldCh4LCB5KTtcclxuICAgIG1vdmVyLmFwcGx5Rm9yY2UoZm9yY2UpO1xyXG4gICAgbW92ZXJzW2ldID0gbW92ZXI7XHJcbiAgfVxyXG4gIFxyXG4gIGNoYW5nZU1vZGUoMCk7XHJcbiAgc2V0RXZlbnQoKTtcclxuICByZXNpemVDYW52YXMoKTtcclxuICByZW5kZXJsb29wKCk7XHJcbiAgZGVib3VuY2Uod2luZG93LCAncmVzaXplJywgZnVuY3Rpb24oZXZlbnQpe1xyXG4gICAgcmVzaXplQ2FudmFzKCk7XHJcbiAgfSk7XHJcbn07XHJcblxyXG52YXIgdXBkYXRlTW92ZXIgPSBmdW5jdGlvbigpIHtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IG1vdmVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgdmFyIG1vdmVyID0gbW92ZXJzW2ldO1xyXG4gICAgdmFyIGNvbGxpc2lvbiA9IGZhbHNlO1xyXG4gICAgXHJcbiAgICBtb3Zlci5hcHBseUZyaWN0aW9uKCk7XHJcbiAgICAvL21vdmVyLmFwcGx5RHJhZ0ZvcmNlKCk7XHJcbiAgICAvLyDliqDpgJ/luqbjgYww44Gr44Gq44Gj44Gf44Go44GN44Gr5YaN5bqm5Yqb44KS5Yqg44GI44KL44CCXHJcbiAgICBpZiAobW92ZXIuYWNjZWxlcmF0aW9uLmxlbmd0aCgpIDw9IDEpIHtcclxuICAgICAgdmFyIHJhZGlhbiA9IFV0aWwuZ2V0UmFkaWFuKFV0aWwuZ2V0UmFuZG9tSW50KDAsIDM2MCkpO1xyXG4gICAgICB2YXIgc2NhbGFyID0gVXRpbC5nZXRSYW5kb21JbnQoMTAwLCAyMDApO1xyXG4gICAgICB2YXIgZm9yY2UgPSBuZXcgVmVjdG9yMihNYXRoLmNvcyhyYWRpYW4pICogc2NhbGFyLCBNYXRoLnNpbihyYWRpYW4pICogc2NhbGFyKTtcclxuICAgICAgXHJcbiAgICAgIGZvcmNlLmRpdlNjYWxhcihtb3Zlci5tYXNzKTtcclxuICAgICAgbW92ZXIuYXBwbHlGb3JjZShmb3JjZSk7XHJcbiAgICB9XHJcbiAgICAvLyDlo4Hjgajjga7ooZ3nqoHliKTlrppcclxuICAgIGlmIChtb3Zlci5wb3NpdGlvbi55IC0gbW92ZXIucmFkaXVzIDwgMCkge1xyXG4gICAgICB2YXIgbm9ybWFsID0gbmV3IFZlY3RvcjIoMCwgMSk7XHJcbiAgICAgIG1vdmVyLnZlbG9jaXR5LnkgPSBtb3Zlci5yYWRpdXM7XHJcbiAgICAgIGNvbGxpc2lvbiA9IHRydWU7XHJcbiAgICB9IGVsc2UgaWYgKG1vdmVyLnBvc2l0aW9uLnkgKyBtb3Zlci5yYWRpdXMgPiBib2R5X2hlaWdodCkge1xyXG4gICAgICB2YXIgbm9ybWFsID0gbmV3IFZlY3RvcjIoMCwgLTEpO1xyXG4gICAgICBtb3Zlci52ZWxvY2l0eS55ID0gYm9keV9oZWlnaHQgLSBtb3Zlci5yYWRpdXM7XHJcbiAgICAgIGNvbGxpc2lvbiA9IHRydWU7XHJcbiAgICB9IGVsc2UgaWYgKG1vdmVyLnBvc2l0aW9uLnggLSBtb3Zlci5yYWRpdXMgPCAwKSB7XHJcbiAgICAgIHZhciBub3JtYWwgPSBuZXcgVmVjdG9yMigxLCAwKTtcclxuICAgICAgbW92ZXIudmVsb2NpdHkueCA9IG1vdmVyLnJhZGl1cztcclxuICAgICAgY29sbGlzaW9uID0gdHJ1ZTtcclxuICAgIH0gZWxzZSBpZiAobW92ZXIucG9zaXRpb24ueCArIG1vdmVyLnJhZGl1cyA+IGJvZHlfd2lkdGgpIHtcclxuICAgICAgdmFyIG5vcm1hbCA9IG5ldyBWZWN0b3IyKC0xLCAwKTtcclxuICAgICAgbW92ZXIudmVsb2NpdHkueCA9IGJvZHlfd2lkdGggLSBtb3Zlci5yYWRpdXM7XHJcbiAgICAgIGNvbGxpc2lvbiA9IHRydWU7XHJcbiAgICB9XHJcbiAgICBpZiAoY29sbGlzaW9uKSB7XHJcbiAgICAgIG1vdmVyLnJlYm91bmQobm9ybWFsKTtcclxuICAgIH1cclxuICAgIC8vIC8vbW92ZXLlkIzlo6vjga7ooZ3nqoHliKTlrppcclxuICAgIC8vIGZvciAodmFyIGluZGV4ID0gaSArIDE7IGluZGV4IDwgbW92ZXJzLmxlbmd0aDsgaW5kZXgrKykge1xyXG4gICAgLy8gICB2YXIgZGlzdGFuY2UgPSBtb3Zlci52ZWxvY2l0eS5kaXN0YW5jZVRvKG1vdmVyc1tpbmRleF0udmVsb2NpdHkpO1xyXG4gICAgLy8gICB2YXIgcmVib3VuZF9kaXN0YW5jZSA9IG1vdmVyLnJhZGl1cyArIG1vdmVyc1tpbmRleF0ucmFkaXVzO1xyXG4gICAgLy8gICBpZiAoZGlzdGFuY2UgPCByZWJvdW5kX2Rpc3RhbmNlKSB7XHJcbiAgICAvLyAgICAgdmFyIG92ZXJsYXAgPSBNYXRoLmFicyhkaXN0YW5jZSAtIHJlYm91bmRfZGlzdGFuY2UpO1xyXG4gICAgLy8gICAgIHZhciBub3JtYWwgPSBtb3Zlci52ZWxvY2l0eS5jbG9uZSgpLnN1Yihtb3ZlcnNbaW5kZXhdLnZlbG9jaXR5KS5ub3JtYWxpemUoKTtcclxuICAgIC8vICAgICBtb3Zlci52ZWxvY2l0eS5zdWIobm9ybWFsLmNsb25lKCkubXVsdFNjYWxhcihvdmVybGFwICogLTEpKTtcclxuICAgIC8vICAgICBtb3ZlcnNbaW5kZXhdLnZlbG9jaXR5LnN1Yihub3JtYWwuY2xvbmUoKS5tdWx0U2NhbGFyKG92ZXJsYXApKTtcclxuICAgIC8vICAgICBtb3Zlci5yZWJvdW5kKG5vcm1hbC5jbG9uZSgpLm11bHRTY2FsYXIoLTEpKTtcclxuICAgIC8vICAgICBtb3ZlcnNbaW5kZXhdLnJlYm91bmQobm9ybWFsLmNsb25lKCkpO1xyXG4gICAgLy8gICB9XHJcbiAgICAvLyB9XHJcbiAgICBtb3Zlci51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgbW92ZXIudXBkYXRlUG9zaXRpb24oKTtcclxuICAgIG1vdmVyLmRyYXcoY3R4LCBtb2RlKTtcclxuICB9XHJcbn07XHJcblxyXG52YXIgYXBwbHlGb3JjZUNsaWNrID0gZnVuY3Rpb24odikge1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbW92ZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICB2YXIgZGlzdGFuY2UgPSB2LmRpc3RhbmNlVG8obW92ZXJzW2ldLnBvc2l0aW9uKTtcclxuICAgIHZhciBkaXJlY3QgPSB2LmNsb25lKCkuc3ViKG1vdmVyc1tpXS5wb3NpdGlvbik7XHJcbiAgICB2YXIgc2NhbGFyID0gKGJvZHlfd2lkdGggLSBkaXN0YW5jZSkgLyAxMDAwO1xyXG4gICAgdmFyIGZvcmNlID0gbnVsbDtcclxuICAgIFxyXG4gICAgaWYgKHNjYWxhciA8IDApIHNjYWxhciA9IDA7XHJcbiAgICBkaXJlY3Qubm9ybWFsaXplKCk7XHJcbiAgICBmb3JjZSA9IGRpcmVjdC5tdWx0U2NhbGFyKHNjYWxhciAqIC0xKTtcclxuICAgIG1vdmVyc1tpXS5hcHBseUZvcmNlKGZvcmNlKTtcclxuICAgIGNvbnNvbGUubG9nKHYpO1xyXG4gIH07XHJcbn07XHJcblxyXG52YXIgY2hhbmdlTW9kZSA9IGZ1bmN0aW9uKG51bSkge1xyXG4gICRzZWxlY3RfZWZmZWN0LmZpbmQoJy4nICsgY2xhc3NuYW1lX3NlbGVjdCkucmVtb3ZlQ2xhc3MoY2xhc3NuYW1lX3NlbGVjdCk7XHJcbiAgc3dpdGNoIChudW0pIHtcclxuICAgIGNhc2UgMDpcclxuICAgICAgbW9kZSA9ICdub3JtYWwnO1xyXG4gICAgICAkZWZmZWN0X25vcm1hbC5hZGRDbGFzcyhjbGFzc25hbWVfc2VsZWN0KTtcclxuICAgICAgYnJlYWs7XHJcbiAgICBjYXNlIDE6XHJcbiAgICAgIG1vZGUgPSAnZ2xvdyc7XHJcbiAgICAgICRlZmZlY3RfZ2xvdy5hZGRDbGFzcyhjbGFzc25hbWVfc2VsZWN0KTtcclxuICAgICAgYnJlYWs7XHJcbiAgICBjYXNlIDI6XHJcbiAgICAgIG1vZGUgPSAnYW1lYmEnO1xyXG4gICAgICAkZWZmZWN0X2FtZWJhLmFkZENsYXNzKGNsYXNzbmFtZV9zZWxlY3QpO1xyXG4gICAgICBicmVhaztcclxuICB9XHJcbiAgYm9keS5jbGFzc05hbWUgPSAnbW9kZS0nICsgbW9kZTtcclxufTtcclxuXHJcbnZhciByZW5kZXIgPSBmdW5jdGlvbigpIHtcclxuICBjdHguY2xlYXJSZWN0KDAsIDAsIGJvZHlfd2lkdGgsIGJvZHlfaGVpZ2h0KTtcclxuICBpZiAobW9kZSA9PSAnZ2xvdycpIHtcclxuICAgIGN0eC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnbGlnaHRlcic7XHJcbiAgfSBlbHNlIHtcclxuICAgIGN0eC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnbm9ybWFsJztcclxuICB9XHJcbiAgdXBkYXRlTW92ZXIoKTtcclxufTtcclxuXHJcbnZhciByZW5kZXJsb29wID0gZnVuY3Rpb24oKSB7XHJcbiAgdmFyIG5vdyA9IERhdGUubm93KCk7XHJcbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlbmRlcmxvb3ApO1xyXG4gIGlmIChub3cgLSBsYXN0X3RpbWVfcmVuZGVyID4gMTAwMCAvIGZwcykge1xyXG4gICAgcmVuZGVyKCk7XHJcbiAgICBsYXN0X3RpbWVfcmVuZGVyID0gRGF0ZS5ub3coKTtcclxuICB9XHJcbn07XHJcblxyXG52YXIgcmVzaXplQ2FudmFzID0gZnVuY3Rpb24oKSB7XHJcbiAgYm9keV93aWR0aCAgPSBkb2N1bWVudC5ib2R5LmNsaWVudFdpZHRoICogMjtcclxuICBib2R5X2hlaWdodCA9IGRvY3VtZW50LmJvZHkuY2xpZW50SGVpZ2h0ICogMjtcclxuXHJcbiAgY2FudmFzLndpZHRoID0gYm9keV93aWR0aDtcclxuICBjYW52YXMuaGVpZ2h0ID0gYm9keV9oZWlnaHQ7XHJcbiAgY2FudmFzLnN0eWxlLndpZHRoID0gYm9keV93aWR0aCAvIDIgKyAncHgnO1xyXG4gIGNhbnZhcy5zdHlsZS5oZWlnaHQgPSBib2R5X2hlaWdodCAvIDIgKyAncHgnO1xyXG59O1xyXG5cclxudmFyIHNldEV2ZW50ID0gZnVuY3Rpb24gKCkge1xyXG4gIHZhciBldmVudFRvdWNoU3RhcnQgPSBmdW5jdGlvbih2KSB7XHJcbiAgICBpc19kcmFnID0gdHJ1ZTtcclxuICAgIGFwcGx5Rm9yY2VDbGljayh2KTtcclxuICB9O1xyXG4gIFxyXG4gIHZhciBldmVudFRvdWNoTW92ZSA9IGZ1bmN0aW9uKHYpIHtcclxuICAgIGlmIChpc19kcmFnKSB7XHJcbiAgICAgIGFwcGx5Rm9yY2VDbGljayh2KTtcclxuICAgIH1cclxuICB9O1xyXG4gIFxyXG4gIHZhciBldmVudFRvdWNoRW5kID0gZnVuY3Rpb24odikge1xyXG4gICAgaXNfZHJhZyA9IGZhbHNlO1xyXG4gIH07XHJcblxyXG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdjb250ZXh0bWVudScsIGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICB9KTtcclxuXHJcbiAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3NlbGVjdHN0YXJ0JywgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gIH0pO1xyXG5cclxuICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdmFyIHZlY3RvciA9IG5ldyBWZWN0b3IyKGV2ZW50LmNsaWVudFggKiAyLCBldmVudC5jbGllbnRZICogMik7XHJcbiAgICBldmVudFRvdWNoU3RhcnQodmVjdG9yKTtcclxuICB9KTtcclxuXHJcbiAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIHZhciB2ZWN0b3IgPSBuZXcgVmVjdG9yMihldmVudC5jbGllbnRYICogMiwgZXZlbnQuY2xpZW50WSAqIDIpO1xyXG4gICAgZXZlbnRUb3VjaE1vdmUodmVjdG9yKTtcclxuICB9KTtcclxuXHJcbiAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBldmVudFRvdWNoRW5kKCk7XHJcbiAgfSk7XHJcblxyXG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgZXZlbnRUb3VjaFN0YXJ0KGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WCwgZXZlbnQudG91Y2hlc1swXS5jbGllbnRZKTtcclxuICB9KTtcclxuXHJcbiAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIGV2ZW50VG91Y2hNb3ZlKGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WCwgZXZlbnQudG91Y2hlc1swXS5jbGllbnRZKTtcclxuICB9KTtcclxuXHJcbiAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgZXZlbnRUb3VjaEVuZCgpO1xyXG4gIH0pO1xyXG4gIFxyXG4gICRlZmZlY3Rfbm9ybWFsLm9uKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgY2hhbmdlTW9kZSgwKTtcclxuICB9KTtcclxuICBcclxuICAkZWZmZWN0X2dsb3cub24oJ2NsaWNrJywgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBjaGFuZ2VNb2RlKDEpO1xyXG4gIH0pO1xyXG4gIFxyXG4gICRlZmZlY3RfYW1lYmEub24oJ2NsaWNrJywgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBjaGFuZ2VNb2RlKDIpO1xyXG4gIH0pO1xyXG59O1xyXG5cclxuaW5pdCgpO1xyXG4iLCJ2YXIgVXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xyXG52YXIgVmVjdG9yMiA9IHJlcXVpcmUoJy4vdmVjdG9yMicpO1xyXG52YXIgRm9yY2UgPSByZXF1aXJlKCcuL2ZvcmNlJyk7XHJcblxyXG52YXIgZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XHJcbiAgdmFyIE1vdmVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnBvc2l0aW9uID0gbmV3IFZlY3RvcjIoKTtcclxuICAgIHRoaXMudmVsb2NpdHkgPSBuZXcgVmVjdG9yMigpO1xyXG4gICAgdGhpcy5hY2NlbGVyYXRpb24gPSBuZXcgVmVjdG9yMigpO1xyXG4gICAgdGhpcy5hbmNob3IgPSBuZXcgVmVjdG9yMigpO1xyXG4gICAgdGhpcy5yYWRpdXMgPSAwO1xyXG4gICAgdGhpcy5tYXNzID0gMDtcclxuICAgIHRoaXMuZGlyZWN0aW9uID0gMDtcclxuICAgIHRoaXMuayA9IDAuMDU7XHJcbiAgICB0aGlzLnIgPSBVdGlsLmdldFJhbmRvbUludCgyMjAsIDI1NSk7XHJcbiAgICB0aGlzLmcgPSBVdGlsLmdldFJhbmRvbUludCgxMDAsIDIyMCk7XHJcbiAgICB0aGlzLmIgPSBVdGlsLmdldFJhbmRvbUludCgxMjAsIDE0MCk7XHJcbiAgfTtcclxuICBcclxuICBNb3Zlci5wcm90b3R5cGUgPSB7XHJcbiAgICB1cGRhdGVQb3NpdGlvbjogZnVuY3Rpb24oKSB7XHJcbiAgICAgIHRoaXMucG9zaXRpb24uY29weSh0aGlzLnZlbG9jaXR5KTtcclxuICAgIH0sXHJcbiAgICB1cGRhdGVWZWxvY2l0eTogZnVuY3Rpb24oKSB7XHJcbiAgICAgIHRoaXMudmVsb2NpdHkuYWRkKHRoaXMuYWNjZWxlcmF0aW9uKTtcclxuICAgICAgaWYgKHRoaXMudmVsb2NpdHkuZGlzdGFuY2VUbyh0aGlzLnBvc2l0aW9uKSA+PSAxKSB7XHJcbiAgICAgICAgdGhpcy5kaXJlY3QodGhpcy52ZWxvY2l0eSk7XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBhcHBseUZvcmNlOiBmdW5jdGlvbih2ZWN0b3IpIHtcclxuICAgICAgdGhpcy5hY2NlbGVyYXRpb24uYWRkKHZlY3Rvcik7XHJcbiAgICB9LFxyXG4gICAgYXBwbHlGcmljdGlvbjogZnVuY3Rpb24oKSB7XHJcbiAgICAgIHZhciBmcmljdGlvbiA9IEZvcmNlLmZyaWN0aW9uKHRoaXMuYWNjZWxlcmF0aW9uLCAwLjEpO1xyXG4gICAgICB0aGlzLmFwcGx5Rm9yY2UoZnJpY3Rpb24pO1xyXG4gICAgfSxcclxuICAgIGFwcGx5RHJhZ0ZvcmNlOiBmdW5jdGlvbigpIHtcclxuICAgICAgdmFyIGRyYWcgPSBGb3JjZS5kcmFnKHRoaXMuYWNjZWxlcmF0aW9uLCAwLjEpO1xyXG4gICAgICB0aGlzLmFwcGx5Rm9yY2UoZHJhZyk7XHJcbiAgICB9LFxyXG4gICAgaG9vazogZnVuY3Rpb24oKSB7XHJcbiAgICAgIHZhciBmb3JjZSA9IEZvcmNlLmhvb2sodGhpcy52ZWxvY2l0eSwgdGhpcy5hbmNob3IsIHRoaXMuayk7XHJcbiAgICAgIHRoaXMuYXBwbHlGb3JjZShmb3JjZSk7XHJcbiAgICB9LFxyXG4gICAgcmVib3VuZDogZnVuY3Rpb24odmVjdG9yKSB7XHJcbiAgICAgIHZhciBkb3QgPSB0aGlzLmFjY2VsZXJhdGlvbi5jbG9uZSgpLmRvdCh2ZWN0b3IpO1xyXG4gICAgICB0aGlzLmFjY2VsZXJhdGlvbi5zdWIodmVjdG9yLm11bHRTY2FsYXIoMiAqIGRvdCkpO1xyXG4gICAgICB0aGlzLmFjY2VsZXJhdGlvbi5tdWx0U2NhbGFyKDAuOCk7XHJcbiAgICB9LFxyXG4gICAgZGlyZWN0OiBmdW5jdGlvbih2ZWN0b3IpIHtcclxuICAgICAgdmFyIHYgPSB2ZWN0b3IuY2xvbmUoKS5zdWIodGhpcy5wb3NpdGlvbik7XHJcbiAgICAgIHRoaXMuZGlyZWN0aW9uID0gTWF0aC5hdGFuMih2LnksIHYueCk7XHJcbiAgICB9LFxyXG4gICAgZHJhdzogZnVuY3Rpb24oY29udGV4dCwgbW9kZSkge1xyXG4gICAgICBzd2l0Y2ggKG1vZGUpIHtcclxuICAgICAgICBjYXNlICdub3JtYWwnOlxyXG4gICAgICAgICAgY29udGV4dC5saW5lV2lkdGggPSA4O1xyXG4gICAgICAgICAgY29udGV4dC5maWxsU3R5bGUgPSAncmdiKCcgKyB0aGlzLnIgKyAnLCcgKyB0aGlzLmcgKyAnLCcgKyB0aGlzLmIgKyAnKSc7XHJcbiAgICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgICAgY29udGV4dC5hcmModGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnksIHRoaXMucmFkaXVzLCAwLCBNYXRoLlBJIC8gMTgwLCB0cnVlKTtcclxuICAgICAgICAgIGNvbnRleHQuZmlsbCgpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAnZ2xvdyc6XHJcbiAgICAgICAgICB2YXIgcmFkaXVzID0gdGhpcy5yYWRpdXMgKiA4O1xyXG4gICAgICAgICAgdmFyIGdyYWQgPSBjb250ZXh0LmNyZWF0ZVJhZGlhbEdyYWRpZW50KHRoaXMucG9zaXRpb24ueCwgdGhpcy5wb3NpdGlvbi55LCAwLCB0aGlzLnBvc2l0aW9uLngsIHRoaXMucG9zaXRpb24ueSwgcmFkaXVzKTtcclxuICAgICAgICAgIHZhciB4MSA9IHRoaXMucG9zaXRpb24ueCAtIHJhZGl1cztcclxuICAgICAgICAgIHZhciB4MiA9IHRoaXMucG9zaXRpb24ueCArIHJhZGl1cztcclxuICAgICAgICAgIHZhciB5MSA9IHRoaXMucG9zaXRpb24ueSAtIHJhZGl1cztcclxuICAgICAgICAgIHZhciB5MiA9IHRoaXMucG9zaXRpb24ueSArIHJhZGl1cztcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgaWYgKHgxIDwgMCkgeDEgPSAwO1xyXG4gICAgICAgICAgaWYgKHkxIDwgMCkgeTEgPSAwO1xyXG5cclxuICAgICAgICAgIGdyYWQuYWRkQ29sb3JTdG9wKDAuMSwgJ3JnYmEoJyArIHRoaXMuciArICcsJyArIHRoaXMuZyArICcsJyArIHRoaXMuYiArICcsIDAuMiknKTtcclxuICAgICAgICAgIGdyYWQuYWRkQ29sb3JTdG9wKDEsICdyZ2JhKCcgKyB0aGlzLnIgKyAnLCcgKyB0aGlzLmcgKyAnLCcgKyB0aGlzLmIgKyAnLCAwKScpO1xyXG4gICAgICAgICAgY29udGV4dC5maWxsU3R5bGUgPSBncmFkO1xyXG4gICAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcclxuICAgICAgICAgIGNvbnRleHQucmVjdCh4MSwgeTEsIHgyLCB5Mik7XHJcbiAgICAgICAgICBjb250ZXh0LmZpbGwoKTtcclxuXHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdhbWViYSc6XHJcbiAgICAgICAgICBjb250ZXh0LmxpbmVXaWR0aCA9IDg7XHJcbiAgICAgICAgICBjb250ZXh0LmZpbGxTdHlsZSA9ICdyZ2IoJyArIHRoaXMuciArICcsJyArIHRoaXMuZyArICcsJyArIHRoaXMuYiArICcpJztcclxuICAgICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgICBjb250ZXh0LmFyYyh0aGlzLnBvc2l0aW9uLngsIHRoaXMucG9zaXRpb24ueSwgdGhpcy5yYWRpdXMsIDAsIE1hdGguUEkgLyAxODAsIHRydWUpO1xyXG4gICAgICAgICAgY29udGV4dC5maWxsKCk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH07XHJcbiAgXHJcbiAgcmV0dXJuIE1vdmVyO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzKCk7XHJcbiIsInZhciBleHBvcnRzID0ge1xyXG4gIGdldFJhbmRvbUludDogZnVuY3Rpb24obWluLCBtYXgpe1xyXG4gICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4pKSArIG1pbjtcclxuICB9LFxyXG4gIGdldERlZ3JlZTogZnVuY3Rpb24ocmFkaWFuKSB7XHJcbiAgICByZXR1cm4gcmFkaWFuIC8gTWF0aC5QSSAqIDE4MDtcclxuICB9LFxyXG4gIGdldFJhZGlhbjogZnVuY3Rpb24oZGVncmVlcykge1xyXG4gICAgcmV0dXJuIGRlZ3JlZXMgKiBNYXRoLlBJIC8gMTgwO1xyXG4gIH0sXHJcbiAgZ2V0U3BoZXJpY2FsOiBmdW5jdGlvbihyYWQxLCByYWQyLCByKSB7XHJcbiAgICB2YXIgeCA9IE1hdGguY29zKHJhZDEpICogTWF0aC5jb3MocmFkMikgKiByO1xyXG4gICAgdmFyIHogPSBNYXRoLmNvcyhyYWQxKSAqIE1hdGguc2luKHJhZDIpICogcjtcclxuICAgIHZhciB5ID0gTWF0aC5zaW4ocmFkMSkgKiByO1xyXG4gICAgcmV0dXJuIFt4LCB5LCB6XTtcclxuICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHM7XHJcbiIsIi8vIFxyXG4vLyDjgZPjga5WZWN0b3Iy44Kv44Op44K544Gv44CBdGhyZWUuanPjga5USFJFRS5WZWN0b3Iy44Kv44Op44K544Gu6KiI566X5byP44Gu5LiA6YOo44KS5Yip55So44GX44Gm44GE44G+44GZ44CCXHJcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9tcmRvb2IvdGhyZWUuanMvYmxvYi9tYXN0ZXIvc3JjL21hdGgvVmVjdG9yMi5qcyNMMzY3XHJcbi8vIFxyXG5cclxudmFyIGV4cG9ydHMgPSBmdW5jdGlvbigpe1xyXG4gIHZhciBWZWN0b3IyID0gZnVuY3Rpb24oeCwgeSkge1xyXG4gICAgdGhpcy54ID0geCB8fCAwO1xyXG4gICAgdGhpcy55ID0geSB8fCAwO1xyXG4gIH07XHJcbiAgXHJcbiAgVmVjdG9yMi5wcm90b3R5cGUgPSB7XHJcbiAgICBzZXQ6IGZ1bmN0aW9uICh4LCB5KSB7XHJcbiAgICAgIHRoaXMueCA9IHg7XHJcbiAgICAgIHRoaXMueSA9IHk7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuICAgIGNvcHk6IGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgIHRoaXMueCA9IHYueDtcclxuICAgICAgdGhpcy55ID0gdi55O1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH0sXHJcbiAgICBhZGQ6IGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgIHRoaXMueCArPSB2Lng7XHJcbiAgICAgIHRoaXMueSArPSB2Lnk7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuICAgIGFkZFNjYWxhcjogZnVuY3Rpb24gKHMpIHtcclxuICAgICAgdGhpcy54ICs9IHM7XHJcbiAgICAgIHRoaXMueSArPSBzO1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH0sXHJcbiAgICBzdWI6IGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgIHRoaXMueCAtPSB2Lng7XHJcbiAgICAgIHRoaXMueSAtPSB2Lnk7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuICAgIHN1YlNjYWxhcjogZnVuY3Rpb24gKHMpIHtcclxuICAgICAgdGhpcy54IC09IHM7XHJcbiAgICAgIHRoaXMueSAtPSBzO1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH0sXHJcbiAgICBtdWx0OiBmdW5jdGlvbiAodikge1xyXG4gICAgICB0aGlzLnggKj0gdi54O1xyXG4gICAgICB0aGlzLnkgKj0gdi55O1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH0sXHJcbiAgICBtdWx0U2NhbGFyOiBmdW5jdGlvbiAocykge1xyXG4gICAgICB0aGlzLnggKj0gcztcclxuICAgICAgdGhpcy55ICo9IHM7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuICAgIGRpdjogZnVuY3Rpb24gKHYpIHtcclxuICAgICAgdGhpcy54IC89IHYueDtcclxuICAgICAgdGhpcy55IC89IHYueTtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG4gICAgZGl2U2NhbGFyOiBmdW5jdGlvbiAocykge1xyXG4gICAgICB0aGlzLnggLz0gcztcclxuICAgICAgdGhpcy55IC89IHM7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuICAgIG1pbjogZnVuY3Rpb24gKHYpIHtcclxuICAgICAgaWYgKCB0aGlzLnggPCB2LnggKSB0aGlzLnggPSB2Lng7XHJcbiAgICAgIGlmICggdGhpcy55IDwgdi55ICkgdGhpcy55ID0gdi55O1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH0sXHJcbiAgICBtYXg6IGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgIGlmICggdGhpcy54ID4gdi54ICkgdGhpcy54ID0gdi54O1xyXG4gICAgICBpZiAoIHRoaXMueSA+IHYueSApIHRoaXMueSA9IHYueTtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG4gICAgY2xhbXA6IGZ1bmN0aW9uICh2X21pbiwgdl9tYXgpIHtcclxuICAgICAgaWYgKCB0aGlzLnggPCB2X21pbi54ICkge1xyXG4gICAgICAgIHRoaXMueCA9IHZfbWluLng7XHJcbiAgICAgIH0gZWxzZSBpZiAoIHRoaXMueCA+IHZfbWF4LnggKSB7XHJcbiAgICAgICAgdGhpcy54ID0gdl9tYXgueDtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIHRoaXMueSA8IHZfbWluLnkgKSB7XHJcbiAgICAgICAgdGhpcy55ID0gdl9taW4ueTtcclxuICAgICAgfSBlbHNlIGlmICggdGhpcy55ID4gdl9tYXgueSApIHtcclxuICAgICAgICB0aGlzLnkgPSB2X21heC55O1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuICAgIGZsb29yOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHRoaXMueCA9IE1hdGguZmxvb3IoIHRoaXMueCApO1xyXG4gICAgICB0aGlzLnkgPSBNYXRoLmZsb29yKCB0aGlzLnkgKTtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG4gICAgY2VpbDogZnVuY3Rpb24gKCkge1xyXG4gICAgICB0aGlzLnggPSBNYXRoLmNlaWwoIHRoaXMueCApO1xyXG4gICAgICB0aGlzLnkgPSBNYXRoLmNlaWwoIHRoaXMueSApO1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH0sXHJcbiAgICByb3VuZDogZnVuY3Rpb24gKCkge1xyXG4gICAgICB0aGlzLnggPSBNYXRoLnJvdW5kKCB0aGlzLnggKTtcclxuICAgICAgdGhpcy55ID0gTWF0aC5yb3VuZCggdGhpcy55ICk7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuICAgIHJvdW5kVG9aZXJvOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHRoaXMueCA9ICggdGhpcy54IDwgMCApID8gTWF0aC5jZWlsKCB0aGlzLnggKSA6IE1hdGguZmxvb3IoIHRoaXMueCApO1xyXG4gICAgICB0aGlzLnkgPSAoIHRoaXMueSA8IDAgKSA/IE1hdGguY2VpbCggdGhpcy55ICkgOiBNYXRoLmZsb29yKCB0aGlzLnkgKTtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG4gICAgbmVnYXRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHRoaXMueCA9IC0gdGhpcy54O1xyXG4gICAgICB0aGlzLnkgPSAtIHRoaXMueTtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG4gICAgZG90OiBmdW5jdGlvbiAodikge1xyXG4gICAgICByZXR1cm4gdGhpcy54ICogdi54ICsgdGhpcy55ICogdi55O1xyXG4gICAgfSxcclxuICAgIGxlbmd0aFNxOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLnggKiB0aGlzLnggKyB0aGlzLnkgKiB0aGlzLnk7XHJcbiAgICB9LFxyXG4gICAgbGVuZ3RoOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHJldHVybiBNYXRoLnNxcnQodGhpcy5sZW5ndGhTcSgpKTtcclxuICAgIH0sXHJcbiAgICBub3JtYWxpemU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuZGl2U2NhbGFyKHRoaXMubGVuZ3RoKCkpO1xyXG4gICAgfSxcclxuICAgIGRpc3RhbmNlVG86IGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgIHZhciBkeCA9IHRoaXMueCAtIHYueDtcclxuICAgICAgdmFyIGR5ID0gdGhpcy55IC0gdi55O1xyXG4gICAgICByZXR1cm4gTWF0aC5zcXJ0KGR4ICogZHggKyBkeSAqIGR5KTtcclxuICAgIH0sXHJcbiAgICBzZXRMZW5ndGg6IGZ1bmN0aW9uIChsKSB7XHJcbiAgICAgIHZhciBvbGRMZW5ndGggPSB0aGlzLmxlbmd0aCgpO1xyXG4gICAgICBpZiAoIG9sZExlbmd0aCAhPT0gMCAmJiBsICE9PSBvbGRMZW5ndGggKSB7XHJcbiAgICAgICAgdGhpcy5tdWx0U2NhbGFyKGwgLyBvbGRMZW5ndGgpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuICAgIGNsb25lOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHJldHVybiBuZXcgVmVjdG9yMih0aGlzLngsIHRoaXMueSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gVmVjdG9yMjtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cygpO1xyXG4iXX0=
