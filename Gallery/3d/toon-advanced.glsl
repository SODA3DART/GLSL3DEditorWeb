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

// Function to apply color banding/quantization
vec3 applyColorBanding(vec3 color, float bands) {
  return floor(color * bands) / bands;
}

void main() {
  vec3 normal = normalize(v_normal);
  vec3 viewDir = normalize(u_viewPosition - v_worldPosition);

  // Ambient light
  vec3 ambient = u_ambientColor * 0.5;

  // Diffuse light with toon shading
  vec3 lightDir = normalize(u_lightDirection);
  float diffuseStrength = max(dot(normal, lightDir), 0.0);

  // Create multiple color bands for more stylized look
  // Using 4 bands instead of 3 for more detail
  float diffuseBands = 4.0;
  float diffuseQuantized = floor(diffuseStrength * diffuseBands) / diffuseBands;

  vec3 diffuse = diffuseQuantized * u_lightColor;

  // Specular highlights with quantization
  vec3 halfwayDir = normalize(lightDir + viewDir);
  float specularStrength = pow(max(dot(normal, halfwayDir), 0.0), 64.0);

  // Quantize specular to create sharp highlights
  float specularQuantized = step(0.5, specularStrength);
  vec3 specular = specularQuantized * u_lightColor * 0.5;

  // Rim lighting (edge highlighting)
  float rimFactor = 1.0 - max(dot(viewDir, normal), 0.0);
  rimFactor = smoothstep(0.5, 0.8, rimFactor);
  vec3 rim = rimFactor * vec3(0.3, 0.3, 0.5);

  // Base color with artistic palette
  // Create a more vibrant and stylized base color
  vec3 baseColor = vec3(0.4, 0.2, 0.8); // Purple base

  // Add some position-based variation
  float positionFactor = sin(v_worldPosition.x * 3.0 + v_worldPosition.y * 2.0 + v_worldPosition.z + u_time * 0.5);
  baseColor = mix(baseColor, vec3(0.8, 0.3, 0.5), positionFactor * 0.5 + 0.5);

  // Edge detection for outline
  float outline = 1.0;
  float edgeFactor = max(dot(normal, viewDir), 0.0);
  if (edgeFactor < 0.3) {
    outline = 0.0; // Black outline
  }

  // Combine all lighting components
  vec3 finalColor = (ambient + diffuse) * baseColor * outline + specular + rim;

  // Apply final color quantization for cartoon look
  finalColor = applyColorBanding(finalColor, 5.0);

  // Add a subtle pulsing effect to make it more dynamic
  float pulse = sin(u_time) * 0.05 + 0.95;
  finalColor *= pulse;

  gl_FragColor = vec4(finalColor, 1.0);
}