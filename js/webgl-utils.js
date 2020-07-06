(function(global){

  // 获取 gl 上下文
  function getWebGLContext(canvas){
    const parameters = { alpha: false, antialias: true };
    const contextTypes = [ 'webgl', 'experimental-webgl' ];
    let context;

    for (const contextType of contextTypes) {
      context = canvas.getContext(contextType, parameters);
      if (context) {
        return context;
      }
    }
    return null;  
  }

  // 加载 gl 扩展
  function loadWebGlExtensions(gl, webglExtensions) {
    webglExtensions.forEach((extension) => {
      if (gl.getExtension(extension) === null) {
        console.warn('Extension ' + extension + ' not supported!');
      }
    });

    let extTextureFilterAnisotropic = gl.getExtension('EXT_texture_filter_anisotropic');

    if (extTextureFilterAnisotropic) {
      gl.anisotropy = extTextureFilterAnisotropic.TEXTURE_MAX_ANISOTROPY_EXT;
      gl.maxAnisotropy = gl.getParameter(extTextureFilterAnisotropic.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
      gl['supports_EXT_texture_filter_anisotropic'] = true;
    } else {
      gl['supports_EXT_texture_filter_anisotropic'] = false;
    }
  }

  // 编译 shader
  function compileShader(gl, shader, shaderSource) {
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);

    const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

    if (!compiled) {
      let info = '';
      const messages = gl.getShaderInfoLog(shader).split('\n');

      messages.forEach((message) => {
        info += message + '\n';
      });

      throw new Error("Could not compile WebGL program . \n\n" + info);
    }

    return shader;
  }

  // 编译 vert shader
  function compileVertShader(gl, shaderSource) {
    const shader = gl.createShader(gl.VERTEX_SHADER);

    return compileShader(gl, shader, shaderSource);
  }

  // 编译 frag shader
  function compileFragShader(gl, shaderSource) {
    const shader = gl.createShader(gl.FRAGMENT_SHADER);

    return compileShader(gl, shader, shaderSource);
  }

  // 连接 shader
  function linkProgram(gl, vertShader, fragShader) {
    let program = gl.createProgram();

    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      let info = gl.getProgramInfoLog(program);

      throw new Error('Could not link WebGL program. \n\n' + info);
    }

    return program;
  }

  function initBuffer(gl, type, data){
    const buffer = gl.createBuffer();

    gl.bindBuffer(type, buffer);
    gl.bufferData(type, data, gl.STATIC_DRAW);
    return buffer;
  }

  function setAttributeBuffer(gl, program, attrName, buffer, n) {
    const loc = gl.getAttribLocation(program, attrName);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(loc, n, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(loc);

    return loc;
  }

  global.getWebGLContext = getWebGLContext;
  global.loadWebGlExtensions = loadWebGlExtensions;
  global.compileShader = compileShader;
  global.compileVertShader = compileVertShader;
  global.compileFragShader = compileFragShader;
  global.linkProgram = linkProgram;
  global.initBuffer = initBuffer;
  global.setAttributeBuffer = setAttributeBuffer;

})(window);