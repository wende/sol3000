import { onMount, onCleanup, createEffect } from 'solid-js';

/**
 * BlackHole Component - Interactive gravitational lensing visualization
 * 
 * Features:
 * - Animated starfield with gravitational lensing effect
 * - Mouse interaction that moves camera perspective
 * - 3D layered black hole with bloom effects
 * - Spinning accretion disk and photon ring
 * 
 * @param {Object} props
 * @param {string} [props.class] - Additional CSS classes
 * @param {string} [props.style] - Inline styles
 */
export const BlackHole = (props) => {
  let canvasRef;
  let animationId;
  
  const bhRadius = 80;
  const mass = 8000;
  const starCount = 800;
  
  // Create a memo for canvas context and state
  let ctx;
  let width, height;
  let mouse = { x: 0, y: 0 };
  let camera = { x: 0, y: 0 };
  let stars = [];

  const initStars = () => {
    stars.length = 0;
    const fieldSize = Math.max(width, height) * 2;
    
    for(let i = 0; i < starCount; i++) {
      stars.push({
        x: (Math.random() - 0.5) * fieldSize,
        y: (Math.random() - 0.5) * fieldSize,
        z: Math.random() * 2 + 0.5,
        baseAlpha: Math.random() * 0.8 + 0.2
      });
    }
  };

  const resizeCanvas = () => {
    const canvas = canvasRef;
    if (!canvas) return;
    
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    
    initStars();
  };

  const handleMouseMove = (e) => {
    mouse.x = (e.clientX / width) - 0.5;
    mouse.y = (e.clientY / height) - 0.5;
  };

  const renderFrame = () => {
    if (!ctx) return;
    
    // Update camera position with smooth interpolation
    camera.x += (mouse.x * width * 0.5 - camera.x) * 0.05;
    camera.y += (mouse.y * height * 0.5 - camera.y) * 0.05;

    // Deep Space Background
    ctx.fillStyle = '#0B0C10';
    ctx.fillRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;

    ctx.fillStyle = '#FFFFFF';

    for (let star of stars) {
      let sx = cx + star.x - camera.x * (0.2 * star.z);
      let sy = cy + star.y - camera.y * (0.2 * star.z);

      const limit = Math.max(width, height);
      if (sx < -limit/2) sx += limit * 2;
      if (sx > width + limit/2) sx -= limit * 2;
      if (sy < -limit/2) sy += limit * 2;
      if (sy > height + limit/2) sy -= limit * 2;

      const dx = sx - cx;
      const dy = sy - cy;
      const distSq = dx*dx + dy*dy;
      const dist = Math.sqrt(distSq);

      if (dist < bhRadius) {
        continue;
      }

      const lensDist = dist + (mass / dist);
      
      const ratio = lensDist / dist;
      const lx = cx + dx * ratio;
      const ly = cy + dy * ratio;

      const size = star.z * 0.8;
      let alpha = star.baseAlpha;
      if (dist < bhRadius * 3) {
        alpha = Math.min(1, alpha * (1 + 200/dist));
      }

      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(lx, ly, size, 0, Math.PI * 2);
      ctx.fill();
    }

    animationId = requestAnimationFrame(renderFrame);
  };

  onMount(() => {
    if (!canvasRef) return;
    
    ctx = canvasRef.getContext('2d');
    resizeCanvas();
    
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    
    renderFrame();
  });

  onCleanup(() => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    window.removeEventListener('resize', resizeCanvas);
    window.removeEventListener('mousemove', handleMouseMove);
  });

  return (
    <>
      <canvas
        ref={canvasRef}
        id="star-canvas"
        class="absolute top-0 left-0 w-full h-full opacity-80 -z-10"
      />
      
      <div class={`black-hole-system ${props.class || ''}`} style={props.style} id="blackHole">
        {/* Z:1 Einstein Ring (Star Blocker) - Pushed Back */}
        <div class="einstein-ring"></div>

        {/* Z:2 BLOOM LAYER: Vertical Ring (Pushed Back) */}
        <div class="vertical-halo-blur"></div>

        {/* Z:3 SHARP VERTICAL RING (Pushed Back) */}
        <div class="vertical-ring-container">
          <div class="vertical-texture-spinner"></div>
        </div>

        {/* Z:10 BLOOM LAYER: Horizontal Disk */}
        <div class="horizontal-halo-blur"></div>

        {/* Z:15 BLOOM LAYER: Central Glow */}
        <div class="central-halo-blur"></div>

        {/* Z:19/20 Photon Ring & Event Horizon */}
        <div class="photon-ring"></div>
        <div class="event-horizon"></div>
        
        {/* Z:30 SHARP HORIZONTAL DISK (Front of disk) */}
        <div class="accretion-disk-container">
          <div class="disk-texture-spinner"></div>
          <div class="disk-texture-inner-spinner"></div>
        </div>
      </div>

      {/* SVG Filters for Noise/Grain */}
      <svg class="svg-filters">
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3" />
          </feComponentTransfer>
          <feBlend in="SourceGraphic" mode="overlay" />
        </filter>
      </svg>

      <style>{`
        /* Main Black Hole Container */
        .black-hole-system {
          position: relative;
          width: 1400px;
          height: 1200px;
          display: flex;
          justify-content: center;
          align-items: center;
          transform-style: preserve-3d;
          z-index: 10;
        }

        /*** BLOOM LAYERS (Atmospheric Glow) ***/

        /* 2. Vertical Ring Bloom - Pushed back in Z-space */
        .vertical-halo-blur {
          position: absolute;
          width: 600px; 
          height: 600px;
          border-radius: 50%;
          z-index: 1; 
          transform: translateZ(-200px);
          
          /* Event Gold */
          background: rgba(240, 165, 0, 0.5); 
          
          -webkit-mask: radial-gradient(circle, 
              transparent 95px, 
              black 110px, 
              transparent 190px
          );
          mask: radial-gradient(circle, 
              transparent 95px, 
              black 110px, 
              transparent 190px
          );
          
          filter: blur(3px) brightness(1.4);
          opacity: 1;
        }

        /* 3. Horizontal Disk Bloom */
        .horizontal-halo-blur {
          position: absolute;
          width: 1200px;
          height: 1000px;
          border-radius: 50%;
          z-index: 10; 
          transform: rotateX(82deg);
          pointer-events: none;

          background: conic-gradient(
              from 0deg,
              #F0A500 0%,    
              #CF5C15 20%,   
              #6B200C 25%,   
              #CF5C15 30%,   
              #F0A500 50%,   
              #FCEBB6 70%,   
              #FFFFF0 75%,   
              #FCEBB6 80%,   
              #F0A500 100%   
          );

          -webkit-mask: radial-gradient(farthest-side, 
              transparent 30%, 
              black 35%, 
              black 55%, 
              transparent 80%
          );
          mask: radial-gradient(farthest-side, 
              transparent 30%, 
              black 35%, 
              black 55%, 
              transparent 80%
          );
          
          filter: blur(60px) brightness(1.4);
          opacity: 0.2;
        }

        /* 4. Central Glow (NEW - stronger event horizon glow) */
        .central-halo-blur {
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          z-index: 15; 
          transform: translateZ(10px);
          
          /* Concentric radial glow centered on singularity */
          background: radial-gradient(circle, 
              rgba(240, 165, 0, 0.8) 0%,   /* Bright Event Gold */
              rgba(240, 165, 0, 0.6) 20%, 
              rgba(240, 165, 0, 0.2) 40%, 
              transparent 60%
          );
          
          filter: blur(20px) brightness(1.5);
          opacity: 1;
          animation: pulse-glow 3s ease-in-out infinite;
        }

        /*** SHARP ELEMENTS ***/

        /* The Event Horizon (The Void) */
        .event-horizon {
          position: absolute;
          width: 160px;
          height: 160px;
          background-color: #000000;
          border-radius: 50%;
          z-index: 20;
          box-shadow: 
              0 0 60px rgba(240, 165, 0, 0.4), 
              inset 0 0 10px rgba(240, 165, 0, 0.8),
              inset 0 0 60px rgba(0,0,0,1);
        }

        /* The Photon Ring */
        .photon-ring {
          position: absolute;
          width: 164px;
          height: 164px;
          border-radius: 50%;
          border: 2px solid rgba(240, 240, 240, 1);
          box-shadow: 
              -10px 0 20px rgba(255, 255, 245, 1),
              10px 0 20px rgba(107, 32, 12, 0.5),    
              inset 0 0 10px rgba(240, 165, 0, 0.5);
          filter: blur(0.2px);
          z-index: 19;
        }

        /* Einstein Ring (Star Blocker) */
        .einstein-ring {
          position: absolute;
          width: 650px; 
          height: 650px;
          border-radius: 50%;
          background-color: #000; 
          z-index: 1; 
          transform: translateZ(-600px); 
          box-shadow: 0 0 50px rgba(0,0,0,1);

          -webkit-mask: radial-gradient(farthest-side, 
              transparent 50%, 
              black 55%, 
              black 95%, 
              transparent 100%
          );
          mask: radial-gradient(farthest-side, 
              transparent 50%, 
              black 55%, 
              black 95%, 
              transparent 100%
          );
        }

        /* Vertical Ring Container */
        .vertical-ring-container {
          position: absolute;
          width: 360px;
          height: 320px; 
          border-radius: 50%;
          z-index: 3; 
          transform: translateZ(-5px);
          display: flex;
          justify-content: center;
          align-items: center;
          
          -webkit-mask: radial-gradient(circle, 
              transparent 100px, 
              black 110px, 
              black 130px, 
              transparent 135px
          );
          mask: radial-gradient(circle, 
              transparent 100px, 
              black 110px, 
              black 130px, 
              transparent 135px
          );

          filter: url(#noise) blur(5px) brightness(1.1);
          opacity: 1; 
        }

        /* Accretion Disk Container */
        .accretion-disk-container {
          position: absolute;
          width: 750px;
          height: 600px;
          border-radius: 50%;
          z-index: 30; 
          transform: rotateX(82deg); 
          pointer-events: none;
          
          display: flex;
          justify-content: center;
          align-items: center;

          background: conic-gradient(
              from 0deg,
              #F0A500 0%,
              #CF5C15 15%,
              #6B200C 25%,
              #CF5C15 35%,
              #F0A500 50%,
              #FCEBB6 65%,
              #FFFFF0 75%,
              #FCEBB6 85%,
              #F0A500 100%
          );

          -webkit-mask: radial-gradient(farthest-side, 
              transparent 30%, 
              rgba(0,0,0,0.8) 31%,
              black 42%, 
              black 55%, 
              rgba(0,0,0,0.8) 60%, rgba(0,0,0,0.8) 66%,
              rgba(0,0,0,0.6) 68%, rgba(0,0,0,0.6) 76%,
              rgba(0,0,0,0.3) 78%, rgba(0,0,0,0.3) 86%,
              transparent 90%
          );
          mask: radial-gradient(farthest-side, 
              transparent 30%, 
              rgba(0,0,0,0.8) 31%,
              black 42%, 
              black 55%, 
              rgba(0,0,0,0.8) 60%, rgba(0,0,0,0.8) 66%,
              rgba(0,0,0,0.6) 68%, rgba(0,0,0,0.6) 76%,
              rgba(0,0,0,0.3) 78%, rgba(0,0,0,0.3) 86%,
              transparent 90%
          );

          filter: url(#noise) blur(1px) contrast(1.2) brightness(1.3);
        }

        /* Spinning Textures */
        .vertical-texture-spinner {
          width: 1200px; 
          height: 1200px;
          border-radius: 0; 
          background: conic-gradient(
              from 0deg,
              #767685 0%,    
              #BEB5B6 25%,   
              #F0A500 50%,   
              #BEB5B6 75%,   
              #767685 100%
          );
          animation: spin-vertical 35s linear infinite reverse;
        }

        .disk-texture-spinner {
          width: 1200px; 
          height: 1200px;
          border-radius: 0;
          position: absolute;
          background: 
              radial-gradient(circle, transparent 25%, rgba(190, 181, 182, 0.3) 35%, rgba(240, 165, 0, 0.8) 50%, rgba(118, 118, 133, 0) 70%),
              conic-gradient(
                  from 0deg,
                  transparent 0%,
                  #767685 10%,   
                  #D5D5D7 30%,   
                  #F0A500 50%,   
                  #D5D5D7 70%,   
                  #767685 90%,   
                  transparent 100%
              );
          animation: spin-disk 20s linear infinite;
        }

        .disk-texture-inner-spinner {
          width: 1200px; 
          height: 1200px;
          border-radius: 0;
          position: absolute;
          background: conic-gradient(
              from 180deg,
              transparent,
              rgba(252, 235, 182, 0.6), 
              transparent
          );
          mix-blend-mode: overlay;
          animation: spin-disk 15s linear infinite reverse;
        }

        /* SVG Filters (Hidden) */
        .svg-filters {
          position: absolute;
          width: 0;
          height: 0;
          pointer-events: none;
        }

        /* Animations */
        @keyframes spin-disk {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes spin-vertical {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse-glow {
          from { transform: scale(1); opacity: 0.8; }
          to { transform: scale(1.1); opacity: 1.0; }
        }
      `}</style>
    </>
  );
};