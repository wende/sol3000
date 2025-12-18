import { render } from 'solid-js/web';
import { createSignal } from 'solid-js';
import './index.css';
import { GravitationalLens } from './components/common/GravitationalLens';
import { BlackHole } from './components/common/BlackHole';

function BlackHoleDemo() {
  const [mass, setMass] = createSignal(0.015);
  const [radius, setRadius] = createSignal(0.06);

  return (
    <div class="w-full h-screen bg-black overflow-hidden">
      {/* WebGL Gravitational Lensing Layer */}
      <GravitationalLens
        mass={mass()}
        schwarzschildRadius={radius()}
        zIndex={1}
      />

      {/* CSS Black Hole Visuals (accretion disk, photon ring, etc.) */}
      <div class="fixed inset-0 flex items-center justify-center pointer-events-none" style={{ "z-index": 10 }}>
        <BlackHoleVisuals />
      </div>

      {/* Controls */}
      <div class="fixed bottom-6 left-6 p-4 panel-glass rounded" style={{ "z-index": 100 }}>
        <h3 class="text-white text-sm mb-3 font-mono">Black Hole Parameters</h3>

        <div class="mb-3">
          <label class="text-gray-400 text-xs block mb-1">Mass: {mass().toFixed(3)}</label>
          <input
            type="range"
            min="0.005"
            max="0.05"
            step="0.001"
            value={mass()}
            onInput={(e) => setMass(parseFloat(e.target.value))}
            class="w-48"
          />
        </div>

        <div>
          <label class="text-gray-400 text-xs block mb-1">Event Horizon: {radius().toFixed(3)}</label>
          <input
            type="range"
            min="0.02"
            max="0.12"
            step="0.005"
            value={radius()}
            onInput={(e) => setRadius(parseFloat(e.target.value))}
            class="w-48"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Just the CSS visual elements from BlackHole (no canvas starfield)
 */
function BlackHoleVisuals() {
  return (
    <>
      <div class="black-hole-system" id="blackHole">
        {/* Z:1 BACK DISK TOP - appears above black hole due to gravitational lensing */}
        <div class="back-disk-container back-disk-top">
          <div class="back-disk-texture"></div>
        </div>

        {/* Z:1 BACK DISK BOTTOM - appears below black hole due to gravitational lensing */}
        <div class="back-disk-container back-disk-bottom">
          <div class="back-disk-texture"></div>
        </div>

        {/* Z:5 Back disk glow/bloom */}
        <div class="back-disk-glow back-disk-glow-top"></div>
        <div class="back-disk-glow back-disk-glow-bottom"></div>

        {/* Z:10 BLOOM LAYER: Horizontal Disk */}
        <div class="horizontal-halo-blur"></div>

        {/* Z:15 BLOOM LAYER: Central Glow */}
        <div class="central-halo-blur"></div>

        {/* Z:18 Photon Ring glow */}
        <div class="photon-ring-glow"></div>

        {/* Z:19/20 Photon Ring & Event Horizon */}
        <div class="photon-ring"></div>
        <div class="event-horizon"></div>

        {/* Z:30 SHARP HORIZONTAL DISK (Front of disk) */}
        <div class="accretion-disk-container">
          <div class="disk-texture-spinner"></div>
          <div class="disk-texture-inner-spinner"></div>
        </div>

        {/* Z:35 Front disk inner edge highlight */}
        <div class="front-disk-inner-glow"></div>
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

        /*** BACK DISK - The gravitationally lensed back portion ***/
        /* Thin glowing arcs above and below the black hole */

        .back-disk-container {
          position: absolute;
          width: 550px;
          height: 550px;
          z-index: 1;
          top: 50%;
          left: 50%;
          pointer-events: none;
          border-radius: 50%;
          /* Warm glowing gradient */
          background: conic-gradient(
              from 270deg,
              #442211 0%,
              #774422 15%,
              #AA6633 32%,
              #DD9966 45%,
              #FFEEDD 50%,
              #DD9966 55%,
              #AA6633 68%,
              #774422 85%,
              #442211 100%
          );
          filter: blur(12px) brightness(1.5);
          opacity: 1;
        }

        /* TOP back disk - arc above the black hole (LARGER) */
        /* Using clip-path + single mask to avoid mask-composite edge artifacts */
        .back-disk-top {
          width: 650px;
          height: 650px;
          transform: translate(-50%, -50%) translateY(-5px);
          /* Clip to top half only */
          clip-path: ellipse(100% 55% at 50% 0%);
          /* Single ring mask without composite */
          -webkit-mask: radial-gradient(ellipse 50% 38% at 50% 50%,
              transparent 48%,
              rgba(0,0,0,0.1) 52%,
              rgba(0,0,0,0.3) 56%,
              rgba(0,0,0,0.6) 60%,
              rgba(0,0,0,0.9) 64%,
              black 68%,
              rgba(0,0,0,0.9) 72%,
              rgba(0,0,0,0.6) 76%,
              rgba(0,0,0,0.3) 80%,
              rgba(0,0,0,0.1) 84%,
              transparent 88%
          );
          mask: radial-gradient(ellipse 50% 38% at 50% 50%,
              transparent 48%,
              rgba(0,0,0,0.1) 52%,
              rgba(0,0,0,0.3) 56%,
              rgba(0,0,0,0.6) 60%,
              rgba(0,0,0,0.9) 64%,
              black 68%,
              rgba(0,0,0,0.9) 72%,
              rgba(0,0,0,0.6) 76%,
              rgba(0,0,0,0.3) 80%,
              rgba(0,0,0,0.1) 84%,
              transparent 88%
          );
        }

        /* BOTTOM back disk - arc below the black hole (SMALLER) */
        .back-disk-bottom {
          width: 450px;
          height: 450px;
          transform: translate(-50%, -50%) translateY(5px);
          /* Composite mask: ring shape + bottom-only fade */
          -webkit-mask:
              radial-gradient(ellipse 50% 38% at 50% 50%,
                  transparent 48%,
                  rgba(0,0,0,0.1) 52%,
                  rgba(0,0,0,0.3) 56%,
                  rgba(0,0,0,0.6) 60%,
                  rgba(0,0,0,0.9) 64%,
                  black 68%,
                  rgba(0,0,0,0.9) 72%,
                  rgba(0,0,0,0.6) 76%,
                  rgba(0,0,0,0.3) 80%,
                  rgba(0,0,0,0.1) 84%,
                  transparent 88%
              ),
              radial-gradient(ellipse 100% 50% at 50% 100%,
                  black 0%,
                  rgba(0,0,0,0.9) 45%,
                  rgba(0,0,0,0.5) 65%,
                  rgba(0,0,0,0.2) 80%,
                  transparent 100%
              );
          -webkit-mask-composite: source-in;
          mask:
              radial-gradient(ellipse 50% 38% at 50% 50%,
                  transparent 48%,
                  rgba(0,0,0,0.1) 52%,
                  rgba(0,0,0,0.3) 56%,
                  rgba(0,0,0,0.6) 60%,
                  rgba(0,0,0,0.9) 64%,
                  black 68%,
                  rgba(0,0,0,0.9) 72%,
                  rgba(0,0,0,0.6) 76%,
                  rgba(0,0,0,0.3) 80%,
                  rgba(0,0,0,0.1) 84%,
                  transparent 88%
              ),
              radial-gradient(ellipse 100% 50% at 50% 100%,
                  black 0%,
                  rgba(0,0,0,0.9) 45%,
                  rgba(0,0,0,0.5) 65%,
                  rgba(0,0,0,0.2) 80%,
                  transparent 100%
              );
          mask-composite: intersect;
        }

        /* Inner brighter core of the arc - hidden to test outline */
        .back-disk-texture {
          display: none;
        }

        /* Back disk glow - hidden */
        .back-disk-glow {
          display: none;
        }

        /*** BLOOM LAYERS (Atmospheric Glow) ***/

        /* Horizontal Disk Bloom - warm white glowing halo */
        .horizontal-halo-blur {
          position: absolute;
          width: 1100px;
          height: 900px;
          border-radius: 50%;
          z-index: 10;
          transform: rotateX(80deg);
          pointer-events: none;

          background: conic-gradient(
              from 0deg,
              #CC6633 0%,
              #994422 15%,
              #553311 25%,
              #994422 35%,
              #DD7744 50%,
              #EEAA77 65%,
              #FFDDBB 75%,
              #EEAA77 85%,
              #CC6633 100%
          );

          -webkit-mask: radial-gradient(farthest-side,
              transparent 25%,
              black 32%,
              black 55%,
              transparent 80%
          );
          mask: radial-gradient(farthest-side,
              transparent 25%,
              black 32%,
              black 55%,
              transparent 80%
          );

          filter: blur(50px) brightness(2.0);
          opacity: 0.7;
        }

        /* Central Glow around event horizon - removed */
        .central-halo-blur {
          display: none;
        }

        /*** PHOTON RING AND EVENT HORIZON ***/

        /* Photon ring outer glow - removed */
        .photon-ring-glow {
          display: none;
        }

        /* The Photon Ring - thin edge */
        .photon-ring {
          position: absolute;
          width: 175px;
          height: 175px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: none;
          z-index: 19;
        }

        /* The Event Horizon (The Void) */
        .event-horizon {
          position: absolute;
          width: 170px;
          height: 170px;
          background: radial-gradient(circle,
              #000000 0%,
              #000000 85%,
              #0a0a0a 100%
          );
          border-radius: 50%;
          z-index: 20;
          box-shadow:
              0 0 80px rgba(0, 0, 0, 0.9),
              inset 0 0 30px rgba(0, 0, 0, 1);
        }

        /*** FRONT ACCRETION DISK ***/

        /* Main accretion disk */
        .accretion-disk-container {
          position: absolute;
          width: 700px;
          height: 550px;
          border-radius: 50%;
          z-index: 30;
          transform: rotateX(80deg);
          pointer-events: none;

          display: flex;
          justify-content: center;
          align-items: center;

          /* Warm glowing gradient with doppler effect */
          background: conic-gradient(
              from 0deg,
              #BB5522 0%,
              #884411 10%,
              #553311 20%,
              #884411 30%,
              #CC7744 45%,
              #DDAA77 55%,
              #EECCAA 65%,
              #FFFFEE 72%,
              #EECCAA 80%,
              #DDAA77 88%,
              #BB5522 100%
          );

          /* Multiple rings effect */
          -webkit-mask: radial-gradient(farthest-side,
              transparent 32%,
              rgba(0,0,0,0.9) 34%,
              black 38%,
              black 48%,
              rgba(0,0,0,0.7) 52%,
              rgba(0,0,0,0.5) 58%,
              rgba(0,0,0,0.7) 62%,
              rgba(0,0,0,0.4) 70%,
              rgba(0,0,0,0.2) 80%,
              transparent 88%
          );
          mask: radial-gradient(farthest-side,
              transparent 32%,
              rgba(0,0,0,0.9) 34%,
              black 38%,
              black 48%,
              rgba(0,0,0,0.7) 52%,
              rgba(0,0,0,0.5) 58%,
              rgba(0,0,0,0.7) 62%,
              rgba(0,0,0,0.4) 70%,
              rgba(0,0,0,0.2) 80%,
              transparent 88%
          );

          filter: url(#noise) contrast(1.1) brightness(1.6);
        }

        /* Spinning texture overlay */
        .disk-texture-spinner {
          width: 1000px;
          height: 1000px;
          border-radius: 0;
          position: absolute;
          background:
              radial-gradient(circle,
                transparent 20%,
                rgba(255, 180, 100, 0.2) 35%,
                rgba(255, 140, 60, 0.4) 45%,
                transparent 65%
              ),
              conic-gradient(
                  from 0deg,
                  transparent 0%,
                  rgba(90, 50, 30, 0.5) 10%,
                  rgba(180, 120, 80, 0.4) 25%,
                  rgba(255, 200, 150, 0.6) 45%,
                  rgba(180, 120, 80, 0.4) 65%,
                  rgba(90, 50, 30, 0.5) 80%,
                  transparent 100%
              );
          animation: spin-disk 18s linear infinite;
          mix-blend-mode: overlay;
        }

        .disk-texture-inner-spinner {
          width: 1000px;
          height: 1000px;
          border-radius: 0;
          position: absolute;
          background: conic-gradient(
              from 90deg,
              transparent 0%,
              rgba(255, 240, 220, 0.5) 20%,
              transparent 40%,
              rgba(255, 240, 220, 0.3) 60%,
              transparent 80%,
              rgba(255, 240, 220, 0.4) 100%
          );
          mix-blend-mode: overlay;
          animation: spin-disk 12s linear infinite reverse;
        }

        /* Inner glow where disk meets photon sphere */
        .front-disk-inner-glow {
          position: absolute;
          width: 250px;
          height: 100px;
          z-index: 35;
          top: 50%;
          left: 50%;
          transform: translate(-50%, 20px) rotateX(80deg);
          background: radial-gradient(ellipse 100% 100% at 50% 0%,
              rgba(255, 220, 180, 0.8) 0%,
              rgba(255, 180, 100, 0.4) 40%,
              transparent 70%
          );
          filter: blur(8px);
          pointer-events: none;
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

        /* Panel glass style */
        .panel-glass {
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* Range slider styling */
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          background: rgba(255, 255, 255, 0.1);
          height: 4px;
          border-radius: 2px;
          cursor: pointer;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 12px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 50%;
          cursor: pointer;
        }

        input[type="range"]::-moz-range-thumb {
          width: 12px;
          height: 12px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </>
  );
}

const root = document.getElementById('root');
render(() => <BlackHoleDemo />, root);
