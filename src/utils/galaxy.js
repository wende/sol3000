export const COLORS = {
  bgBlack: '#000000',
  textWhite: '#ffffff',
  textGray: '#737373',
  glassWhite5: 'rgba(255, 255, 255, 0.05)',
  borderWhite10: 'rgba(255, 255, 255, 0.10)',
  starPrimary: '#ffffff',
  starSecondary: 'rgba(255, 255, 255, 0.8)',
  starTertiary: 'rgba(255, 255, 255, 0.6)',
};

/**
 * Spectral classification for stars based on real stellar physics.
 * Distribution adjusted for gameplay (real distribution would be ~76% M-class).
 *
 * Based on research: Stars follow the Kepler Dichotomy - systems are either
 * "dynamically cold" (multiple planets, circular orbits) or "dynamically hot"
 * (few planets, eccentric orbits from planet-planet scattering).
 *
 * @type {Record<string, {
 *   hue: [number, number],
 *   saturation: [number, number],
 *   lightness: [number, number],
 *   size: [number, number],
 *   weight: number,
 *   prefix: string,
 *   planetRange: [number, number],
 *   eccentricity: 'low' | 'medium' | 'high',
 *   architecture: 'ordered' | 'mixed' | 'compact',
 *   label: string,
 *   temperature: string,
 *   description: string
 * }>}
 */
export const SPECTRAL_CLASSES = {
  O: {
    hue: [220, 240],      // Deep blue - hottest
    saturation: [20, 35],
    lightness: [85, 95],
    size: [10, 14],       // Largest stars
    weight: 0.01,         // Extremely rare
    prefix: 'Rigel',
    planetRange: [1, 3],  // Few planets - often ejected by violence
    eccentricity: 'high',
    architecture: 'mixed',
    label: 'Blue Giant',
    temperature: '30,000K+',
    description: 'Massive, luminous blue giants. Short-lived and violent.'
  },
  B: {
    hue: [200, 225],      // Blue-white
    saturation: [18, 30],
    lightness: [88, 96],
    size: [9, 12],
    weight: 0.03,
    prefix: 'Spica',
    planetRange: [1, 4],
    eccentricity: 'high',
    architecture: 'mixed',
    label: 'Blue-White',
    temperature: '10,000-30,000K',
    description: 'Hot blue-white stars with chaotic planetary systems.'
  },
  A: {
    hue: [190, 210],      // White with blue tint
    saturation: [12, 22],
    lightness: [90, 97],
    size: [7, 10],
    weight: 0.06,
    prefix: 'Vega',
    planetRange: [2, 5],
    eccentricity: 'medium',
    architecture: 'mixed',
    label: 'White',
    temperature: '7,500-10,000K',
    description: 'Bright white stars. Debris disks common.'
  },
  F: {
    hue: [45, 60],        // Yellow-white
    saturation: [15, 28],
    lightness: [88, 95],
    size: [6, 9],
    weight: 0.12,
    prefix: 'Procyon',
    planetRange: [3, 6],
    eccentricity: 'medium',
    architecture: 'ordered',
    label: 'Yellow-White',
    temperature: '6,000-7,500K',
    description: 'Stable yellow-white stars with orderly systems.'
  },
  G: {
    hue: [38, 52],        // Yellow (Sol-like)
    saturation: [20, 35],
    lightness: [85, 93],
    size: [5, 8],
    weight: 0.18,         // Sol-like - dynamically cold
    prefix: 'Sol',
    planetRange: [5, 8],  // Multi-planet systems
    eccentricity: 'low',
    architecture: 'ordered',
    label: 'Yellow Dwarf',
    temperature: '5,200-6,000K',
    description: 'Sol-like stars. Dynamically cold with stable orbits.'
  },
  K: {
    hue: [22, 38],        // Orange
    saturation: [22, 38],
    lightness: [82, 92],
    size: [4, 7],
    weight: 0.25,
    prefix: 'Epsilon',
    planetRange: [3, 6],
    eccentricity: 'low',
    architecture: 'ordered',
    label: 'Orange Dwarf',
    temperature: '3,700-5,200K',
    description: 'Long-lived orange dwarfs. Excellent for habitability.'
  },
  M: {
    hue: [0, 22],         // Red-orange (most common)
    saturation: [25, 40],
    lightness: [78, 90],
    size: [3, 6],
    weight: 0.35,         // Red dwarfs - most common
    prefix: 'Proxima',
    planetRange: [2, 4],  // Compact systems
    eccentricity: 'medium',
    architecture: 'compact',
    label: 'Red Dwarf',
    temperature: '2,400-3,700K',
    description: 'Cool red dwarfs. Compact planetary systems.'
  }
};

/**
 * Select a spectral class based on weighted distribution.
 * @returns {string} Spectral class letter (O, B, A, F, G, K, M)
 */
function selectSpectralClass() {
  const roll = Math.random();
  let cumulative = 0;
  for (const [cls, data] of Object.entries(SPECTRAL_CLASSES)) {
    cumulative += data.weight;
    if (roll < cumulative) return cls;
  }
  return 'M'; // Fallback to most common
}

