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

  // Diffuse light
  vec3 lightDir = normalize(u_lightDirection);
  float diff = max(dot(normal, lightDir), 0.0);
  vec3 diffuse = diff * u_lightColor;

  // Specular light (Phong reflection model)
  vec3 viewDir = normalize(u_viewPosition - v_worldPosition);
  vec3 reflectDir = reflect(-lightDir, normal);
  float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
  vec3 specular = spec * u_lightColor;

  // Base color with some variation
  vec3 objectBaseColor = vec3(0.2, 0.4, 0.8);

  // Add some time-based variation
  float pulse = sin(u_time) * 0.5 + 0.5;
  objectBaseColor = mix(objectBaseColor, vec3(0.8, 0.4, 0.2), pulse * 0.3);

  vec3 finalColor = (ambient + diffuse) * objectBaseColor + specular;

  gl_FragColor = vec4(finalColor, 1.0);
}