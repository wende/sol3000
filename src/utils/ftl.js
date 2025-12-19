/**
 * FTL Tether Management
 * Handles building and managing FTL connections between star systems
 */

/**
 * Build an FTL tether between two systems
 * @param {string} tetherId - Route ID in format "sourceId-targetId" or "route-sourceId-targetId"
 * @param {Object} galaxyData - Galaxy data containing systems array
 * @param {Object} resources - Current resource state { credits, ... }
 * @param {Set} builtFTLs - Set of already built FTL tether IDs
 * @returns {{ success: boolean, newCredits?: number, newBuiltFTLs?: Set<string>, error?: string }}
 */
export function buildFTL(tetherId, galaxyData, resources, builtFTLs) {
  const FTL_COST = 20;

  if (resources.credits < FTL_COST) {
    console.log('❌ Not enough credits for FTL:', resources.credits, 'need', FTL_COST);
    return { success: false, error: 'insufficient_credits' };
  }

  if (builtFTLs.has(tetherId)) {
    console.log('❌ FTL already built on route:', tetherId);
    return { success: false, error: 'already_built' };
  }

  // Parse the tether ID to get system IDs (format: "sourceId-targetId" or "route-sourceId-targetId")
  // Strip "route-" prefix if present
  const cleanId = tetherId.replace(/^route-/, '');
  const parts = cleanId.split('-').map(Number);

  if (parts.length !== 2 || parts.some(isNaN)) {
    console.log('❌ Invalid tether ID format:', tetherId);
    return { success: false, error: 'invalid_tether_id' };
  }

  const [sourceId, targetId] = parts;

  // Look up the actual current system data from the galaxy (not from route references)
  const sourceSystem = galaxyData.systems.find(s => s.id === sourceId);
  const targetSystem = galaxyData.systems.find(s => s.id === targetId);

  if (!sourceSystem || !targetSystem) {
    console.log('❌ Could not find systems for route:', tetherId, 'parsed as:', sourceId, targetId);
    return { success: false, error: 'systems_not_found' };
  }

  // Both systems must be Player-owned (scanned)
  if (sourceSystem.owner !== 'Player' || targetSystem.owner !== 'Player') {
    console.log('❌ Both systems must be scanned. Source:', sourceSystem.owner, 'Target:', targetSystem.owner);
    return { success: false, error: 'systems_not_scanned' };
  }

  // Calculate new state
  const newCredits = resources.credits - FTL_COST;
  const newBuiltFTLs = new Set([...builtFTLs, tetherId]);

  console.log(`🔨 Built FTL on route ${tetherId}. Total built: ${newBuiltFTLs.size}`);
  console.log(`   Built routes:`, [...newBuiltFTLs]);

  return {
    success: true,
    newCredits,
    newBuiltFTLs
  };
}
