precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;

void main() {
  vec2 st = gl_FragCoord.xy / u_resolution.xy;
  st.x *= u_resolution.x / u_resolution.y;

  vec3 color = vec3(0.0);

  // Calculate distance from multiple points
  float d1 = distance(st, vec2(0.5 + 0.2 * sin(u_time), 0.5 + 0.2 * cos(u_time)));
  float d2 = distance(st, vec2(0.5 + 0.2 * sin(u_time + 2.0), 0.5 + 0.2 * cos(u_time + 2.0)));
  float d3 = distance(st, vec2(0.5 + 0.2 * sin(u_time + 4.0), 0.5 + 0.2 * cos(u_time + 4.0)));

  // Create circles with smooth edges
  float c1 = smoothstep(0.1, 0.09, d1);
  float c2 = smoothstep(0.1, 0.09, d2);
  float c3 = smoothstep(0.1, 0.09, d3);

  // Mix colors
  color = mix(color, vec3(1.0, 0.0, 0.0), c1);
  color = mix(color, vec3(0.0, 1.0, 0.0), c2);
  color = mix(color, vec3(0.0, 0.0, 1.0), c3);

  gl_FragColor = vec4(color, 1.0);
}