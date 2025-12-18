import { describe, it, expect } from 'vitest';
import { generateGalaxy, MAP_WIDTH, MAP_HEIGHT, CENTER_X, CENTER_Y } from './galaxy';

describe('generateGalaxy', () => {
  describe('Bug #1: No Player ownership on generation', () => {
    it('should never assign Player ownership to any system', () => {
      // Run multiple times to catch random assignment bugs
      for (let i = 0; i < 10; i++) {
        const { systems } = generateGalaxy();
        const playerSystems = systems.filter(s => s.owner === 'Player');

        expect(playerSystems).toHaveLength(0);
      }
    });

    it('should only have Enemy or Unclaimed systems', () => {
      const { systems } = generateGalaxy();

      systems.forEach(system => {
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
        expect(system).toHaveProperty('color');
        expect(system).toHaveProperty('population');
        expect(system).toHaveProperty('resources');
        expect(system).toHaveProperty('owner');
        expect(system).toHaveProperty('description');
      });
    });

    it('should have valid resource types', () => {
      const { systems } = generateGalaxy();

      systems.forEach(system => {
        expect(['Rich', 'Normal', 'Poor']).toContain(system.resources);
      });
    });
  });
});
