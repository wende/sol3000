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
        {/* Z:1 BACK DISK - appears above black hole due to gravitational lensing */}
        <div class="back-disk-container">
          <div class="back-disk-texture"></div>
        </div>

        {/* Z:5 Back disk glow/bloom */}
        <div class="back-disk-glow"></div>

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

        /* Back disk appears ABOVE the black hole - light bent over the top */
        /* This is the backside of the accretion disk visible due to gravitational lensing */
        .back-disk-container {
          position: absolute;
          width: 380px;
          height: 380px;
          border-radius: 50%;
          z-index: 1;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) translateY(-15px);
          overflow: hidden;

          /* Ring shape with inner cutout - thinner arc */
          background: conic-gradient(
              from 180deg,
              #3D0E00 0%,
              #6B1F00 8%,
              #A84000 18%,
              #E07020 30%,
              #FFB070 42%,
              #FFF5E8 50%,
              #FFB070 58%,
              #E07020 70%,
              #A84000 82%,
              #6B1F00 92%,
              #3D0E00 100%
          );

          /* Composite mask: ring shape + top arc with soft edges */
          -webkit-mask:
              radial-gradient(circle,
                  transparent 88px,
                  rgba(0,0,0,0.3) 92px,
                  black 100px,
                  black 135px,
                  rgba(0,0,0,0.3) 145px,
                  transparent 155px
              ),
              linear-gradient(to bottom,
                  black 0%,
                  black 32%,
                  rgba(0,0,0,0.4) 40%,
                  transparent 48%
              );
          -webkit-mask-composite: source-in;
          mask:
              radial-gradient(circle,
                  transparent 88px,
                  rgba(0,0,0,0.3) 92px,
                  black 100px,
                  black 135px,
                  rgba(0,0,0,0.3) 145px,
                  transparent 155px
              ),
              linear-gradient(to bottom,
                  black 0%,
                  black 32%,
                  rgba(0,0,0,0.4) 40%,
                  transparent 48%
              );
          mask-composite: intersect;

          filter: brightness(0.85) contrast(1.1);
        }

        .back-disk-texture {
          width: 500px;
          height: 500px;
          position: absolute;
          background: conic-gradient(
              from 0deg,
              transparent 0%,
              rgba(255, 220, 180, 0.3) 20%,
              rgba(255, 255, 250, 0.4) 30%,
              rgba(255, 220, 180, 0.3) 40%,
              transparent 50%,
              rgba(80, 40, 20, 0.3) 70%,
              rgba(40, 20, 10, 0.3) 80%,
              transparent 100%
          );
          animation: spin-disk 20s linear infinite reverse;
          mix-blend-mode: soft-light;
        }

        /* Back disk glow */
        .back-disk-glow {
          position: absolute;
          width: 420px;
          height: 150px;
          z-index: 2;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -120px);
          background: radial-gradient(ellipse 100% 100% at 50% 100%,
              rgba(255, 100, 30, 0.4) 0%,
              rgba(200, 60, 10, 0.2) 60%,
              transparent 90%
          );
          filter: blur(20px);
          pointer-events: none;
        }

        /*** BLOOM LAYERS (Atmospheric Glow) ***/

        /* Horizontal Disk Bloom */
        .horizontal-halo-blur {
          position: absolute;
          width: 1000px;
          height: 800px;
          border-radius: 50%;
          z-index: 10;
          transform: rotateX(80deg);
          pointer-events: none;

          background: conic-gradient(
              from 0deg,
              #D4600A 0%,
              #8B2500 15%,
              #4A1000 25%,
              #8B2500 35%,
              #D4600A 50%,
              #FF8C42 65%,
              #FFD4A3 75%,
              #FF8C42 85%,
              #D4600A 100%
          );

          -webkit-mask: radial-gradient(farthest-side,
              transparent 28%,
              black 35%,
              black 50%,
              transparent 75%
          );
          mask: radial-gradient(farthest-side,
              transparent 28%,
              black 35%,
              black 50%,
              transparent 75%
          );

          filter: blur(40px) brightness(1.2);
          opacity: 0.35;
        }

        /* Central Glow around event horizon */
        .central-halo-blur {
          position: absolute;
          width: 280px;
          height: 280px;
          border-radius: 50%;
          z-index: 15;

          background: radial-gradient(circle,
              rgba(255, 150, 50, 0.9) 0%,
              rgba(255, 120, 30, 0.6) 30%,
              rgba(200, 80, 20, 0.3) 50%,
              transparent 70%
          );

          filter: blur(15px) brightness(1.3);
          opacity: 1;
        }

        /*** PHOTON RING AND EVENT HORIZON ***/

        /* Photon ring outer glow */
        .photon-ring-glow {
          position: absolute;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          z-index: 18;
          background: radial-gradient(circle,
              transparent 70%,
              rgba(255, 200, 150, 0.8) 80%,
              rgba(255, 150, 80, 0.6) 90%,
              transparent 100%
          );
          filter: blur(3px);
        }

        /* The Photon Ring - sharp bright ring */
        .photon-ring {
          position: absolute;
          width: 175px;
          height: 175px;
          border-radius: 50%;
          border: 2.5px solid rgba(255, 250, 240, 1);
          box-shadow:
              0 0 20px rgba(255, 200, 100, 1),
              0 0 40px rgba(255, 150, 50, 0.8),
              inset 0 0 15px rgba(255, 200, 150, 0.6);
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

          /* Rich orange-red gradient with doppler effect */
          background: conic-gradient(
              from 0deg,
              #D4600A 0%,
              #8B2500 10%,
              #5C1500 20%,
              #8B2500 30%,
              #D4600A 45%,
              #FF8C42 55%,
              #FFD4A3 65%,
              #FFFAF0 72%,
              #FFD4A3 80%,
              #FF8C42 88%,
              #D4600A 100%
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

          filter: url(#noise) contrast(1.1) brightness(1.2);
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
          width: 14px;
          height: 14px;
          background: #F0A500;
          border-radius: 50%;
          cursor: pointer;
        }

        input[type="range"]::-moz-range-thumb {
          width: 14px;
          height: 14px;
          background: #F0A500;
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
