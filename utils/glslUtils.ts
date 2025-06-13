
export function compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) {
    console.error("Failed to create shader object.");
    return null;
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    // console.error(`Error compiling shader: ${gl.getShaderInfoLog(shader)}`);
    // Error will be retrieved by the caller using getShaderInfoLog
    // gl.deleteShader(shader); // Caller should handle deletion if createProgram fails or if it's an intermediate step
    return shader; // Return shader even if failed, so caller can get log
  }
  return shader;
}

export function createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram | null {
  const program = gl.createProgram();
  if (!program) {
    console.error("Failed to create program object.");
    return null;
  }
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    // console.error(`Error linking program: ${gl.getProgramInfoLog(program)}`);
    // Error will be retrieved by the caller using getProgramInfoLog
    // gl.deleteProgram(program); // Caller should handle deletion
    // gl.deleteShader(vertexShader); // It's good practice to detach and delete shaders after linking,
    // gl.deleteShader(fragmentShader); // but often they are deleted by the caller once program is linked successfully or if linking fails
    return program; // Return program even if failed, so caller can get log
  }
  return program;
}
