(function(global){

  const vecZero = glMatrix.vec3.create();

  function Camera() {
    this.position = [0, 0, 0];
    this.target = [0, 1, 0];
    this.up = [0, 1, 0];
    this.zoom = 1;
    this.xRot = 0;
    this.yRot = 0;
    this.znear = 0.1;
    this.zfar = 100.0;
    this.yfov = 45.0 * Math.PI / 180.0;
    this.aspectRatio = 16.0 / 9.0;
  }
  
  Camera.prototype.projectionMatrix = function() {
    const projection = glMatrix.mat4.create();
    glMatrix.mat4.perspective(projection, this.yfov, this.aspectRatio, this.znear, this.zfar);
    return projection;
  };

  Camera.prototype.viewMatrix = function() {
    const view = glMatrix.mat4.create();
    const position = this.position;
    const target = this.target;

    glMatrix.mat4.lookAt(view, position, target, glMatrix.vec3.fromValues(0, 1, 0));
    return view;
  };

  Camera.prototype.updatePosition = function() {
    const direction = glMatrix.vec3.fromValues(0, 0, 1);

    glMatrix.vec3.rotateX(direction, direction, vecZero, -this.yRot);
    glMatrix.vec3.rotateY(direction, direction, vecZero, -this.xRot);

    const position = glMatrix.vec3.create();

    glMatrix.vec3.scale(position, direction, this.zoom);
    glMatrix.vec3.add(position, position, this.target);

    this.position = position;
  };

  Camera.prototype.rotate = function(x, y) {
    const yMax = Math.PI / 2 - 0.01;

    this.xRot += (x * (1 / 180));
    this.yRot += (y * (1 / 180));
    this.yRot = Math.min(Math.max(this.yRot, - Math.PI / 2), yMax);
  };

  Camera.prototype.pan = function(x, y) {
    const moveSpeed = 300;

    const left = glMatrix.vec3.fromValues(-1, 0, 0);

    glMatrix.vec3.rotateX(left, left, vecZero, -this.yRot);
    glMatrix.vec3.rotateY(left, left, vecZero, -this.xRot);
    glMatrix.vec3.scale(left, left, x * moveSpeed);

    const up = glMatrix.vec3.fromValues(0, 0, -1);

    // glMatrix.vec3.rotateX(up, up, vecZero, -this.yRot);
    glMatrix.vec3.rotateY(up, up, vecZero, -this.xRot);
    glMatrix.vec3.scale(up, up, y * moveSpeed);

    glMatrix.vec3.add(this.target, this.target, up);
    glMatrix.vec3.add(this.target, this.target, left);
  };

  Camera.prototype.zoomIn = function(delta) {
    if (delta > 0) {
      this.zoom *= 1.04;
    } else {
      this.zoom /= 1.04;
    }
  };

  Camera.prototype.fitViewToScene = function(min = [-10000, -10000, -10000],  max = [10000, 10000, 10000]) {
    for (const i of [0, 1, 2]) {
      this.target[i] = (max[i] + min[i]) / 2;
    }

    const maxAxisLength = Math.max(max[0] - min[0], max[1] - min[1]);

    this.yRot = Math.PI / 4.0;

    const yfov = this.yfov;
    const xfov = this.yfov * this.aspectRatio;

    const yZoom = maxAxisLength / 2 / Math.tan(yfov / 2);
    const xZoom = maxAxisLength / 2 / Math.tan(xfov / 2);

    this.zoom = Math.max(xZoom, yZoom);
  };

  global.Camera = Camera;

})(window);
