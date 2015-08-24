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

var init = function() {
  for (var i = 0; i < moversNum; i++) {
    var mover = new Mover();
    var radian = Util.getRadian(Util.getRandomInt(0, 360));
    var scalar = Util.getRandomInt(10, 20);
    var force = new Vector2(Math.cos(radian) * scalar, Math.sin(radian) * scalar);
    var x = body_width / 2;
    var y = body_height / 2;
    
    mover.radius = Util.getRandomInt(50, 120);
    mover.mass = mover.radius / 10;
    mover.position.set(x, y);
    mover.velocity.set(x, y);
    mover.anchor.set(x, y);
    mover.applyForce(force);
    movers[i] = mover;
  }
  
  changeMode(1);
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
