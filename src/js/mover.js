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
