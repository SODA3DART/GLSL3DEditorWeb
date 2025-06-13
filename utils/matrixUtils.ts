
// Basic 4x4 Matrix Math utilities (column-major order, compatible with WebGL)
// Uses Float32Array for direct use with WebGL uniformMatrix4fv

export type Mat4 = Float32Array;

export function createMat4(): Mat4 {
  const out = new Float32Array(16);
  out[0] = 1;
  out[5] = 1;
  out[10] = 1;
  out[15] = 1;
  return out;
}

export function multiplyMat4(out: Mat4, a: Mat4, b: Mat4): Mat4 {
  const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  const a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

  let b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
  out[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
  out[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
  out[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
  out[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

  b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
  out[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
  out[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
  out[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
  out[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

  b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
  out[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
  out[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
  out[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
  out[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

  b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
  out[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
  out[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
  out[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
  out[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
  return out;
}

export function perspectiveMat4(out: Mat4, fovy: number, aspect: number, near: number, far: number): Mat4 {
  const f = 1.0 / Math.tan(fovy / 2);
  out[0] = f / aspect;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = f;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[11] = -1;
  out[15] = 0;
  if (far != null && far !== Infinity) {
    const nf = 1 / (near - far);
    out[10] = (far + near) * nf;
    out[14] = (2 * far * near) * nf;
  } else {
    out[10] = -1;
    out[14] = -2 * near;
  }
  return out;
}

export function lookAtMat4(out: Mat4, eye: [number,number,number], center: [number,number,number], up: [number,number,number]): Mat4 {
  let x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
  const eyex = eye[0];
  const eyey = eye[1];
  const eyez = eye[2];
  const upx = up[0];
  const upy = up[1];
  const upz = up[2];
  const centerx = center[0];
  const centery = center[1];
  const centerz = center[2];

  z0 = eyex - centerx;
  z1 = eyey - centery;
  z2 = eyez - centerz;
  len = 1 / Math.sqrt(z0*z0 + z1*z1 + z2*z2);
  z0 *= len; z1 *= len; z2 *= len;

  x0 = upy*z2 - upz*z1;
  x1 = upz*z0 - upx*z2;
  x2 = upx*z1 - upy*z0;
  len = Math.sqrt(x0*x0 + x1*x1 + x2*x2);
  if (!len) {
    x0 = 0; x1 = 0; x2 = 0;
  } else {
    len = 1 / len;
    x0 *= len; x1 *= len; x2 *= len;
  }

  y0 = z1*x2 - z2*x1;
  y1 = z2*x0 - z0*x2;
  y2 = z0*x1 - z1*x0;
  len = Math.sqrt(y0*y0 + y1*y1 + y2*y2);
  if (!len) {
    y0 = 0; y1 = 0; y2 = 0;
  } else {
    len = 1 / len;
    y0 *= len; y1 *= len; y2 *= len;
  }

  out[0] = x0; out[1] = y0; out[2] = z0; out[3] = 0;
  out[4] = x1; out[5] = y1; out[6] = z1; out[7] = 0;
  out[8] = x2; out[9] = y2; out[10] = z2; out[11] = 0;
  out[12] = -(x0*eyex + x1*eyey + x2*eyez);
  out[13] = -(y0*eyex + y1*eyey + y2*eyez);
  out[14] = -(z0*eyex + z1*eyey + z2*eyez);
  out[15] = 1;
  return out;
}

export function translateMat4(out: Mat4, a: Mat4, v: [number,number,number]): Mat4 {
  const x = v[0], y = v[1], z = v[2];
  if (a === out) {
    out[12] = a[0]*x + a[4]*y + a[8]*z + a[12];
    out[13] = a[1]*x + a[5]*y + a[9]*z + a[13];
    out[14] = a[2]*x + a[6]*y + a[10]*z + a[14];
    out[15] = a[3]*x + a[7]*y + a[11]*z + a[15];
  } else {
    // Common case: a is an identity or other matrix, out is being newly calculated
    const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
    const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
    const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];

    out[0] = a00; out[1] = a01; out[2] = a02; out[3] = a03;
    out[4] = a10; out[5] = a11; out[6] = a12; out[7] = a13;
    out[8] = a20; out[9] = a21; out[10] = a22; out[11] = a23;

    out[12] = a00*x + a10*y + a20*z + a[12];
    out[13] = a01*x + a11*y + a21*z + a[13];
    out[14] = a02*x + a12*y + a22*z + a[14];
    out[15] = a03*x + a13*y + a23*z + a[15];
  }
  return out;
}

export function rotateMat4(out: Mat4, a: Mat4, rad: number, axis: [number,number,number]): Mat4 {
  let x = axis[0], y = axis[1], z = axis[2];
  let len = Math.sqrt(x*x + y*y + z*z);
  if (len < 0.000001) { return null; } // Problematic axis
  len = 1 / len;
  x *= len; y *= len; z *= len;

  const s = Math.sin(rad);
  const c = Math.cos(rad);
  const t = 1 - c;

  const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];

  // Construct the rotation matrix
  const r00 = x*x*t + c,   r01 = y*x*t + z*s, r02 = z*x*t - y*s;
  const r10 = x*y*t - z*s, r11 = y*y*t + c,   r12 = z*y*t + x*s;
  const r20 = x*z*t + y*s, r21 = y*z*t - x*s, r22 = z*z*t + c;

  // Multiply rotation matrix by incoming matrix a
  out[0] = a00*r00 + a10*r01 + a20*r02;
  out[1] = a01*r00 + a11*r01 + a21*r02;
  out[2] = a02*r00 + a12*r01 + a22*r02;
  out[3] = a03*r00 + a13*r01 + a23*r02;

  out[4] = a00*r10 + a10*r11 + a20*r12;
  out[5] = a01*r10 + a11*r11 + a21*r12;
  out[6] = a02*r10 + a12*r11 + a22*r12;
  out[7] = a03*r10 + a13*r11 + a23*r12;

  out[8] = a00*r20 + a10*r21 + a20*r22;
  out[9] = a01*r20 + a11*r21 + a21*r22;
  out[10] = a02*r20 + a12*r21 + a22*r22;
  out[11] = a03*r20 + a13*r21 + a23*r22;
  
  if (a !== out) { // If a is not a temporary matrix being overwritten
    out[12] = a[12]; out[13] = a[13]; out[14] = a[14]; out[15] = a[15];
  }
  return out;
}

export function invertMat4(out: Mat4, a: Mat4): Mat4 {
  const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  const a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

  const b00 = a00*a11 - a01*a10;
  const b01 = a00*a12 - a02*a10;
  const b02 = a00*a13 - a03*a10;
  const b03 = a01*a12 - a02*a11;
  const b04 = a01*a13 - a03*a11;
  const b05 = a02*a13 - a03*a12;
  const b06 = a20*a31 - a21*a30;
  const b07 = a20*a32 - a22*a30;
  const b08 = a20*a33 - a23*a30;
  const b09 = a21*a32 - a22*a31;
  const b10 = a21*a33 - a23*a31;
  const b11 = a22*a33 - a23*a32;

  let det = b00*b11 - b01*b10 + b02*b09 + b03*b08 - b04*b07 + b05*b06;
  if (!det) { return null; } // Matrix not invertible
  det = 1.0 / det;

  out[0] = (a11*b11 - a12*b10 + a13*b09) * det;
  out[1] = (a02*b10 - a01*b11 - a03*b09) * det;
  out[2] = (a31*b05 - a32*b04 + a33*b03) * det;
  out[3] = (a22*b04 - a21*b05 - a23*b03) * det;
  out[4] = (a12*b08 - a10*b11 - a13*b07) * det;
  out[5] = (a00*b11 - a02*b08 + a03*b07) * det;
  out[6] = (a32*b02 - a30*b05 - a33*b01) * det;
  out[7] = (a20*b05 - a22*b02 + a23*b01) * det;
  out[8] = (a10*b10 - a11*b08 + a13*b06) * det;
  out[9] = (a01*b08 - a00*b10 - a03*b06) * det;
  out[10] = (a30*b04 - a31*b02 + a33*b00) * det;
  out[11] = (a21*b02 - a20*b04 - a23*b00) * det;
  out[12] = (a11*b07 - a10*b09 - a12*b06) * det;
  out[13] = (a00*b09 - a01*b07 + a02*b06) * det;
  out[14] = (a31*b01 - a30*b03 - a32*b00) * det;
  out[15] = (a20*b03 - a21*b01 + a22*b00) * det;
  return out;
}

export function transposeMat4(out: Mat4, a: Mat4): Mat4 {
  if (out === a) {
    const a01 = a[1], a02 = a[2], a03 = a[3];
    const a12 = a[6], a13 = a[7];
    const a23 = a[11];
    out[1] = a[4]; out[2] = a[8]; out[3] = a[12];
    out[4] = a01;  out[6] = a[9]; out[7] = a[13];
    out[8] = a02;  out[9] = a12; out[11] = a[14];
    out[12] = a03; out[13] = a13;out[14] = a23;
  } else {
    out[0] = a[0]; out[1] = a[4]; out[2] = a[8]; out[3] = a[12];
    out[4] = a[1]; out[5] = a[5]; out[6] = a[9]; out[7] = a[13];
    out[8] = a[2]; out[9] = a[6]; out[10] = a[10]; out[11] = a[14];
    out[12] = a[3];out[13] = a[7];out[14] = a[11];out[15] = a[15];
  }
  return out;
}

export function normalFromMat4(out: Mat4, a: Mat4): Mat4 {
  // Calculates the normal matrix (inverse transpose) from a modelView matrix
  // Assumes the input matrix `a` is a modelView matrix (mat4)
  // The output `out` will be a mat3, but stored in a mat4 for simplicity with shader uniforms
  // or a mat3 can be used if preferred. Here, we adapt to use mat4.
  const b = createMat4();
  invertMat4(b, a);
  transposeMat4(out, b);
  // If a mat3 is needed, extract the top-left 3x3 portion
  return out;
}
