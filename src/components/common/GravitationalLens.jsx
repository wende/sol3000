import { onMount, onCleanup } from 'solid-js';

/**
 * GravitationalLens - WebGL-based gravitational lensing effect
 * Distorts whatever is behind it using Einstein ring physics
 * Features mouse-driven parallax for depth effect
 */
export const GravitationalLens = (props) => {
  let canvasRef;
  let gl;
  let program;
  let animationId;

  // Mouse tracking for parallax
  let mouse = { x: 0, y: 0 };
  let camera = { x: 0, y: 0 };

  // Shader sources
  const vertexShaderSource = `
    attribute vec2 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;

    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
      v_texCoord = a_texCoord;
    }
  `;

  const fragmentShaderSource = `
    precision highp float;

    varying vec2 v_texCoord;
    uniform sampler2D u_background;
    uniform vec2 u_resolution;
    uniform vec2 u_center;
    uniform float u_time;
    uniform float u_schwarzschildRadius;
    uniform float u_mass;

    // Gravitational lensing based on Schwarzschild metric
    vec2 gravitationalLens(vec2 uv, vec2 center, float mass, float rs) {
      vec2 delta = uv - center;
      float dist = length(delta);

      // Inside event horizon - pure black
      if (dist < rs) {
        return vec2(-1.0); // Signal to render black
      }

      // Deflection angle approximation (weak field)
      // In GR: alpha = 4GM/(c^2 * b) where b is impact parameter
      float deflection = mass / (dist * dist);

      // Smooth falloff - lensing effect fades to zero at larger distances
      // This prevents edge artifacts
      float maxLensRadius = 0.35; // Lensing only affects central ~70% of screen
      float falloff = 1.0 - smoothstep(rs * 2.0, maxLensRadius, dist);

      // Light ray bending - rays are displaced outward from center
      // (we sample from further out to show what's "behind" being bent around)
      vec2 dir = normalize(delta);
      float bendFactor = 1.0 + deflection * 2.0 * falloff;

      vec2 lensedUV = center + dir * dist * bendFactor;

      return lensedUV;
    }

    void main() {
      vec2 uv = v_texCoord;
      vec2 center = u_center;

      // Apply gravitational lensing
      vec2 lensedUV = gravitationalLens(uv, center, u_mass, u_schwarzschildRadius);

      // Inside event horizon
      if (lensedUV.x < 0.0) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
      }

      // Sample background at lensed coordinates
      vec4 color = vec4(0.0);

      // Only sample if within valid texture bounds (with some margin for edge effects)
      if (lensedUV.x >= -0.5 && lensedUV.x <= 1.5 && lensedUV.y >= -0.5 && lensedUV.y <= 1.5) {
        color = texture2D(u_background, lensedUV);
      }

      // Output color without any glow effects
      gl_FragColor = vec4(color.rgb, 1.0);
    }
  `;

  const createShader = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };

  const initWebGL = () => {
    gl = canvasRef.getContext('webgl', {
      alpha: true,
      premultipliedAlpha: false
    });

    if (!gl) {
      console.error('WebGL not supported');
      return false;
    }

    // Create shaders
    const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertexShader || !fragmentShader) return false;

    // Create program
    program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return false;
    }

    // Set up geometry (full-screen quad)
    const positions = new Float32Array([
      -1, -1,  1, -1,  -1, 1,
      -1, 1,   1, -1,   1, 1
    ]);

    const texCoords = new Float32Array([
      0, 1,  1, 1,  0, 0,
      0, 0,  1, 1,  1, 0
    ]);

    // Position buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    // TexCoord buffer
    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

    const texCoordLoc = gl.getAttribLocation(program, 'a_texCoord');
    gl.enableVertexAttribArray(texCoordLoc);
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);

    return true;
  };

  let backgroundTexture;
  let backgroundCanvas;
  let backgroundCtx;

  const createBackgroundTexture = () => {
    backgroundTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, backgroundTexture);

    // Set texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // Create offscreen canvas for background capture
    backgroundCanvas = document.createElement('canvas');
    backgroundCtx = backgroundCanvas.getContext('2d');
  };

  const captureBackground = () => {
    const width = canvasRef.width;
    const height = canvasRef.height;

    backgroundCanvas.width = width;
    backgroundCanvas.height = height;

    // Get the background element
    const bgElement = props.backgroundRef?.();

    if (bgElement) {
      // Use html2canvas-like approach or direct canvas drawing
      // For now, we'll draw a procedural starfield as fallback
      drawProceduralBackground(width, height);
    } else {
      drawProceduralBackground(width, height);
    }

    // Upload to texture
    gl.bindTexture(gl.TEXTURE_2D, backgroundTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, backgroundCanvas);
  };

  // Stable star positions with depth for parallax
  let stars = [];
  const initStars = (width, height) => {
    stars = [];
    const starCount = 600;
    const fieldSize = Math.max(width, height) * 1.5;

    for (let i = 0; i < starCount; i++) {
      stars.push({
        // Position relative to center for parallax
        x: (Math.random() - 0.5) * fieldSize,
        y: (Math.random() - 0.5) * fieldSize,
        // Depth layer (0.5 to 2.5) - affects parallax amount
        z: Math.random() * 2 + 0.5,
        size: Math.random() * 2 + 0.5,
        brightness: Math.random() * 0.7 + 0.3
      });
    }
  };

  const drawProceduralBackground = (width, height) => {
    // Deep space gradient
    const gradient = backgroundCtx.createRadialGradient(
      width / 2, height / 2, 0,
      width / 2, height / 2, Math.max(width, height) / 2
    );
    gradient.addColorStop(0, '#0a0a12');
    gradient.addColorStop(0.5, '#050510');
    gradient.addColorStop(1, '#000005');

    backgroundCtx.fillStyle = gradient;
    backgroundCtx.fillRect(0, 0, width, height);

    // Initialize stars if needed
    if (stars.length === 0) {
      initStars(width, height);
    }

    const cx = width / 2;
    const cy = height / 2;
    const limit = Math.max(width, height);

    // Draw stars with parallax offset
    for (const star of stars) {
      // Apply parallax based on depth (z) and camera position
      let sx = cx + star.x - camera.x * (0.3 * star.z);
      let sy = cy + star.y - camera.y * (0.3 * star.z);

      // Wrap stars that go off-screen
      if (sx < -limit / 2) sx += limit * 2;
      if (sx > width + limit / 2) sx -= limit * 2;
      if (sy < -limit / 2) sy += limit * 2;
      if (sy > height + limit / 2) sy -= limit * 2;

      backgroundCtx.beginPath();
      backgroundCtx.arc(sx, sy, star.size, 0, Math.PI * 2);
      backgroundCtx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
      backgroundCtx.fill();

      // Add glow to brighter stars
      if (star.brightness > 0.6) {
        backgroundCtx.beginPath();
        backgroundCtx.arc(sx, sy, star.size * 3, 0, Math.PI * 2);
        const glowGradient = backgroundCtx.createRadialGradient(
          sx, sy, 0,
          sx, sy, star.size * 3
        );
        glowGradient.addColorStop(0, `rgba(255, 255, 255, ${star.brightness * 0.3})`);
        glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        backgroundCtx.fillStyle = glowGradient;
        backgroundCtx.fill();
      }
    }

    // Add some nebula-like color patches (also with subtle parallax)
    const nebulaColors = [
      'rgba(100, 50, 150, 0.03)',
      'rgba(50, 100, 150, 0.02)',
      'rgba(150, 100, 50, 0.02)'
    ];

    for (let i = 0; i < 5; i++) {
      // Nebulae move slowly (far background)
      const baseX = (Math.sin(i * 1.5) * 0.3 + 0.5) * width;
      const baseY = (Math.cos(i * 1.2) * 0.3 + 0.5) * height;
      const x = baseX - camera.x * 0.05;
      const y = baseY - camera.y * 0.05;
      const radius = 200 + i * 30;

      const nebulaGradient = backgroundCtx.createRadialGradient(x, y, 0, x, y, radius);
      nebulaGradient.addColorStop(0, nebulaColors[i % nebulaColors.length]);
      nebulaGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      backgroundCtx.fillStyle = nebulaGradient;
      backgroundCtx.fillRect(0, 0, width, height);
    }
  };

  const resize = () => {
    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvasRef.width = width * dpr;
    canvasRef.height = height * dpr;
    canvasRef.style.width = width + 'px';
    canvasRef.style.height = height + 'px';

    // Store dimensions for parallax calculations
    canvasWidth = canvasRef.width;
    canvasHeight = canvasRef.height;

    gl.viewport(0, 0, canvasRef.width, canvasRef.height);

    // Reinitialize stars for new dimensions
    initStars(canvasRef.width, canvasRef.height);
  };

  let startTime = 0;
  let canvasWidth = 0;
  let canvasHeight = 0;

  const handleMouseMove = (e) => {
    mouse.x = (e.clientX / window.innerWidth) - 0.5;
    mouse.y = (e.clientY / window.innerHeight) - 0.5;
  };

  const render = () => {
    const time = (Date.now() - startTime) / 1000;

    // Smooth camera interpolation for parallax
    const parallaxStrength = canvasWidth * 0.4;
    camera.x += (mouse.x * parallaxStrength - camera.x) * 0.05;
    camera.y += (mouse.y * parallaxStrength - camera.y) * 0.05;

    // Capture/update background
    captureBackground();

    // Clear and draw
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    // Set uniforms
    const resolutionLoc = gl.getUniformLocation(program, 'u_resolution');
    gl.uniform2f(resolutionLoc, canvasRef.width, canvasRef.height);

    const centerLoc = gl.getUniformLocation(program, 'u_center');
    gl.uniform2f(centerLoc, 0.5, 0.5);

    const timeLoc = gl.getUniformLocation(program, 'u_time');
    gl.uniform1f(timeLoc, time);

    const rsLoc = gl.getUniformLocation(program, 'u_schwarzschildRadius');
    gl.uniform1f(rsLoc, props.schwarzschildRadius || 0.05);

    const massLoc = gl.getUniformLocation(program, 'u_mass');
    gl.uniform1f(massLoc, props.mass || 0.02);

    // Bind texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, backgroundTexture);
    const bgLoc = gl.getUniformLocation(program, 'u_background');
    gl.uniform1i(bgLoc, 0);

    // Draw
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    animationId = requestAnimationFrame(render);
  };

  onMount(() => {
    if (!initWebGL()) return;

    createBackgroundTexture();
    resize();

    startTime = Date.now();

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    render();
  });

  onCleanup(() => {
    if (animationId) cancelAnimationFrame(animationId);
    window.removeEventListener('resize', resize);
    window.removeEventListener('mousemove', handleMouseMove);
  });

  return (
    <canvas
      ref={canvasRef}
      class="fixed inset-0 w-full h-full"
      style={{ "z-index": props.zIndex || 0 }}
    />
  );
};