/**
 * Generates a star color based on its spectral class.
 * Uses HSL with faint saturation to maintain the black-and-white aesthetic.
 * @param {string} spectralClass - The star's spectral classification
 * @param {number} brightness - Brightness factor (0.6 to 1.0)
 * @returns {string} HSL color string
 */
function generateStarColor(spectralClass, brightness = 1) {
  const cls = SPECTRAL_CLASSES[spectralClass];
  const hue = cls.hue[0] + Math.random() * (cls.hue[1] - cls.hue[0]);
  const saturation = cls.saturation[0] + Math.random() * (cls.saturation[1] - cls.saturation[0]);
  const lightness = cls.lightness[0] + (brightness - 0.6) * (cls.lightness[1] - cls.lightness[0]) / 0.4;
  return `hsl(${Math.floor(hue)}, ${Math.floor(saturation)}%, ${Math.floor(lightness)}%)`;
}

/**
 * Generate a system name based on spectral class.
 * @param {string} spectralClass - The star's spectral classification
 * @param {number} id - System ID for uniqueness
 * @returns {string} System name
 */
function generateSystemName(spectralClass, id) {
  const cls = SPECTRAL_CLASSES[spectralClass];
  const suffix = Math.floor(Math.random() * 999) + 1;
  return `${cls.prefix} ${spectralClass}-${suffix}`;
}

/**
 * Generate system description based on dynamical properties.
 * Based on the Kepler Dichotomy research.
 */
function generateDescription(spectralClass, planetCount, eccentricity) {
  const cls = SPECTRAL_CLASSES[spectralClass];

  if (eccentricity === 'low' && planetCount >= 5) {
    return "A dynamically cold system with stable, circular orbits. Multiple planets orbit in harmony.";
  } else if (eccentricity === 'high' && planetCount <= 2) {
    return "Scars of gravitational violence. Eccentric orbits hint at ejected planetary siblings.";
  } else if (cls.architecture === 'compact') {
    return "A compact system around a red dwarf. Planets huddle close for warmth.";
  } else if (cls.architecture === 'mixed') {
    return "A chaotic system with mixed orbital architectures. Possible Hot Jupiter migration.";
  }
  return "A stable system orbiting the galactic core at a safe distance.";
}

/**
 * Generate planets for a system based on its properties.
 * @param {number} count - Number of planets
 * @param {string} spectralClass - Star's spectral class
 * @param {string} eccentricity - 'low', 'medium', 'high'
 * @returns {Array} Array of planet objects
 */
function generatePlanets(count, spectralClass, eccentricity) {
  const planets = [];
  const baseDistance = 60; // Minimum distance from star (visual units)
  const spacing = 40; // Spacing between orbits
  
  for (let i = 0; i < count; i++) {
    // Determine distance with some randomness based on architecture
    const distance = baseDistance + (i * spacing) + (Math.random() * 20 - 10);
    
    // Determine planet type based on distance and random chance
    let type = 'Rocky';
    let sizeRange = [2, 5];
    let colorRange = [[0, 40], [20, 40], [40, 60]]; // Brown/Red/Grey hues
    
    // Simple logic: Inner planets rocky, outer planets gas/ice giants
    if (i > 2 && Math.random() > 0.3) {
      type = 'Gas Giant';
      sizeRange = [8, 14];
      colorRange = [[200, 240], [20, 60], [60, 80]]; // Blue/White hues
    } else if (i > 4) {
      type = 'Ice Giant';
      sizeRange = [6, 10];
      colorRange = [[180, 220], [30, 50], [70, 90]]; // Cyan/Light Blue
    }

    const radius = sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]);
    
    // Color generation
    const hue = colorRange[0][0] + Math.random() * (colorRange[0][1] - colorRange[0][0]);
    const sat = colorRange[1][0] + Math.random() * (colorRange[1][1] - colorRange[1][0]);
    const lit = colorRange[2][0] + Math.random() * (colorRange[2][1] - colorRange[2][0]);
    const color = `hsl(${Math.floor(hue)}, ${Math.floor(sat)}%, ${Math.floor(lit)}%)`;

    // Orbit properties
    // Keplerian-ish speed: slower further out
    const speed = (0.002 / Math.sqrt(i + 1)) * (Math.random() * 0.4 + 0.8); 
    const angle = Math.random() * Math.PI * 2;
    
    // Eccentricity effect on orbit shape (visual only)
    let orbitEccentricity = 0;
    if (eccentricity === 'high') orbitEccentricity = 0.2 + Math.random() * 0.3;
    else if (eccentricity === 'medium') orbitEccentricity = 0.1 + Math.random() * 0.1;
    else orbitEccentricity = Math.random() * 0.05;

    planets.push({
      id: `p-${i}`,
      distance,
      radius,
      angle,
      speed,
      color,
      type,
      orbitEccentricity,
      orbitRotation: Math.random() * Math.PI * 2 // Rotate the ellipse
    });
  }
  return planets;
}

