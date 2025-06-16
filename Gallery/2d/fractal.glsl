precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;

void main() {
  vec2 st = gl_FragCoord.xy / u_resolution.xy;
  st = st * 2.0 - 1.0;
  st.x *= u_resolution.x / u_resolution.y;

  // Initial values for the Mandelbrot set
  vec2 z = vec2(0.0);
  vec2 c = st * vec2(1.5, 1.5) + vec2(sin(u_time * 0.1) * 0.5, cos(u_time * 0.1) * 0.3);

  float iterations = 100.0;
  float i;

  for (i = 0.0; i < iterations; i++) {
    // z = z^2 + c
    z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;

    if (length(z) > 2.0) break;
  }

  // Normalize the result
  float color = i / iterations;

  // Create a more interesting color palette
  vec3 finalColor = vec3(
    0.5 + 0.5 * sin(color * 3.14159 + u_time),
    0.5 + 0.5 * sin(color * 3.14159 * 2.0 + u_time),
    0.5 + 0.5 * sin(color * 3.14159 * 4.0 + u_time)
  );

  gl_FragColor = vec4(finalColor, 1.0);
}