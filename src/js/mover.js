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
