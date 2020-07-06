(function(global){

  function mouseDownHandler(event) {
    this.mouseDown = true;
    this.pressedButton = event.button;
    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;
    this.orignMouseX = event.clientX;
    this.orignMouseY = event.clientY;
    this.canvas.style.cursor = 'none';
  }

  function mouseUpHandler(event) {
    this.mouseDown = false;
    this.canvas.style.cursor = 'grab';
    if (event.clientX - this.orignMouseX === 0 && event.clientY - this.orignMouseY === 0) {
      this.onClick(event.clientX, event.clientY);
    }
  }

  function mouseMoveHandler(event) {
    if (!this.mouseDown) {
      this.canvas.style.cursor = 'grab';
      return;
    }

    const deltaX = event.clientX - this.lastMouseX;
    const deltaY = event.clientY - this.lastMouseY;

    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;

    switch (this.pressedButton) {
      case 0:
        this.onRotate(deltaX, deltaY);
        break;
      case 2:
        this.onPan(deltaX, deltaY);
        break;
    }
  }

  function mouseWheelHandler(event) {
    if (Math.abs(event.deltaY) < 1.0) {
      return;
    }

    this.canvas.style.cursor = 'none';
    this.onZoom(event.deltaY);
  }

  global.mouseDownHandler = mouseDownHandler;
  global.mouseUpHandler = mouseUpHandler;
  global.mouseMoveHandler = mouseMoveHandler;
  global.mouseWheelHandler = mouseWheelHandler;

})(window);