// Expanded map dimensions
export const MAP_WIDTH = 2500;
export const MAP_HEIGHT = 2500;
export const CENTER_X = MAP_WIDTH / 2;
export const CENTER_Y = MAP_HEIGHT / 2;

// Market generation constants
export const METALS_MARKET_CHANCE = 0.55; // chance a system has any Metals market role
export const METALS_SUPPLY_CHANCE = 0.5; // when present, chance it's supply vs demand
export const METALS_SUPPLY_RANGE = [200, 1200];
export const METALS_DEMAND_RANGE = [200, 1200];

function randomIntInclusive(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

function generateMetalsMarket(resources) {
  if (Math.random() > METALS_MARKET_CHANCE) return null;

  // Slight bias: rich systems more likely to be suppliers.
  const bias =
    resources === 'Rich' ? 0.12 :
    resources === 'Poor' ? -0.12 :
    0;

  const isSupply = Math.random() < Math.min(1, Math.max(0, METALS_SUPPLY_CHANCE + bias));

  if (isSupply) {
    const [min, max] = METALS_SUPPLY_RANGE;
    return { metals: { supply: randomIntInclusive(min, max), demand: 0 } };
  }

  const [min, max] = METALS_DEMAND_RANGE;
  return { metals: { supply: 0, demand: randomIntInclusive(min, max) } };
}

/**
 * Generates the galaxy data with systems and routes.
 * Systems are generated with realistic spectral classifications and
 * dynamical properties based on the Kepler Dichotomy research.
 *
 * @returns {{
 *   systems: Array<{
 *     id: number,
 *     name: string,
 *     x: number,
 *     y: number,
 *     size: number,
 *     color: string,
 *     spectralClass: string,
 *     planetCount: number,
 *     planets: Array,
 *     eccentricity: string,
 *     architecture: string,
 *     population: string,
 *     resources: string,
 *     owner: string,
 *     description: string
 *   }>,
 *   routes: Array<{
 *     source: any,
 *     target: any,
 *     id: string
 *   }>
 * }}
 */
export function generateGalaxy() {
  const systems = [];
  const numSystems = 120; // Total stars

  // Radial layout configuration
  const minRadius = 400; // Exclusion zone for Black Hole
  const maxRadius = 1100; // Outer edge

  let idCounter = 0;

  for (let i = 0; i < numSystems; i++) {
    // Distribute systems along spiral arms or random disk
    // Using a "Donut" distribution with some clustering
    const dist = Math.sqrt(Math.random()) * (maxRadius - minRadius) + minRadius;
    const angle = Math.random() * Math.PI * 2;

    const x = CENTER_X + Math.cos(angle) * dist;
    const y = CENTER_Y + Math.sin(angle) * dist;

    // Reject overlaps (simple distance check against existing)
    const tooClose = systems.some(s => Math.hypot(s.x - x, s.y - y) < 40);
    if (tooClose) continue;

    // Determine spectral class based on weighted distribution
    const spectralClass = selectSpectralClass();
    const cls = SPECTRAL_CLASSES[spectralClass];

    // Size based on spectral class (larger stars = hotter classes)
    const sizeRange = cls.size;
    const radius = sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]);

    // Planet count based on spectral class and Kepler Dichotomy
    const planetRange = cls.planetRange;
    const planetCount = Math.floor(planetRange[0] + Math.random() * (planetRange[1] - planetRange[0] + 1));

    // Brightness based on size within class range
    const brightness = 0.6 + ((radius - sizeRange[0]) / (sizeRange[1] - sizeRange[0])) * 0.4;

    const planets = generatePlanets(planetCount, spectralClass, cls.eccentricity);
    const resources = Math.random() > 0.7 ? 'Rich' : Math.random() > 0.3 ? 'Normal' : 'Poor';
    const owner = Math.random() > 0.9 ? 'Enemy' : 'Unclaimed';

    systems.push({
      id: idCounter++,
      name: generateSystemName(spectralClass, idCounter),
      x: x,
      y: y,
      size: Math.round(radius),
      color: generateStarColor(spectralClass, brightness),
      spectralClass,
      planetCount,
      planets,
      eccentricity: cls.eccentricity,
      architecture: cls.architecture,
      population: (Math.floor(Math.random() * 100) / 10).toFixed(1) + 'M',
      resources,
      owner,
      market: generateMetalsMarket(resources),
      description: generateDescription(spectralClass, planetCount, cls.eccentricity)
    });
  }

  // Generate routes (Nearest Neighbors)
  const routes = [];
  const connections = new Set();

  systems.forEach((sys, i) => {
    // Connect to 2-3 nearest neighbors
    const others = systems
      .map((s, idx) => ({ idx, dist: Math.hypot(s.x - sys.x, s.y - sys.y) }))
      .filter(d => d.idx !== i)
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 3);

    others.forEach(other => {
      // Connect if within reasonable range (don't cross the black hole unnecessarily)
      if (other.dist < 400) {
        const key = [i, other.idx].sort().join('-');
        if (!connections.has(key)) {
          connections.add(key);
          routes.push({
            source: sys,
            target: systems[other.idx],
            id: key
          });
        }
      }
    });
  });

  return { systems, routes };
}
