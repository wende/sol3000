/**
 * Shared formatting utilities
 */

/**
 * Format milliseconds to human-readable time string
 * @param {number} ms - Time in milliseconds
 * @returns {string} Formatted time string (e.g., "2m 30s" or "45s")
 */
export function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  if (seconds >= 60) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }
  return `${seconds}s`;
}

/**
 * Format a number with K/M suffixes for large values
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
export function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return Math.floor(num).toLocaleString();
}

/**
 * Format production rate with + prefix
 * @param {number} rate - Production rate per second
 * @returns {string} Formatted rate string
 */
export function formatRate(rate) {
  if (rate === 0) return '+0';
  if (rate < 0.1) return '+' + rate.toFixed(2);
  return '+' + rate.toFixed(1);
}
