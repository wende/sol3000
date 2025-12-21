import { describe, it, expect } from 'vitest';
import { computeTradeFlows } from './trade';

describe('computeTradeFlows', () => {
  describe('Direct connections', () => {
    it('should create flows for direct producer-consumer connection', () => {
      const galaxy = {
        systems: [
          {
            id: 1,
            name: 'System A',
            owner: 'Player',
            buildings: { oreMine: { level: 1 } },
            market: { metals: { demand: 0 } }
          },
          {
            id: 2,
            name: 'System B',
            owner: 'Player',
            buildings: {},
            market: { metals: { demand: 200 } }
          }
        ],
        routes: [
          {
            id: '1-2',
            source: { id: 1, name: 'System A' },
            target: { id: 2, name: 'System B' }
          }
        ]
      };

      const builtFTLs = new Set(['1-2']);
      const result = computeTradeFlows(galaxy, builtFTLs);

      expect(result.flows.length).toBeGreaterThan(0);
      expect(result.routeThroughput.get('1-2')).toBeGreaterThan(0);
    });
  });

  describe('Logistics Center multi-hop paths', () => {
    it('should find path through logistics center (A->B->C)', () => {
      const galaxy = {
        systems: [
          {
            id: 1,
            name: 'Producer',
            owner: 'Player',
            buildings: { oreMine: { level: 1 } }, // Supply: 200
            market: { metals: { demand: 0 } }
          },
          {
            id: 2,
            name: 'Hub',
            owner: 'Player',
            buildings: { logisticsCenter: { level: 1 } }, // Relay hub
            market: { metals: { demand: 0 } }
          },
          {
            id: 3,
            name: 'Consumer',
            owner: 'Player',
            buildings: {},
            market: { metals: { demand: 200 } }
          }
        ],
        routes: [
          {
            id: '1-2',
            source: { id: 1, name: 'Producer' },
            target: { id: 2, name: 'Hub' }
          },
          {
            id: '2-3',
            source: { id: 2, name: 'Hub' },
            target: { id: 3, name: 'Consumer' }
          }
        ]
      };

      const builtFTLs = new Set(['1-2', '2-3']);
      const result = computeTradeFlows(galaxy, builtFTLs);

      // Should create flows through both segments
      expect(result.flows.length).toBeGreaterThan(0);

      // Both route segments should have throughput
      expect(result.routeThroughput.get('1-2')).toBeGreaterThan(0);
      expect(result.routeThroughput.get('2-3')).toBeGreaterThan(0);

      // Throughput should be equal on both segments (same flow)
      expect(result.routeThroughput.get('1-2')).toBe(result.routeThroughput.get('2-3'));

      // Route paths should be tracked
      expect(result.routePaths.has('1-2')).toBe(true);
      expect(result.routePaths.has('2-3')).toBe(true);
    });

    it('should NOT create path without logistics center at relay point', () => {
      const galaxy = {
        systems: [
          {
            id: 1,
            name: 'Producer',
            owner: 'Player',
            buildings: { oreMine: { level: 1 } },
            market: { metals: { demand: 0 } }
          },
          {
            id: 2,
            name: 'NotAHub',
            owner: 'Player',
            buildings: {}, // NO logistics center
            market: { metals: { demand: 0 } }
          },
          {
            id: 3,
            name: 'Consumer',
            owner: 'Player',
            buildings: {},
            market: { metals: { demand: 200 } }
          }
        ],
        routes: [
          {
            id: '1-2',
            source: { id: 1, name: 'Producer' },
            target: { id: 2, name: 'NotAHub' }
          },
          {
            id: '2-3',
            source: { id: 2, name: 'NotAHub' },
            target: { id: 3, name: 'Consumer' }
          }
        ]
      };

      const builtFTLs = new Set(['1-2', '2-3']);
      const result = computeTradeFlows(galaxy, builtFTLs);

      // Should NOT create multi-hop path (no logistics center)
      // Only direct connections should be considered (and there are none)
      expect(result.routeThroughput.get('1-2') || 0).toBe(0);
      expect(result.routeThroughput.get('2-3') || 0).toBe(0);
    });

    it('should prefer direct connection over multi-hop when both exist', () => {
      const galaxy = {
        systems: [
          {
            id: 1,
            name: 'Producer',
            owner: 'Player',
            buildings: { oreMine: { level: 1 } }, // Supply: 200
            market: { metals: { demand: 0 } }
          },
          {
            id: 2,
            name: 'Hub',
            owner: 'Player',
            buildings: { logisticsCenter: { level: 1 } },
            market: { metals: { demand: 0 } }
          },
          {
            id: 3,
            name: 'Consumer',
            owner: 'Player',
            buildings: {},
            market: { metals: { demand: 200 } }
          }
        ],
        routes: [
          {
            id: '1-2',
            source: { id: 1, name: 'Producer' },
            target: { id: 2, name: 'Hub' }
          },
          {
            id: '1-3',
            source: { id: 1, name: 'Producer' },
            target: { id: 3, name: 'Consumer' }
          },
          {
            id: '2-3',
            source: { id: 2, name: 'Hub' },
            target: { id: 3, name: 'Consumer' }
          }
        ]
      };

      const builtFTLs = new Set(['1-2', '1-3', '2-3']);
      const result = computeTradeFlows(galaxy, builtFTLs);

      // Both direct and multi-hop paths should be found
      expect(result.flows.length).toBeGreaterThan(0);

      // Direct route should have flow
      expect(result.routeThroughput.get('1-3')).toBeGreaterThan(0);
    });

    it('should handle multiple logistics centers in chain (A->B->C->D)', () => {
      const galaxy = {
        systems: [
          {
            id: 1,
            name: 'Producer',
            owner: 'Player',
            buildings: { oreMine: { level: 1 } },
            market: { metals: { demand: 0 } }
          },
          {
            id: 2,
            name: 'Hub1',
            owner: 'Player',
            buildings: { logisticsCenter: { level: 1 } },
            market: { metals: { demand: 0 } }
          },
          {
            id: 3,
            name: 'Hub2',
            owner: 'Player',
            buildings: { logisticsCenter: { level: 1 } },
            market: { metals: { demand: 0 } }
          },
          {
            id: 4,
            name: 'Consumer',
            owner: 'Player',
            buildings: {},
            market: { metals: { demand: 200 } }
          }
        ],
        routes: [
          { id: '1-2', source: { id: 1 }, target: { id: 2 } },
          { id: '2-3', source: { id: 2 }, target: { id: 3 } },
          { id: '3-4', source: { id: 3 }, target: { id: 4 } }
        ]
      };

      const builtFTLs = new Set(['1-2', '2-3', '3-4']);
      const result = computeTradeFlows(galaxy, builtFTLs);

      // Should now support multi-hop paths through multiple logistics centers
      expect(result.flows.length).toBeGreaterThan(0);

      // All segments should have throughput
      expect(result.routeThroughput.get('1-2')).toBeGreaterThan(0);
      expect(result.routeThroughput.get('2-3')).toBeGreaterThan(0);
      expect(result.routeThroughput.get('3-4')).toBeGreaterThan(0);

      // Throughput should be equal across all segments (same flow)
      const throughput12 = result.routeThroughput.get('1-2');
      const throughput23 = result.routeThroughput.get('2-3');
      const throughput34 = result.routeThroughput.get('3-4');
      expect(throughput12).toBe(throughput23);
      expect(throughput23).toBe(throughput34);
    });
  });

  describe('Dual producer/consumer systems', () => {
    it('should allow system to be both producer and consumer simultaneously', () => {
      const galaxy = {
        systems: [
          {
            id: 1,
            name: 'Pure Producer',
            owner: 'Player',
            buildings: { oreMine: { level: 3 } }, // Production: 600
            market: { metals: { demand: 0 } }
          },
          {
            id: 2,
            name: 'Dual Role System',
            owner: 'Player',
            buildings: { oreMine: { level: 2 } }, // Production: 400
            market: { metals: { demand: 200 } }   // Local: 200, Surplus: 200
          },
          {
            id: 3,
            name: 'Pure Consumer',
            owner: 'Player',
            buildings: {},
            market: { metals: { demand: 300 } }
          }
        ],
        routes: [
          { id: '1-2', source: { id: 1 }, target: { id: 2 } },
          { id: '2-3', source: { id: 2 }, target: { id: 3 } }
        ]
      };

      const builtFTLs = new Set(['1-2', '2-3']);
      const result = computeTradeFlows(galaxy, builtFTLs);

      // System 2 uses 200 locally, has 200 surplus to export
      expect(result.flows.length).toBeGreaterThan(0);

      // System 2 should export its surplus to system 3
      const exportsFromSystem2 = result.flows.filter(f => f.producerId === 2);
      expect(exportsFromSystem2.length).toBeGreaterThan(0);
      expect(exportsFromSystem2[0].consumerId).toBe(3);
    });

    it('should handle system with production equal to demand (self-sufficient)', () => {
      const galaxy = {
        systems: [
          {
            id: 1,
            name: 'Self-Sufficient System',
            owner: 'Player',
            buildings: { oreMine: { level: 1 } }, // Production: 200
            market: { metals: { demand: 200 } }   // Demand: 200 (perfectly balanced)
          },
          {
            id: 2,
            name: 'Consumer',
            owner: 'Player',
            buildings: {},
            market: { metals: { demand: 200 } }
          }
        ],
        routes: [
          { id: '1-2', source: { id: 1 }, target: { id: 2 } }
        ]
      };

      const builtFTLs = new Set(['1-2']);
      const result = computeTradeFlows(galaxy, builtFTLs);

      // System 1 is self-sufficient (no surplus, no unmet demand)
      // Only system 2 participates as a consumer
      // No flows should involve system 1 since it has no surplus
      const flowsInvolvingSystem1 = result.flows.filter(f => f.producerId === 1 || f.consumerId === 1);
      expect(flowsInvolvingSystem1.length).toBe(0);
    });

    it('should track separate export and import satisfaction stats', () => {
      const galaxy = {
        systems: [
          {
            id: 1,
            name: 'Big Producer',
            owner: 'Player',
            buildings: { oreMine: { level: 5 } }, // Production: 1000
            market: { metals: { demand: 100 } }   // Local: 100, Surplus: 900
          },
          {
            id: 2,
            name: 'Dual Role System',
            owner: 'Player',
            buildings: { oreMine: { level: 2 } }, // Production: 400
            market: { metals: { demand: 200 } }   // Local: 200, Surplus: 200
          },
          {
            id: 3,
            name: 'Consumer',
            owner: 'Player',
            buildings: {},
            market: { metals: { demand: 500 } }
          }
        ],
        routes: [
          { id: '1-2', source: { id: 1 }, target: { id: 2 } },
          { id: '2-3', source: { id: 2 }, target: { id: 3 } }
        ]
      };

      const builtFTLs = new Set(['1-2', '2-3']);
      const result = computeTradeFlows(galaxy, builtFTLs);

      // System 2 has surplus to export and no unmet demand
      const system2Stats = result.systemSatisfaction.get(2);
      expect(system2Stats).toBeDefined();
      expect(system2Stats.exported).toBeDefined(); // Tracks exports (from surplus)
      expect(system2Stats.totalSupply).toBe(200);  // Surplus available for export

      // System 2 only participates as a producer (has surplus, no unmet demand)
      const exportsFromSystem2 = result.flows.filter(f => f.producerId === 2);
      expect(exportsFromSystem2.length).toBeGreaterThan(0);
    });
  });

  describe('Edge cases', () => {
    it('should return empty results when no FTLs are built', () => {
      const galaxy = {
        systems: [
          {
            id: 1,
            owner: 'Player',
            buildings: { oreMine: { level: 1 } },
            market: { metals: { demand: 0 } }
          },
          {
            id: 2,
            owner: 'Player',
            buildings: {},
            market: { metals: { demand: 200 } }
          }
        ],
        routes: [
          { id: '1-2', source: { id: 1 }, target: { id: 2 } }
        ]
      };

      const builtFTLs = new Set();
      const result = computeTradeFlows(galaxy, builtFTLs);

      expect(result.flows).toEqual([]);
      expect(result.routeThroughput.size).toBe(0);
    });

    it('should handle systems that are not Player-owned', () => {
      const galaxy = {
        systems: [
          {
            id: 1,
            name: 'Producer',
            owner: 'Player',
            buildings: { oreMine: { level: 1 } },
            market: { metals: { demand: 0 } }
          },
          {
            id: 2,
            name: 'NeutralHub',
            owner: 'Unclaimed', // Not Player-owned
            buildings: { logisticsCenter: { level: 1 } },
            market: { metals: { demand: 0 } }
          },
          {
            id: 3,
            name: 'Consumer',
            owner: 'Player',
            buildings: {},
            market: { metals: { demand: 200 } }
          }
        ],
        routes: [
          { id: '1-2', source: { id: 1 }, target: { id: 2 } },
          { id: '2-3', source: { id: 2 }, target: { id: 3 } }
        ]
      };

      const builtFTLs = new Set(['1-2', '2-3']);
      const result = computeTradeFlows(galaxy, builtFTLs);

      // Neutral system cannot act as logistics hub
      expect(result.routeThroughput.get('1-2') || 0).toBe(0);
      expect(result.routeThroughput.get('2-3') || 0).toBe(0);
    });
  });
});
