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