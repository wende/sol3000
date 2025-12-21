/**
 * Building definitions with costs and production rates
 */
export const BUILDINGS = {
  oreMine: {
    id: 'oreMine',
    name: 'Metals Extractor',
    description: 'Extracts raw metals, making this system a metals supplier.',
    baseCost: { credits: 50 },
    costFactor: 1.15,
    buildTimeFactor: 1.5,
    production: { metals: 0, credits: 0 },
    supplyPerLevel: 200, // Each level adds 200 to system's metals supply
    energyUsage: 2,
    buildTime: 3000
  },
  solarPlant: {
    id: 'solarPlant',
    name: 'Solar Plant',
    description: 'Provides energy capacity from stellar radiation.',
    baseCost: { credits: 30 },
    costFactor: 1.15,
    buildTimeFactor: 1.5,
    production: { metals: 0, credits: 0 },
    energyCapacity: 5,
    energyUsage: 0,
    buildTime: 2000
  },
  tradeHub: {
    id: 'tradeHub',
    name: 'Trade Hub',
    description: 'Facilitates commerce and generates credits.',
    baseCost: { credits: 80 },
    costFactor: 1.15,
    buildTimeFactor: 1.5,
    production: { metals: 0, credits: 0.2 },
    energyUsage: 3,
    buildTime: 4500
  },
  shipyard: {
    id: 'shipyard',
    name: 'Shipyard',
    description: 'Constructs spacecraft for colonization.',
    baseCost: { credits: 300 },
    costFactor: 1.15,
    buildTimeFactor: 1.5,
    production: { metals: 0, credits: 0 },
    energyUsage: 5,
    buildTime: 12000
  },
  logisticsCenter: {
    id: 'logisticsCenter',
    name: 'Logistics Center',
    description: 'Acts as a relay hub for supply chains, enabling multi-hop resource distribution.',
    baseCost: { credits: 150 },
    costFactor: 1.15,
    buildTimeFactor: 1.5,
    production: { metals: 0, credits: 0 },
    energyUsage: 4,
    buildTime: 8000,
    isLogisticsHub: true // Special flag to mark this system as a relay point
  }
};

/**
 * Colony ship definition
 */
export const COLONY_SHIP = {
  cost: { credits: 800 },
  energyUsage: 10,
  buildTime: 18000,
  travelTimePerHop: 6000
};

/**
 * Calculate building cost at a given level
 */
export function getBuildingCost(buildingId, level) {
  const building = BUILDINGS[buildingId];
  const factor = Math.pow(building.costFactor, level);
  return {
    credits: Math.floor(building.baseCost.credits * factor)
  };
}
