/**
 * Building definitions with costs and production rates
 */
export const BUILDINGS = {
  oreMine: {
    id: 'oreMine',
    name: 'Ore Mine',
    description: 'Extracts raw ore from the planet.',
    baseCost: { ore: 50, credits: 0 },
    costFactor: 1.15,
    buildTimeFactor: 1.5,
    production: { ore: 0.5, credits: 0 },
    energyUsage: 2,
    buildTime: 3000
  },
  solarPlant: {
    id: 'solarPlant',
    name: 'Solar Plant',
    description: 'Provides energy capacity from stellar radiation.',
    baseCost: { ore: 30, credits: 0 },
    costFactor: 1.15,
    buildTimeFactor: 1.5,
    production: { ore: 0, credits: 0 },
    energyCapacity: 5,
    energyUsage: 0,
    buildTime: 2000
  },
  tradeHub: {
    id: 'tradeHub',
    name: 'Trade Hub',
    description: 'Facilitates commerce and generates credits.',
    baseCost: { ore: 80, credits: 0 },
    costFactor: 1.15,
    buildTimeFactor: 1.5,
    production: { ore: 0, credits: 0.2 },
    energyUsage: 3,
    buildTime: 4500
  },
  shipyard: {
    id: 'shipyard',
    name: 'Shipyard',
    description: 'Constructs spacecraft for colonization.',
    baseCost: { ore: 200, credits: 100 },
    costFactor: 1.15,
    buildTimeFactor: 1.5,
    production: { ore: 0, credits: 0 },
    energyUsage: 5,
    buildTime: 12000
  }
};

/**
 * Colony ship definition
 */
export const COLONY_SHIP = {
  cost: { ore: 500, credits: 300 },
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
    ore: Math.floor(building.baseCost.ore * factor),
    credits: Math.floor(building.baseCost.credits * factor)
  };
}
