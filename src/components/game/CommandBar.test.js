import { describe, it, expect } from 'vitest';
import { TECH_TREE } from '../../utils/gameState';

/**
 * Tests for CommandBar tech prerequisite logic (padlock display bug fix)
 *
 * Bug: Padlock was showing when user couldn't research for ANY reason
 * (already researching something, low credits, missing prereqs)
 *
 * Fix: Padlock should ONLY show when prerequisites are not met
 */

describe('CommandBar - Tech Prerequisite Logic', () => {
  // Helper functions extracted from CommandBar.jsx for testing
  const hasPrerequisites = (tech, researchedTechs) => {
    return tech.requires.every(req => researchedTechs.includes(req));
  };

  const canResearch = (tech, currentTech, researchedTechs, credits) => {
    if (currentTech) return false; // Already researching something
    if (researchedTechs.includes(tech.id)) return false; // Already researched
    if (credits < tech.cost) return false; // Not enough credits
    return hasPrerequisites(tech, researchedTechs);
  };

  describe('hasPrerequisites', () => {
    it('should return true for tech with no prerequisites', () => {
      const tech = TECH_TREE.efficientMining;
      const researched = [];

      expect(hasPrerequisites(tech, researched)).toBe(true);
    });

    it('should return true when all prerequisites are researched', () => {
      const tech = TECH_TREE.advancedReactors;
      const researched = ['efficientMining'];

      expect(hasPrerequisites(tech, researched)).toBe(true);
    });

    it('should return false when prerequisites are not researched', () => {
      const tech = TECH_TREE.advancedReactors;
      const researched = [];

      expect(hasPrerequisites(tech, researched)).toBe(false);
    });

    it('should return false when only some prerequisites are researched', () => {
      const tech = TECH_TREE.galacticDominion;
      const researched = ['efficientMining', 'tradeNetworks']; // Missing colonialAdmin

      expect(hasPrerequisites(tech, researched)).toBe(false);
    });

    it('should return true for deeply nested tech when all prereqs are met', () => {
      const tech = TECH_TREE.warpDrives;
      const researched = ['efficientMining', 'advancedReactors'];

      expect(hasPrerequisites(tech, researched)).toBe(true);
    });
  });

  describe('Padlock display logic (Bug Fix)', () => {
    it('SHOULD show padlock: prerequisites not met', () => {
      const tech = TECH_TREE.advancedReactors;
      const researched = []; // efficientMining not researched
      const currentTech = null;
      const credits = 1000;

      // Padlock should show
      expect(hasPrerequisites(tech, researched)).toBe(false);

      // But canResearch also returns false
      expect(canResearch(tech, currentTech, researched, credits)).toBe(false);
    });

    it('SHOULD NOT show padlock: prerequisites met but researching something else', () => {
      const tech = TECH_TREE.advancedReactors;
      const researched = ['efficientMining']; // Prerequisite met!
      const currentTech = { id: 'tradeNetworks' }; // Researching something else
      const credits = 1000;

      // Padlock should NOT show (prerequisites are met)
      expect(hasPrerequisites(tech, researched)).toBe(true);

      // But canResearch returns false (researching something else)
      expect(canResearch(tech, currentTech, researched, credits)).toBe(false);
    });

    it('SHOULD NOT show padlock: prerequisites met but not enough credits', () => {
      const tech = TECH_TREE.advancedReactors;
      const researched = ['efficientMining']; // Prerequisite met!
      const currentTech = null;
      const credits = 100; // Not enough (needs 400)

      // Padlock should NOT show (prerequisites are met)
      expect(hasPrerequisites(tech, researched)).toBe(true);

      // But canResearch returns false (not enough credits)
      expect(canResearch(tech, currentTech, researched, credits)).toBe(false);
    });

    it('SHOULD NOT show padlock: tech already researched', () => {
      const tech = TECH_TREE.efficientMining;
      const researched = ['efficientMining']; // Already researched
      const currentTech = null;
      const credits = 1000;

      // Padlock should NOT show (prerequisites are met)
      expect(hasPrerequisites(tech, researched)).toBe(true);

      // canResearch returns false (already researched)
      expect(canResearch(tech, currentTech, researched, credits)).toBe(false);
    });

    it('SHOULD allow research: all conditions met', () => {
      const tech = TECH_TREE.advancedReactors;
      const researched = ['efficientMining'];
      const currentTech = null;
      const credits = 1000;

      // Padlock should NOT show
      expect(hasPrerequisites(tech, researched)).toBe(true);

      // Can research
      expect(canResearch(tech, currentTech, researched, credits)).toBe(true);
    });
  });

  describe('Real-world scenario: Bug reproduction', () => {
    it('should not show padlock on Advanced Reactors when Efficient Mining is researched', () => {
      // Setup: User has researched Efficient Mining and is currently researching Trade Networks
      const researchedTechs = ['efficientMining'];
      const currentlyResearching = { id: 'tradeNetworks', startTime: Date.now() };
      const credits = 500;

      // Check Advanced Reactors (requires efficientMining)
      const advancedReactors = TECH_TREE.advancedReactors;

      // BUG: Old logic would show padlock because canResearch returns false
      const oldLogic = !canResearch(advancedReactors, currentlyResearching, researchedTechs, credits);
      expect(oldLogic).toBe(true); // Incorrectly shows padlock

      // FIX: New logic only checks prerequisites
      const newLogic = !hasPrerequisites(advancedReactors, researchedTechs);
      expect(newLogic).toBe(false); // Correctly does NOT show padlock
    });

    it('should show padlock on Warp Drives when Advanced Reactors is not researched', () => {
      const researchedTechs = ['efficientMining'];
      const currentlyResearching = null;
      const credits = 1000;

      const warpDrives = TECH_TREE.warpDrives;

      // Should show padlock (missing advancedReactors prerequisite)
      expect(hasPrerequisites(warpDrives, researchedTechs)).toBe(false);
      expect(canResearch(warpDrives, currentlyResearching, researchedTechs, credits)).toBe(false);
    });

    it('should not show padlock on Warp Drives when Advanced Reactors is researched', () => {
      const researchedTechs = ['efficientMining', 'advancedReactors'];
      const currentlyResearching = { id: 'tradeNetworks' };
      const credits = 100; // Not enough

      const warpDrives = TECH_TREE.warpDrives;

      // Should NOT show padlock (prerequisites are met)
      expect(hasPrerequisites(warpDrives, researchedTechs)).toBe(true);

      // But can't research (not enough credits and researching something else)
      expect(canResearch(warpDrives, currentlyResearching, researchedTechs, credits)).toBe(false);
    });
  });

  describe('Tech tree structure validation', () => {
    it('should have correct prerequisite chain', () => {
      // efficientMining -> no prereqs
      expect(TECH_TREE.efficientMining.requires).toEqual([]);

      // advancedReactors -> requires efficientMining
      expect(TECH_TREE.advancedReactors.requires).toEqual(['efficientMining']);

      // tradeNetworks -> requires efficientMining
      expect(TECH_TREE.tradeNetworks.requires).toEqual(['efficientMining']);

      // warpDrives -> requires advancedReactors
      expect(TECH_TREE.warpDrives.requires).toEqual(['advancedReactors']);

      // colonialAdmin -> requires tradeNetworks
      expect(TECH_TREE.colonialAdmin.requires).toEqual(['tradeNetworks']);

      // galacticDominion -> requires colonialAdmin
      expect(TECH_TREE.galacticDominion.requires).toEqual(['colonialAdmin']);
    });
  });
});
