var movingBallObjArr = [];
var movingballNum = 20;
var lastTimeRender = +new Date();

ctx.lineWidth = 4;

var movingBallObj = function(x, y) {
  this.t = 0;
  this.x = x;
  this.y = y;
  this.v = getRandomInt(2, 10);
  this.r = getRandomInt(20, 40);
  this.moveX = 0;
  this.moveY = 0;
  this.orientation = getRadian(getRandomInt(0, 360));
};

movingBallObj.prototype.speculateMovePoint = function() {
  // 次フレームの動きを推測する
  this.moveX = this.x + Math.cos(this.orientation) * this.v;
  this.moveY = this.y + Math.sin(this.orientation) * this.v;
};

movingBallObj.prototype.getOrientation = function() {
  this.orientation = Math.atan2(this.moveY - this.y, this.moveX - this.x);
};

movingBallObj.prototype.collisionDetection = function() {
  // 衝突判定をここに記述
};

movingBallObj.prototype.move = function() {
  this.t += frameTime;
  this.x = this.moveX;
  this.y = this.moveY;
};

movingBallObj.prototype.render = function() {
  ctx.beginPath();
  ctx.arc(this.x, this.y, this.r, 0, Math.PI / 180, true);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(this.x, this.y);
  ctx.lineTo(this.x + Math.cos(this.orientation) * this.r * 1.5, this.y + Math.sin(this.orientation) * this.r * 1.5);
  ctx.stroke();
};

var render = function() {
  ctx.clearRect(0, 0, width, height);

  for (var i = 0; i < movingBallObjArr.length; i++) {
    movingBallObjArr[i].speculateMovePoint();
    movingBallObjArr[i].getOrientation();
    movingBallObjArr[i].collisionDetection();
    movingBallObjArr[i].move();
    movingBallObjArr[i].render();
  }
};

var renderloop = function() {
  var now = +new Date();
  requestAnimationFrame(renderloop);

  if (now - lastTimeRender < frameTime) {
    return;
  }
  render();
  lastTimeRender = +new Date();
};
renderloop();

for (var i = 0; i < movingballNum; i++) {
  movingBallObjArr[i] = new movingBallObj(getRandomInt(0, width), getRandomInt(0, height));
}
