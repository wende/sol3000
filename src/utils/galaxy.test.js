import { describe, it, expect } from 'vitest';
import { generateGalaxy, CENTER_X, CENTER_Y } from './galaxy';

describe('generateGalaxy', () => {
  describe('Home system generation', () => {
    it('should always generate exactly one Player-owned home system', () => {
      for (let i = 0; i < 10; i++) {
        const { systems } = generateGalaxy();
        const playerSystems = systems.filter(s => s.owner === 'Player');

        expect(playerSystems).toHaveLength(1);
        expect(playerSystems[0].isHomeSystem).toBe(true);
        expect(playerSystems[0].name).toBe('Sol');
      }
    });

    it('should always generate home system as G-class star', () => {
      for (let i = 0; i < 10; i++) {
        const { systems } = generateGalaxy();
        const homeSystem = systems.find(s => s.isHomeSystem);

        expect(homeSystem.spectralClass).toBe('G');
      }
    });

    it('should generate home system with 3-6 planets', () => {
      for (let i = 0; i < 20; i++) {
        const { systems } = generateGalaxy();
        const homeSystem = systems.find(s => s.isHomeSystem);

        expect(homeSystem.planetCount).toBeGreaterThanOrEqual(3);
        expect(homeSystem.planetCount).toBeLessThanOrEqual(6);
        expect(homeSystem.planets.length).toBe(homeSystem.planetCount);
      }
    });

    it('should have exactly one Terrestrial planet at position 2, 3, or 4', () => {
      for (let i = 0; i < 20; i++) {
        const { systems } = generateGalaxy();
        const homeSystem = systems.find(s => s.isHomeSystem);
        const terrestrialPlanets = homeSystem.planets.filter(p => p.type === 'Terrestrial');

        expect(terrestrialPlanets).toHaveLength(1);

        // Find the index of the terrestrial planet (0-indexed)
        const terrestrialIndex = homeSystem.planets.findIndex(p => p.type === 'Terrestrial');
        // Position 2, 3, or 4 means index 1, 2, or 3
        expect(terrestrialIndex).toBeGreaterThanOrEqual(1);
        expect(terrestrialIndex).toBeLessThanOrEqual(3);
      }
    });

    it('should only have Enemy or Unclaimed for non-home systems', () => {
      const { systems } = generateGalaxy();
      const nonHomeSystems = systems.filter(s => !s.isHomeSystem);

      nonHomeSystems.forEach(system => {
        expect(['Enemy', 'Unclaimed']).toContain(system.owner);
      });
    });
  });

  describe('Galaxy structure', () => {
    it('should generate approximately 120 systems', () => {
      const { systems } = generateGalaxy();

      // Due to overlap rejection, we might get fewer systems
      expect(systems.length).toBeGreaterThan(80);
      expect(systems.length).toBeLessThanOrEqual(120);
    });

    it('should generate systems outside the black hole exclusion zone', () => {
      const { systems } = generateGalaxy();
      const minRadius = 400;

      systems.forEach(system => {
        const distFromCenter = Math.hypot(system.x - CENTER_X, system.y - CENTER_Y);
        expect(distFromCenter).toBeGreaterThanOrEqual(minRadius - 1); // Small tolerance
      });
    });

    it('should generate routes between nearby systems', () => {
      const { systems, routes } = generateGalaxy();

      expect(routes.length).toBeGreaterThan(0);

      // Each route should connect two different systems
      routes.forEach(route => {
        expect(route.source).toBeDefined();
        expect(route.target).toBeDefined();
        expect(route.source.id).not.toBe(route.target.id);
      });
    });

    it('should assign unique IDs to all systems', () => {
      const { systems } = generateGalaxy();
      const ids = systems.map(s => s.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(systems.length);
    });

    it('should assign required properties to each system', () => {
      const { systems } = generateGalaxy();

      systems.forEach(system => {
        expect(system).toHaveProperty('id');
        expect(system).toHaveProperty('name');
        expect(system).toHaveProperty('x');
        expect(system).toHaveProperty('y');
        expect(system).toHaveProperty('size');
        expect(system).toHaveProperty('spectralClass');
        expect(system).toHaveProperty('population');
        expect(system).toHaveProperty('resources');
        expect(system).toHaveProperty('owner');
        expect(system).toHaveProperty('market');
        expect(system).toHaveProperty('description');
      });
    });

    it('should have valid resource types', () => {
      const { systems } = generateGalaxy();

      systems.forEach(system => {
        expect(['Rich', 'Normal', 'Poor']).toContain(system.resources);
      });
    });

    it('should have valid metals market shape when present', () => {
      const { systems } = generateGalaxy();

      systems.forEach(system => {
        const metals = system.market?.metals;
        if (!metals) return;

        expect(metals).toHaveProperty('supply');
        expect(metals).toHaveProperty('demand');
        expect(typeof metals.supply).toBe('number');
        expect(typeof metals.demand).toBe('number');
        expect(metals.supply).toBeGreaterThanOrEqual(0);
        expect(metals.demand).toBeGreaterThanOrEqual(0);

        // For now generation produces either supply OR demand (not both).
        expect((metals.supply > 0) !== (metals.demand > 0)).toBe(true);
      });
    });
  });
});
