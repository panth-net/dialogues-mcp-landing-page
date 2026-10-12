"use client";

import { useEffect, useRef } from "react";

// The light is all soft gradients, so half resolution looks the same and
// costs a quarter of the pixels.
const RESOLUTION = 0.5;
// Screen heights per second on a wide screen. A steady drift: easing would
// rush the wave through the visible middle of its path.
const SPEED = 0.28;
// The speed is measured in screen heights, so a portrait phone (a short
// distance across) is crossed much faster. Scale it down there so a crossing
// takes about as long as it does on a desktop.
const DESKTOP_ASPECT = 1.7;
const NARROW_QUERY = "(max-width: 1023px)";
// How far past each edge the wave starts and ends, so it enters and leaves
// fully (slant, sway and glow included).
const MARGIN = 0.7;
// Three waves follow one another this many seconds apart.
const GAP_SECONDS = 1.6;
const PAUSE_SECONDS = 4;
const FIRST_DELAY_SECONDS = 1;

const VERTEX = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = vec2(a_pos.x * 0.5 + 0.5, 0.5 - a_pos.y * 0.5);
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

// Slanted bands of cool white light, like a sheen on glass: each a broad
// glow with a brighter crest at its leading edge. The edges sway gently so
// they read as waves rather than straight streaks. Each wave has its own
// slant and sway, and each is a little fainter than the one ahead of it.
const FRAGMENT = `
precision mediump float;
uniform float u_aspect;
uniform vec3 u_centers;
uniform float u_time;
varying vec2 v_uv;

float wave(vec2 p, float center, float slant, float phase) {
  float t = u_time + phase;
  float edge = center
    + (p.y - 0.5) * slant
    + sin(p.y * 2.6 + t * 0.7) * 0.05
    + sin(p.y * 6.1 - t * 0.9) * 0.015;
  float d = p.x - edge;
  float glow = exp(-d * d / 0.04) * 0.075;
  float crest = exp(-(d - 0.05) * (d - 0.05) / 0.0006) * 0.085;
  float trail = exp(-(d + 0.11) * (d + 0.11) / 0.002) * 0.035;
  return glow + crest * (0.85 + 0.15 * sin(p.y * 9.0 + t * 1.3)) + trail;
}

void main() {
  vec2 p = vec2(v_uv.x * u_aspect, v_uv.y);
  float a = wave(p, u_centers.x, 0.32, 0.0)
          + wave(p, u_centers.y, 0.26, 2.1) * 0.8
          + wave(p, u_centers.z, 0.37, 4.3) * 0.65;
  a = min(a, 0.2);
  gl_FragColor = vec4(vec3(0.93, 0.97, 1.0) * a, a);
}`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
}

/** Three soft waves of light that drift across the background now and then. */
export function LightWave() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      powerPreference: "low-power",
    });
    if (!canvas || !gl) return;

    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram();
    if (!vertex || !fragment || !program) return;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
    gl.clearColor(0, 0, 0, 0);

    const uAspect = gl.getUniformLocation(program, "u_aspect");
    const uCenters = gl.getUniformLocation(program, "u_centers");
    const uTime = gl.getUniformLocation(program, "u_time");

    let aspect = 1;
    let frame = 0;
    let stopped = false;
    let cleared = false;
    const start = performance.now();
    const narrow = window.matchMedia(NARROW_QUERY);
    const travelSpeed = () =>
      narrow.matches ? SPEED * Math.min(1, aspect / DESKTOP_ASPECT) : SPEED;

    const resize = () => {
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * RESOLUTION));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * RESOLUTION));
      aspect = canvas.width / canvas.height;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(uAspect, aspect);
      cleared = false;
    };

    const draw = () => {
      if (stopped) return;
      const time = (performance.now() - start) / 1000;
      const speed = travelSpeed();
      // From the first wave entering to the last one leaving.
      const run = (aspect + 2 * MARGIN) / speed + 2 * GAP_SECONDS;
      const phase = (time - FIRST_DELAY_SECONDS) % (run + PAUSE_SECONDS);
      if (time >= FIRST_DELAY_SECONDS && phase < run) {
        gl.uniform3f(
          uCenters,
          phase * speed - MARGIN,
          (phase - GAP_SECONDS) * speed - MARGIN,
          (phase - 2 * GAP_SECONDS) * speed - MARGIN,
        );
        gl.uniform1f(uTime, time);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        cleared = false;
      } else if (!cleared) {
        gl.clear(gl.COLOR_BUFFER_BIT);
        cleared = true;
      }
      frame = requestAnimationFrame(draw);
    };

    const onContextLost = () => {
      stopped = true;
      cancelAnimationFrame(frame);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    canvas.addEventListener("webglcontextlost", onContextLost);

    return () => {
      stopped = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("webglcontextlost", onContextLost);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="light-wave" />;
}
