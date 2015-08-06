var Util = require('./util');
var util = new Util();
var Vector2 = require('./vector2');

var exports = function(){
  var Mover = function() {
    var radian = util.getRadian(util.getRandomInt(0, 360));
    
    this.radius = util.getRandomInt(20, 60);
    this.position = new Vector2();
    this.velocity = new Vector2();
    this.accelerationScalar = util.getRandomInt(1, 5);
    this.acceleration = new Vector2(Math.cos(radian) * this.accelerationScalar, Math.sin(radian) * this.accelerationScalar);
    this.direction = 0;
  };
  
  Mover.prototype = {
    move: function() {
      this.velocity.add(this.acceleration);
      this.direct(this.velocity);
      this.position.set(this.velocity.x, this.velocity.y);
    },
    direct: function(vector) {
      var v = vector.clone().sub(this.position);
      this.direction = Math.atan2(v.y, v.x);
    },
    draw: function(context) {
      context.lineWidth = 4;
      
      context.beginPath();
      context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI / 180, true);
      context.stroke();
      
      context.beginPath();
      context.moveTo(this.position.x, this.position.y);
      context.lineTo(this.position.x + Math.cos(this.direction) * this.radius * 1.5, this.position.y + Math.sin(this.direction) * this.radius * 1.5);
      context.stroke();
    }
  };
  
  return Mover;
};

module.exports = exports();
