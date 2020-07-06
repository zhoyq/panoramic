// 获取 canvas 对象
const canvas = document.getElementById('main-canvas');

// 获取 gl context 对象
const gl = getWebGLContext(canvas);

// 加载 gl 扩展
const requiredWebglExtensions = [
  'EXT_shader_texture_lod',
  'OES_standard_derivatives',
  'OES_element_index_uint',
  'OES_texture_float',
  'OES_texture_float_linear'
];

loadWebGlExtensions(gl, requiredWebglExtensions);

// 获取 shader
const vertShaderContent = `
attribute vec3 a_Position;

uniform mat4 u_ViewProjectionMatrix;

varying vec3 v_Normal;

void main()
{
  v_Normal = a_Position;
  gl_Position = u_ViewProjectionMatrix * vec4(a_Position, 1.0);
}
`;
const fragShaderContent = `
precision highp float;

varying vec3 v_Normal;

void main()
{
  gl_FragColor = vec4(normalize(v_Normal), 1.0);
  // gl_FragColor = vec4(vec3(0.5), 1.0);
}
`;

// 编译 shader 成 program
const vertShader = compileVertShader(gl, vertShaderContent);
const fragShader = compileFragShader(gl, fragShaderContent);
const program = linkProgram(gl, vertShader, fragShader);

// 设置相机
const camera = new Camera();

// 鼠标绑定事件对象属性
const mouseEventProp = {
  canvas: canvas,
  mouseDown: false,
  pressedButton: undefined,
  lastMouseX: 0,
  lastMouseY: 0,
  orignMouseX: 0,
  orignMouseY: 0,
  onClick: (x, y) => {},
  onRotate: (x, y) => {
    camera.rotate(x, y);
  },
  onPan: (x, y) => {
    camera.pan(x, y);
  },
  onZoom: (delta) => {
    camera.zoomIn(delta);
  }
};

// 绑定鼠标
document.addEventListener('mouseup', mouseUpHandler.bind(mouseEventProp), { passive: true });
document.addEventListener('mousemove', mouseMoveHandler.bind(mouseEventProp), { passive: true });
canvas.addEventListener('mousedown', mouseDownHandler.bind(mouseEventProp), { passive: true });
canvas.addEventListener('wheel', mouseWheelHandler.bind(mouseEventProp), { passive: true });

// 屏蔽右键菜单
document.oncontextmenu = () => false;

// 准备
gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LEQUAL);
gl.colorMask(true, true, true, true);
gl.clearDepth(1.0);
gl.cullFace(gl.FRONT);

camera.fitViewToScene([-2, -2, -2], [2, 2, 2]);
camera.updatePosition();

// 准备绘制Buffer
let positionBufferVertices = initBuffer(gl, gl.ARRAY_BUFFER, new Float32Array([
  -1.0, 1.0, -1.0,
  -1.0, -1.0, -1.0,
  1.0, -1.0, -1.0,
  1.0, -1.0, -1.0,
  1.0, 1.0, -1.0,
  -1.0, 1.0, -1.0,
  -1.0, -1.0, 1.0,
  -1.0, -1.0, -1.0,
  -1.0, 1.0, -1.0,
  -1.0, 1.0, -1.0,
  -1.0, 1.0, 1.0,
  -1.0, -1.0, 1.0,
  1.0, -1.0, -1.0,
  1.0, -1.0, 1.0,
  1.0, 1.0, 1.0,
  1.0, 1.0, 1.0,
  1.0, 1.0, -1.0,
  1.0, -1.0, -1.0,
  -1.0, -1.0, 1.0,
  -1.0, 1.0, 1.0,
  1.0, 1.0, 1.0,
  1.0, 1.0, 1.0,
  1.0, -1.0, 1.0,
  -1.0, -1.0, 1.0,
  -1.0, 1.0, -1.0,
  1.0, 1.0, -1.0,
  1.0, 1.0, 1.0,
  1.0, 1.0, 1.0,
  -1.0, 1.0, 1.0,
  -1.0, 1.0, -1.0,
  -1.0, -1.0, -1.0,
  -1.0, -1.0, 1.0,
  1.0, -1.0, -1.0,
  1.0, -1.0, -1.0,
  -1.0, -1.0, 1.0,
  1.0, -1.0, 1.0
]));

// 渲染帧
function renderFrame(ms) {
  window.requestAnimationFrame(renderFrame);

  // 全局宽度和高度
  const globalWidth = canvas.clientWidth;
  const globalHeight = canvas.clientHeight;
  canvas.width = globalWidth;
  canvas.height = globalHeight;
  gl.viewport(0, 0, globalWidth, globalHeight);

  // 计算摄像机位置
  camera.aspectRatio = globalWidth / globalHeight;
  camera.updatePosition();

  // 计算投影矩阵视图矩阵
  const projMatrix = camera.projectionMatrix();
  const viewMatrix = camera.viewMatrix();
  const viewProjectionMatrix = glMatrix.mat4.create();
  glMatrix.mat4.multiply(viewProjectionMatrix, projMatrix, viewMatrix);

  // 清理 颜色和深度缓冲
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // 使用当前shader
  gl.useProgram(program);

  // 绘制
  // 更新 uniform 值
  const viewProjectionMatrixLoc = gl.getUniformLocation(program, 'u_ViewProjectionMatrix');
  gl.uniformMatrix4fv(viewProjectionMatrixLoc, false, viewProjectionMatrix);

  // 更新 attr 值
  const positionLoc = setAttributeBuffer(gl, program, 'a_Position', positionBufferVertices, 3);

  gl.disable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);
  gl.disable(gl.BLEND);

  gl.drawArrays(4, 0, 36);

  gl.disableVertexAttribArray(positionLoc);
}

// 启动渲染帧
window.requestAnimationFrame(renderFrame);

// 取消遮罩
const spinner = document.getElementById('mask');

if (spinner !== undefined) {
  spinner.className = 'mask-none';
  setTimeout(() => {
    spinner.style.display = 'none';
  }, 1000);
}
