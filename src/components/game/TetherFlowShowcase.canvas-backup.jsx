import { onCleanup, onMount } from 'solid-js';
import { GlassPanel } from '../common/GlassPanel';

/**
 * BACKUP: Canvas-based particle flow animation for FTL Tethers.
 * This was the original implementation before switching to CSS dash animation.
 * Kept for reference and potential future use.
 *
 * Performance: 60fps, hardware-accelerated canvas rendering
 * Visual: Dual-lane particle stream with fade in/out at endpoints
 */
export const TetherFlowShowcase = () => {
  let canvasRef;

  // Tether coordinates
  const start = { x: 50, y: 100 };
  const end = { x: 550, y: 100 };

  onMount(() => {
    const canvas = canvasRef;
    const ctx = canvas.getContext('2d');

    // Handle High DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Particle System State
    const particleCount = 40; // 40 particles for smooth stream
    const particles = [];

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle());
    }

    function createParticle(reset = false) {
      // Speed: 4-6s duration to cross 500px -> ~80-120px/s
      // Frame time ~16ms. 120 * 0.016 = ~2px per frame.
      // t is 0-1. 2px / 500px = 0.004 per frame.
      const speed = 0.002 + Math.random() * 0.002;

      return {
        t: reset ? 0 : Math.random(), // Start at random position or 0 if respawning
        speed: speed,
        size: 2 + Math.random() * 2,
        // Dual lane: +/- 6 to 10px
        offset: (Math.random() > 0.5 ? 1 : -1) * (6 + Math.random() * 4),
        opacity: 0.4 + Math.random() * 0.4,
        flickerOffset: Math.random() * 100 // For opacity variance
      };
    }

    let animationFrameId;

    const animate = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Calculate current vector for the tether
      const dx = end.x - start.x;
      const dy = end.y - start.y;

      particles.forEach(p => {
        // Update position
        p.t += p.speed;

        // Reset if reached end
        if (p.t > 1) {
          Object.assign(p, createParticle(true));
        }

        // Calculate current position
        const x = start.x + dx * p.t;
        const y = start.y + dy * p.t + p.offset;

        // Fade in/out at ends
        let alpha = p.opacity;
        if (p.t < 0.1) alpha *= p.t * 10;
        if (p.t > 0.9) alpha *= (1 - p.t) * 10;

        // Subtle flicker (optional, currently disabled)
        // alpha *= 0.8 + 0.2 * Math.sin(Date.now() * 0.01 + p.flickerOffset);

        // Draw particle
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;

        // Crisp square pixels
        ctx.fillRect(Math.floor(x), Math.floor(y), p.size, p.size);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    onCleanup(() => {
      cancelAnimationFrame(animationFrameId);
    });
  });

  return (
    <GlassPanel class="p-8 max-w-4xl mx-auto my-10">
      <h2 class="text-xl font-light tracking-widest text-white mb-6 pb-4">
        TETHER FLOW ANIMATION (CANVAS VERSION)
      </h2>

      <div class="relative h-48 bg-[#0a0a0a] rounded overflow-hidden">
        {/* SVG Layer: Static Elements (Systems & Tether Line) */}
        <svg width="100%" height="100%" class="absolute inset-0 z-0">
          <defs>
            <filter id="glow-static" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Base Tether Line (Connected State) */}
          <path
            d={`M${start.x},${start.y} L${end.x},${end.y}`}
            stroke="rgba(255, 255, 255, 0.6)"
            stroke-width="2"
            fill="none"
          />

          {/* Source System */}
          <g transform={`translate(${start.x}, ${start.y})`}>
            <circle r="6" fill="#000" stroke="white" stroke-width="1" stroke-opacity="0.5" />
            <circle r="2" fill="white" />
          </g>

          {/* Target System */}
          <g transform={`translate(${end.x}, ${end.y})`}>
            <circle r="6" fill="#000" stroke="white" stroke-width="1" stroke-opacity="0.5" />
            <circle r="2" fill="white" />
          </g>
        </svg>

        {/* Canvas Layer: Dynamic Particle System */}
        <canvas
          ref={canvasRef}
          class="absolute inset-0 z-10 w-full h-full pointer-events-none"
        />

        {/* Overlay Text */}
        <div class="absolute bottom-4 left-4 text-[10px] text-gray-500 font-mono tracking-[0.3em] uppercase z-20">
          Tether_Link_Status: Active // Data_Stream_Throughput: High
        </div>
      </div>

      <div class="mt-4 grid grid-cols-3 gap-4 text-[10px] text-gray-500 font-mono">
        <div>TYPE: CANVAS_PARTICLE_SYSTEM</div>
        <div>RENDER: 60FPS_RAF_LOOP</div>
        <div>COUNT: 40_ENTITIES</div>
      </div>

      <div class="mt-4 p-4 bg-white/5 rounded text-xs text-gray-400 leading-relaxed">
        <strong class="text-white">Note:</strong> This is the canvas-based particle implementation.
        The current game uses CSS dash animation for better compatibility and simpler implementation.
        This canvas version is kept as a reference for future enhancements.
      </div>
    </GlassPanel>
  );
};
