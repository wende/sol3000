/**
 * Building definitions with costs and production rates
 */
export const BUILDINGS = {
  oreMine: {
    id: 'oreMine',
    name: 'Metals Extractor',
    description: 'Extracts raw metals from the planet.',
    baseCost: { metals: 50, credits: 0 },
    costFactor: 1.15,
    buildTimeFactor: 1.5,
    production: { metals: 0.5, credits: 0 },
    energyUsage: 2,
    buildTime: 3000
  },
  solarPlant: {
    id: 'solarPlant',
    name: 'Solar Plant',
    description: 'Provides energy capacity from stellar radiation.',
    baseCost: { metals: 30, credits: 0 },
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
    baseCost: { metals: 80, credits: 0 },
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
    baseCost: { metals: 200, credits: 100 },
    costFactor: 1.15,
    buildTimeFactor: 1.5,
    production: { metals: 0, credits: 0 },
    energyUsage: 5,
    buildTime: 12000
  }
};

/**
 * Colony ship definition
 */
export const COLONY_SHIP = {
  cost: { metals: 500, credits: 300 },
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
    metals: Math.floor(building.baseCost.metals * factor),
    credits: Math.floor(building.baseCost.credits * factor)
  };
}
