/**
 * Tech tree definitions
 */
export const TECH_TREE = {
  efficientMining: {
    id: 'efficientMining',
    name: 'Efficient Mining',
    description: '+25% Metals production',
    cost: 200,
    researchTime: 12000,
    requires: [],
    effect: { oreBonus: 0.25 }
  },
  advancedReactors: {
    id: 'advancedReactors',
    name: 'Advanced Reactors',
    description: '+25% Energy capacity',
    cost: 400,
    researchTime: 18000,
    requires: ['efficientMining'],
    effect: { energyBonus: 0.25 }
  },
  tradeNetworks: {
    id: 'tradeNetworks',
    name: 'Trade Networks',
    description: '+25% Credits production',
    cost: 350,
    researchTime: 15000,
    requires: ['efficientMining'],
    effect: { creditsBonus: 0.25 }
  },
  warpDrives: {
    id: 'warpDrives',
    name: 'Warp Drives',
    description: '-25% ship travel time',
    cost: 600,
    researchTime: 24000,
    requires: ['advancedReactors'],
    effect: { travelBonus: 0.25 }
  },
  colonialAdmin: {
    id: 'colonialAdmin',
    name: 'Colonial Administration',
    description: 'New colonies start with Lvl 1 buildings',
    cost: 500,
    researchTime: 20000,
    requires: ['tradeNetworks'],
    effect: { colonyBonus: true }
  },
  galacticDominion: {
    id: 'galacticDominion',
    name: 'Galactic Dominion',
    description: '+50% all production',
    cost: 1000,
    researchTime: 30000,
    requires: ['colonialAdmin'],
    effect: { allBonus: 0.5 }
  }
};

export function calculateTechBonuses(researched) {
  const bonuses = {
    metals: 1,
    energy: 1,
    credits: 1,
    travel: 1,
    colonyBonus: false,
    all: 1
  };

  researched.forEach(techId => {
    const tech = TECH_TREE[techId];
    if (!tech) return;

    if (tech.effect.oreBonus) bonuses.metals += tech.effect.oreBonus;
    if (tech.effect.energyBonus) bonuses.energy += tech.effect.energyBonus;
    if (tech.effect.creditsBonus) bonuses.credits += tech.effect.creditsBonus;
    if (tech.effect.travelBonus) bonuses.travel -= tech.effect.travelBonus;
    if (tech.effect.colonyBonus) bonuses.colonyBonus = true;
    if (tech.effect.allBonus) bonuses.all += tech.effect.allBonus;
  });

  return bonuses;
}
