// Statistical data formatting utilities
// Handles display formatting for stats, percentages, and rankings

/**
 * Format a percentage value for display
 * @param {number} value - Decimal percentage (0.0 to 1.0)
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted percentage string (e.g., "45.6%")
 */
export function formatPercentage(value, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }

  const percentage = value * 100;
  return `${percentage.toFixed(decimals)}%`;
}

/**
 * Format a statistical value for display
 * @param {number} value - The numeric value to format
 * @param {string} category - The category name to determine formatting rules
 * @returns {string} Formatted value string
 */
export function formatStatValue(value, category = null) {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }

  // Percentage categories
  if (category === 'fg_pct' || category === 'ft_pct') {
    return formatPercentage(value, 1);
  }

  // Whole number categories
  const wholeNumberCategories = ['pts', 'ast', 'reb', 'threes', 'stl', 'blk', 'to'];
  if (wholeNumberCategories.includes(category)) {
    return Math.round(value).toString();
  }

  // Default decimal formatting for other categories
  if (Number.isInteger(value)) {
    return value.toString();
  }

  return value.toFixed(1);
}

/**
 * Format a ranking number for display
 * @param {number} rank - The ranking position
 * @returns {string} Formatted rank string
 */
export function formatRank(rank) {
  if (!rank || isNaN(rank)) return 'N/A';

  const numRank = Number(rank);
  if (numRank <= 0) return 'N/A';

  // Add ordinal suffix
  const lastDigit = numRank % 10;
  const lastTwoDigits = numRank % 100;

  let suffix = 'th';
  if (lastTwoDigits < 11 || lastTwoDigits > 13) {
    switch (lastDigit) {
      case 1: suffix = 'st'; break;
      case 2: suffix = 'nd'; break;
      case 3: suffix = 'rd'; break;
    }
  }

  return `${numRank}${suffix}`;
}

/**
 * Format a Z-score for display
 * @param {number} zScore - The Z-score value
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted Z-score string
 */
export function formatZScore(zScore, decimals = 2) {
  if (zScore === null || zScore === undefined || isNaN(zScore)) {
    return 'N/A';
  }

  const formatted = zScore.toFixed(decimals);

  // Add + sign for positive values
  if (zScore > 0) {
    return `+${formatted}`;
  }

  return formatted;
}

/**
 * Format games played for display
 * @param {number} gp - Games played
 * @returns {string} Formatted GP string
 */
export function formatGamesPlayed(gp) {
  if (!gp || isNaN(gp)) return 'N/A';
  return gp.toString();
}

/**
 * Format team name for display
 * @param {string} team - Team abbreviation
 * @returns {string} Formatted team name
 */
export function formatTeam(team) {
  if (!team) return 'N/A';
  return team.toUpperCase();
}

/**
 * Format player position for display
 * @param {string|string[]} position - Position(s)
 * @returns {string} Formatted position string
 */
export function formatPosition(position) {
  if (!position) return 'N/A';

  if (Array.isArray(position)) {
    return position.join('/');
  }

  return position.toUpperCase();
}

/**
 * Create a display value object for a stat cell
 * @param {number} value - Raw stat value
 * @param {string} category - Category name
 * @param {boolean} isQualified - Whether player qualifies for this stat
 * @returns {Object} Display object with formatted value and qualification status
 */
export function createStatDisplay(value, category, isQualified = true) {
  return {
    raw: value,
    formatted: formatStatValue(value, category),
    isQualified,
    category
  };
}