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

// Function to convert HSV to RGB
vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
  vec3 normal = normalize(v_normal);

  // Ambient light
  vec3 ambient = u_ambientColor;

  // Diffuse light
  vec3 lightDir = normalize(u_lightDirection);
  float diff = max(dot(normal, lightDir), 0.0);
  vec3 diffuse = diff * u_lightColor;

  // Create rainbow pattern based on position and time
  float hue = fract((v_worldPosition.x + v_worldPosition.y + v_worldPosition.z) * 0.1 + u_time * 0.1);
  vec3 objectBaseColor = hsv2rgb(vec3(hue, 0.8, 0.9));

  vec3 finalColor = (ambient + diffuse) * objectBaseColor;

  gl_FragColor = vec4(finalColor, 1.0);
}