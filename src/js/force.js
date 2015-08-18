var Vector2 = require('./vector2');

var exports = {
  friction: function(vector, value) {
    var friction = vector.clone();
    friction.multScalar(-1);
    friction.normalize();
    friction.multScalar(value);
    return friction;
  },
  drag: function(vector, value) {
    var drag = vector.clone();
    drag.multScalar(-1);
    drag.normalize();
    drag.multScalar(vector.length() * value);
    return drag;
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
