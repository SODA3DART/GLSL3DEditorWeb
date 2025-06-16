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