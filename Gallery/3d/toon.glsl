precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_lightDirection;
uniform vec3 u_lightColor;
uniform vec3 u_ambientColor;
uniform vec3 u_viewPosition;

varying vec3 v_normal;
varying vec3 v_worldPosition;
varying vec2 v_texcoord;

void main() {
  vec3 normal = normalize(v_normal);

  // Ambient light
  vec3 ambient = u_ambientColor;

  // Diffuse light with toon shading
  vec3 lightDir = normalize(u_lightDirection);
  float diff = max(dot(normal, lightDir), 0.0);

  // Quantize the diffuse to create toon shading effect
  diff = floor(diff * 3.0) / 3.0;

  vec3 diffuse = diff * u_lightColor;

  // Base color with some variation
  vec3 objectBaseColor = vec3(0.6, 0.3, 0.8);
  objectBaseColor = mix(objectBaseColor, vec3(0.8, 0.3, 0.6), sin(v_worldPosition.x * 5.0 + u_time) * 0.5 + 0.5);

  // Edge detection for outline
  float edge = 1.0;
  if (diff < 0.1) {
    edge = 0.0;
  }

  vec3 finalColor = (ambient + diffuse) * objectBaseColor * edge;

  // Quantize the final color for a more cartoon-like appearance
  finalColor = floor(finalColor * 5.0) / 5.0;

  gl_FragColor = vec4(finalColor, 1.0);
}