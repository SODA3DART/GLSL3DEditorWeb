precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;

void main() {
  vec2 st = gl_FragCoord.xy / u_resolution.xy;

  // Create wave pattern
  float y = sin(st.x * 10.0 + u_time) * 0.1 + 0.5;
  float wave = smoothstep(y - 0.01, y, st.y) - smoothstep(y, y + 0.01, st.y);

  // Create color gradient based on position
  vec3 color = vec3(st.x, st.y, abs(sin(u_time * 0.5)));

  // Apply wave pattern
  color *= wave * 2.0 + 0.5;

  gl_FragColor = vec4(color, 1.0);
}