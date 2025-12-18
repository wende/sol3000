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

// Expanded map dimensions
export const MAP_WIDTH = 2500;
export const MAP_HEIGHT = 2500;
export const CENTER_X = MAP_WIDTH / 2;
export const CENTER_Y = MAP_HEIGHT / 2;

/**
 * Generates the galaxy data with systems and routes.
 * 
 * @returns {{
 *   systems: Array<{
 *     id: number,
 *     name: string,
 *     x: number,
 *     y: number,
 *     size: number,
 *     color: string,
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
  const spiralArms = 3;
  const armSpread = 0.5; // How tight the arms are

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

    const sizeTier = Math.random();
    const radius = sizeTier > 0.9 ? 12 : sizeTier > 0.6 ? 8 : 5;

    systems.push({
      id: idCounter++,
      name: `System ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${Math.floor(Math.random() * 999)}`,
      x: x,
      y: y,
      size: radius,
      color: sizeTier > 0.9 ? COLORS.starPrimary : sizeTier > 0.6 ? COLORS.starSecondary : COLORS.starTertiary,
      population: (Math.floor(Math.random() * 100) / 10).toFixed(1) + 'M',
      resources: Math.random() > 0.7 ? 'Rich' : Math.random() > 0.3 ? 'Normal' : 'Poor',
      owner: Math.random() > 0.9 ? 'Enemy' : 'Unclaimed',
      description: "Orbiting the galactic core at a stable distance. Gravitational tides are high."
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
