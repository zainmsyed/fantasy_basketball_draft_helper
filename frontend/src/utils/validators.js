export function isValidPosition(pos) {
  if (!pos) return false;
  return /^(PG|SG|SF|PF|C)(\/(PG|SG|SF|PF|C))*$/.test(pos);
}

export function isValidPercentage(p) {
  if (p === null || p === undefined) return true;
  const num = Number(p);
  if (Number.isNaN(num)) return false;
  return num >= 0 && num <= 1;
}

export function countNonNullStats(stats) {
  if (!stats) return 0;
  return Object.values(stats).filter(v => v !== null && v !== undefined).length;
}
export function validatePlayer(p) {
  if (!p || typeof p !== 'object') return false
  if (!p.id || !p.name) return false
  if (!Array.isArray(p.positions) || p.positions.length === 0) return false
  if (!p.stats || typeof p.stats.gp !== 'number') return false
  return true
}

export function validateBundle(bundle) {
  if (!bundle || !Array.isArray(bundle.players)) return false
  return bundle.players.every(validatePlayer)
}

// Player qualification validation utilities for percentage statistics
// Ensures players meet minimum attempt thresholds for FG% and FT% calculations

/**
 * Check if a player qualifies for field goal percentage calculations
 * @param {Object} player - Player object with fga and gp properties
 * @returns {boolean} True if player averages >= 5 FGA per game
 */
export function checkFGQualification(player) {
  if (!player || typeof player.fga !== 'number' || typeof player.gp !== 'number') {
    return false;
  }

  if (player.gp === 0) return false; // Avoid division by zero

  return (player.fga / player.gp) >= 5.0;
}

/**
 * Check if a player qualifies for free throw percentage calculations
 * @param {Object} player - Player object with fta and gp properties
 * @returns {boolean} True if player averages >= 2 FTA per game
 */
export function checkFTQualification(player) {
  if (!player || typeof player.fta !== 'number' || typeof player.gp !== 'number') {
    return false;
  }

  if (player.gp === 0) return false; // Avoid division by zero

  return (player.fta / player.gp) >= 2.0;
}

/**
 * Check qualification for any percentage category
 * @param {Object} player - Player object
 * @param {string} category - Category name ('fg_pct' or 'ft_pct')
 * @returns {boolean} True if player qualifies for the category
 */
export function checkQualification(player, category) {
  switch (category) {
    case 'fg_pct':
      return checkFGQualification(player);
    case 'ft_pct':
      return checkFTQualification(player);
    default:
      return true; // Non-percentage categories don't require qualification
  }
}
