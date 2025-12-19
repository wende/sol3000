/**
 * Scan operation constants and utilities
 */

// Scan timing constants
export const SCAN_BASE_TIME = 30000; // 30 seconds base
export const SCAN_TIME_PER_HOP = 5000; // +5 seconds per hop from home system
export const SCAN_COST = 50; // Credits cost to scan

/**
 * Calculate the number of hops from home system to target system
 * @param {Object} galaxy - Galaxy data with systems and routes
 * @param {number} homeId - Home system ID
 * @param {number} targetId - Target system ID
 * @param {Function} findPath - Path finding function
 * @returns {number} Number of hops (0 if same system or no path)
 */
export function calculateHopsToSystem(galaxy, homeId, targetId, findPath) {
  if (!homeId || homeId === targetId) {
    return 0;
  }
  const path = findPath(galaxy, homeId, targetId);
  return path ? path.length : 0;
}

/**
 * Calculate scan duration in milliseconds
 * @param {number} hops - Number of hops from home system
 * @returns {number} Duration in milliseconds
 */
export function calculateScanDuration(hops) {
  return SCAN_BASE_TIME + (hops * SCAN_TIME_PER_HOP);
}

/**
 * Calculate scan duration in seconds (for UI display)
 * @param {number} hops - Number of hops from home system
 * @returns {number} Duration in seconds
 */
export function calculateScanDurationSeconds(hops) {
  return calculateScanDuration(hops) / 1000;
}

/**
 * Get full scan info for a target system
 * @param {Object} galaxy - Galaxy data
 * @param {number} homeId - Home system ID
 * @param {number} targetId - Target system ID
 * @param {Function} findPath - Path finding function
 * @returns {{ hops: number, durationMs: number, durationSeconds: number, cost: number }}
 */
export function getScanInfo(galaxy, homeId, targetId, findPath) {
  const hops = calculateHopsToSystem(galaxy, homeId, targetId, findPath);
  const durationMs = calculateScanDuration(hops);
  return {
    hops,
    durationMs,
    durationSeconds: durationMs / 1000,
    cost: SCAN_COST
  };
}
