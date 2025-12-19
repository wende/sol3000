import { describe, it, expect } from 'vitest';
import { buildFTL } from './ftl';

describe('FTL Tether Building', () => {
  const createMockGalaxy = () => ({
    systems: [
      { id: 1, name: 'Sol', owner: 'Player', x: 100, y: 100 },
      { id: 2, name: 'Alpha Centauri', owner: 'Player', x: 200, y: 200 },
      { id: 3, name: 'Proxima', owner: 'Neutral', x: 300, y: 300 },
    ],
    routes: []
  });

  const createMockResources = (credits = 100) => ({
    credits,
    minerals: 50,
    energy: 30
  });

  it('should require both systems to be scanned (Player-owned) before building FTL', () => {
    const galaxy = createMockGalaxy();
    const resources = createMockResources(100);
    const builtFTLs = new Set();

    // Try to build FTL between Player system (1) and Neutral system (3)
    const result = buildFTL('route-1-3', galaxy, resources, builtFTLs);

    expect(result.success).toBe(false);
    expect(result.error).toBe('systems_not_scanned');
  });

  it('should allow FTL building after scanning both systems', () => {
    const galaxy = createMockGalaxy();
    const resources = createMockResources(100);
    const builtFTLs = new Set();

    // Build FTL between two Player-owned systems (1 and 2)
    const result = buildFTL('route-1-2', galaxy, resources, builtFTLs);

    expect(result.success).toBe(true);
    expect(result.newCredits).toBe(80); // 100 - 20
    expect(result.newBuiltFTLs.has('route-1-2')).toBe(true);
    expect(result.newBuiltFTLs.size).toBe(1);
  });

  it('should prevent building FTL with insufficient credits even if both systems are scanned', () => {
    const galaxy = createMockGalaxy();
    const resources = createMockResources(10); // Less than 20 credits
    const builtFTLs = new Set();

    // Try to build FTL between two Player-owned systems
    const result = buildFTL('route-1-2', galaxy, resources, builtFTLs);

    expect(result.success).toBe(false);
    expect(result.error).toBe('insufficient_credits');
  });

  it('should prevent building FTL on the same route twice', () => {
    const galaxy = createMockGalaxy();
    const resources = createMockResources(100);
    const builtFTLs = new Set(['route-1-2']);

    const result = buildFTL('route-1-2', galaxy, resources, builtFTLs);

    expect(result.success).toBe(false);
    expect(result.error).toBe('already_built');
  });

  it('should handle tether IDs without "route-" prefix', () => {
    const galaxy = createMockGalaxy();
    const resources = createMockResources(100);
    const builtFTLs = new Set();

    const result = buildFTL('1-2', galaxy, resources, builtFTLs);

    expect(result.success).toBe(true);
    expect(result.newCredits).toBe(80);
    expect(result.newBuiltFTLs.has('1-2')).toBe(true);
  });

  it('should reject invalid tether ID formats', () => {
    const galaxy = createMockGalaxy();
    const resources = createMockResources(100);
    const builtFTLs = new Set();

    const result = buildFTL('invalid-format-here', galaxy, resources, builtFTLs);

    expect(result.success).toBe(false);
    expect(result.error).toBe('invalid_tether_id');
  });

  it('should reject tether IDs for non-existent systems', () => {
    const galaxy = createMockGalaxy();
    const resources = createMockResources(100);
    const builtFTLs = new Set();

    const result = buildFTL('route-99-100', galaxy, resources, builtFTLs);

    expect(result.success).toBe(false);
    expect(result.error).toBe('systems_not_found');
  });
});
