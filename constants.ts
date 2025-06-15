
import { PrimitiveShape } from '../types';

export const DEFAULT_VERTEX_SHADER: string = `
attribute vec2 a_position;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export const DEFAULT_FRAGMENT_SHADER: string = `
precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;

void main() {
  vec2 st = gl_FragCoord.xy / u_resolution.xy;
  // Simple time-varying color pattern
  float r = 0.5 + 0.5 * cos(u_time + st.x * 3.14159);
  float g = 0.5 + 0.5 * sin(u_time * 0.8 + st.y * 2.71828);
  float b = 0.5 + 0.5 * cos(u_time * 1.2 + (st.x + st.y) * 1.61803);
  gl_FragColor = vec4(r, g, b, 1.0);
}
`;

export const DEFAULT_VERTEX_SHADER_3D: string = `
attribute vec3 a_position;
attribute vec3 a_normal;
attribute vec2 a_texcoord; // Texture coordinates (UV) - may be available if model has UVs

uniform mat4 u_modelMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;
uniform mat4 u_normalMatrix;

varying vec3 v_normal;
varying vec3 v_worldPosition;
varying vec2 v_texcoord; // Pass texture coordinates to fragment shader

void main() {
  vec4 worldPos = u_modelMatrix * vec4(a_position, 1.0);
  gl_Position = u_projectionMatrix * u_viewMatrix * worldPos;
  v_normal = normalize((u_normalMatrix * vec4(a_normal, 0.0)).xyz);
  v_worldPosition = worldPos.xyz;

  // Pass texture coordinates to fragment shader
  // If model doesn't have UVs, we'll generate them from position
  v_texcoord = a_texcoord;
}
`;

export const DEFAULT_FRAGMENT_SHADER_3D: string = `
precision mediump float;

uniform vec2 u_resolution; // Still potentially useful
uniform float u_time;
uniform vec3 u_lightDirection; // Directional light
uniform vec3 u_lightColor;
uniform vec3 u_ambientColor;
uniform vec3 u_viewPosition; // Camera position for specular, etc.

// Texture samplers - will be available when textures are uploaded
// Example: uniform sampler2D u_texture0; // [BaseMap]
// You can add more textures as needed

varying vec3 v_normal;
varying vec3 v_worldPosition;
varying vec2 v_texcoord; // Texture coordinates from vertex shader

void main() {
  vec3 normal = normalize(v_normal);

  // Ambient light
  vec3 ambient = u_ambientColor;

  // Diffuse light
  vec3 lightDir = normalize(u_lightDirection);
  float diff = max(dot(normal, lightDir), 0.0);
  vec3 diffuse = diff * u_lightColor;

  // Placeholder for object's base color - can be replaced by user's shader logic
  vec3 objectBaseColor = vec3(0.5, 0.5, 0.8); 

  // Apply time-based variation to object color (example)
  float r = 0.5 + 0.5 * cos(u_time + v_worldPosition.x * 0.5 + v_worldPosition.z * 0.3);
  float g = 0.5 + 0.5 * sin(u_time * 0.8 + v_worldPosition.y * 0.5);
  float b = 0.5 + 0.5 * cos(u_time * 1.2 + v_worldPosition.z * 0.5 - v_worldPosition.x * 0.2);
  objectBaseColor = mix(objectBaseColor, vec3(r,g,b), 0.7);

  // Example of how to use textures:
  // If you've uploaded a texture with ID "texture0":
  // vec4 texColor = texture2D(u_texture0, v_texcoord);
  // objectBaseColor = mix(objectBaseColor, texColor.rgb, 0.8);

  // If model doesn't have UVs, you can generate them from position:
  // vec4 texColor = texture2D(u_texture0, vec2(v_worldPosition.x, v_worldPosition.z) * 0.5 + 0.5);

  vec3 finalColor = (ambient + diffuse) * objectBaseColor;

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

export const PRIMITIVE_CUBE: PrimitiveShape = 'Cube';
export const PRIMITIVE_SPHERE: PrimitiveShape = 'Sphere';
export const UPLOADED_OBJ: PrimitiveShape = 'UploadedOBJ';

export const DEFAULT_LIGHT_DIRECTION: [number, number, number] = [0.5, 0.75, 1.0];
export const DEFAULT_LIGHT_COLOR: [number, number, number] = [1.0, 1.0, 1.0];
export const DEFAULT_AMBIENT_COLOR: [number, number, number] = [0.2, 0.2, 0.3];
