
// Currently, ShaderError is not strictly used with specific fields from this interface.
// It's kept for potential future expansion where structured error objects might be preferred
// over simple strings for more detailed error reporting.
export interface ShaderError {
  type: 'vertex' | 'fragment' | 'linking';
  message: string;
  details?: string; // e.g., line numbers or specific GLSL error codes
}

// Example of a more structured uniform type, if needed later
export interface ShaderUniforms {
  u_time?: number;
  u_resolution?: [number, number];
  u_mouse?: [number, number];
  // 3D uniforms
  u_modelMatrix?: number[]; // mat4
  u_viewMatrix?: number[]; // mat4
  u_projectionMatrix?: number[]; // mat4
  u_normalMatrix?: number[]; // mat4
  u_lightDirection?: [number, number, number];
  u_lightColor?: [number, number, number];
  u_ambientColor?: [number, number, number];
  u_viewPosition?: [number, number, number];
}

export type RenderMode = '2D' | '3D';

export type PrimitiveShape = 'Cube' | 'Sphere' | 'UploadedOBJ';

export interface ModelData {
  vertices: number[];
  normals: number[];
  indices?: number[]; // Optional, for indexed drawing
  uvs?: number[]; // Optional for texture coordinates
}

export interface CameraState {
  angleX: number;
  angleY: number;
  distance: number;
}
