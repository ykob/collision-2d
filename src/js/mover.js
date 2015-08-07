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
