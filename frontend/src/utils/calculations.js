// Pure mathematical functions for Z-score calculations
// All functions are pure and side-effect free for reliable testing

import { checkFGQualification, checkFTQualification } from './validators.js';
import { NEGATIVE_CATEGORIES } from '../data/categories.js';

/**
 * Calculate the arithmetic mean of an array of numbers
 * @param {number[]} values - Array of numeric values
 * @returns {number} The mean value
 */
export function calculateMean(values) {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Calculate the standard deviation of an array of numbers
 * @param {number[]} values - Array of numeric values
 * @param {number} mean - Pre-calculated mean (optional, will calculate if not provided)
 * @returns {number} The standard deviation
 */
export function calculateStandardDeviation(values, mean = null) {
  if (values.length === 0) return 0;
  if (values.length === 1) return 0; // No variation with single value

  const avg = mean !== null ? mean : calculateMean(values);
  const squaredDifferences = values.map(val => Math.pow(val - avg, 2));
  const variance = calculateMean(squaredDifferences);
  return Math.sqrt(variance);
}

/**
 * Calculate Z-score for a single value
 * @param {number} value - The value to standardize
 * @param {number} mean - The mean of the population
 * @param {number} standardDeviation - The standard deviation of the population
 * @param {boolean} isNegativeCategory - Whether this category should be inverted (higher values = worse)
 * @returns {number} The Z-score
 */
export function calculateZScore(value, mean, standardDeviation, isNegativeCategory = false) {
  if (standardDeviation === 0) return 0; // No variation = neutral score

  let zScore = (value - mean) / standardDeviation;

  // Invert negative categories (turnovers, etc.)
  if (isNegativeCategory) {
    zScore = -zScore;
  }

  return zScore;
}

/**
 * Calculate statistical summary for a category across all players
 * @param {Object[]} players - Array of player objects
 * @param {string} category - The category name (e.g., 'pts', 'fg_pct')
 * @param {Function} qualificationFilter - Optional filter function for qualified players
 * @returns {Object} Statistics object with mean, stdDev, and qualified values
 */
export function calculateCategoryStats(players, category, qualificationFilter = null) {
  // Filter to qualified players if filter provided
  const qualifiedPlayers = qualificationFilter
    ? players.filter(qualificationFilter)
    : players;

  if (qualifiedPlayers.length === 0) {
    return {
      mean: 0,
      standardDeviation: 0,
      qualifiedValues: [],
      qualifiedCount: 0
    };
  }

  // Extract values for this category
  const values = qualifiedPlayers.map(player => {
    if (category === 'fg_pct' || category === 'ft_pct') {
      return player.stats[category] || 0;
    }
    return player.stats[category] || 0;
  });

  const mean = calculateMean(values);
  const standardDeviation = calculateStandardDeviation(values, mean);

  return {
    mean,
    standardDeviation,
    qualifiedValues: values,
    qualifiedCount: qualifiedPlayers.length
  };
}

/**
 * Calculate Z-scores for all players in a category
 * @param {Object[]} players - Array of player objects
 * @param {string} category - The category name
 * @param {Object} categoryStats - Pre-calculated stats for the category
 * @param {Function} qualificationFilter - Filter for qualified players
 * @returns {Map<string, number>} Map of playerId -> zScore
 */
export function calculatePlayerZScores(players, category, categoryStats, qualificationFilter = null) {
  const zScores = new Map();
  const isNegativeCategory = NEGATIVE_CATEGORIES.includes(category);

  players.forEach(player => {
    // Check if player qualifies for this category
    const qualifies = !qualificationFilter || qualificationFilter(player);

    if (qualifies) {
      const value = player.stats[category] || 0;
      const zScore = calculateZScore(value, categoryStats.mean, categoryStats.standardDeviation, isNegativeCategory);
      zScores.set(player.id, zScore);
    } else {
      // Unqualified players get neutral score
      zScores.set(player.id, 0);
    }
  });

  return zScores;
}

/**
 * Create qualification filter for percentage categories
 * @param {string} category - The category ('fg_pct' or 'ft_pct')
 * @returns {Function} Filter function that returns true for qualified players
 */
export function createQualificationFilter(category) {
  return (player) => {
    if (category === 'fg_pct') {
      return checkFGQualification(player);
    } else if (category === 'ft_pct') {
      return checkFTQualification(player);
    }
    return true; // Other categories don't have qualification requirements
  };
}

// Error handling for mathematical edge cases

/**
 * Safely calculate mean with error handling
 * @param {number[]} values - Array of numeric values
 * @returns {number} The mean value or 0 for empty/invalid arrays
 */
export function safeCalculateMean(values) {
  try {
    if (!Array.isArray(values) || values.length === 0) {
      return 0;
    }

    const validValues = values.filter(val => typeof val === 'number' && !isNaN(val));
    if (validValues.length === 0) {
      return 0;
    }

    return validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
  } catch (error) {
    console.error('Error calculating mean:', error);
    return 0;
  }
}

/**
 * Safely calculate standard deviation with error handling
 * @param {number[]} values - Array of numeric values
 * @param {number} mean - Pre-calculated mean (optional)
 * @returns {number} The standard deviation or 0 for invalid data
 */
export function safeCalculateStandardDeviation(values, mean = null) {
  try {
    if (!Array.isArray(values) || values.length === 0) {
      return 0;
    }

    if (values.length === 1) {
      return 0; // No variation with single value
    }

    const validValues = values.filter(val => typeof val === 'number' && !isNaN(val));
    if (validValues.length <= 1) {
      return 0;
    }

    const avg = mean !== null && typeof mean === 'number' && !isNaN(mean)
      ? mean
      : safeCalculateMean(validValues);

    const squaredDifferences = validValues.map(val => Math.pow(val - avg, 2));
    const variance = safeCalculateMean(squaredDifferences);
    const stdDev = Math.sqrt(variance);

    // Check for valid result
    return isNaN(stdDev) ? 0 : stdDev;
  } catch (error) {
    console.error('Error calculating standard deviation:', error);
    return 0;
  }
}

/**
 * Safely calculate Z-score with comprehensive error handling
 * @param {number} value - The value to standardize
 * @param {number} mean - The mean of the population
 * @param {number} standardDeviation - The standard deviation of the population
 * @param {boolean} isNegativeCategory - Whether this category should be inverted
 * @returns {number} The Z-score or 0 for invalid inputs
 */
export function safeCalculateZScore(value, mean, standardDeviation, isNegativeCategory = false) {
  try {
    // Validate inputs
    if (typeof value !== 'number' || isNaN(value)) {
      return 0;
    }

    if (typeof mean !== 'number' || isNaN(mean)) {
      return 0;
    }

    if (typeof standardDeviation !== 'number' || isNaN(standardDeviation) || standardDeviation === 0) {
      return 0; // No variation = neutral score
    }

    let zScore = (value - mean) / standardDeviation;

    // Check for valid result
    if (!isFinite(zScore) || isNaN(zScore)) {
      return 0;
    }

    // Invert negative categories (turnovers, etc.)
    if (isNegativeCategory) {
      zScore = -zScore;
    }

    return zScore;
  } catch (error) {
    console.error('Error calculating Z-score:', error);
    return 0;
  }
}

/**
 * Safely calculate category stats with error handling
 * @param {Object[]} players - Array of player objects
 * @param {string} category - The category name
 * @param {Function} qualificationFilter - Optional filter function
 * @returns {Object} Statistics object with safe fallbacks
 */
export function safeCalculateCategoryStats(players, category, qualificationFilter = null) {
  try {
    if (!Array.isArray(players) || players.length === 0) {
      return {
        mean: 0,
        standardDeviation: 0,
        qualifiedValues: [],
        qualifiedCount: 0,
        error: 'No players provided'
      };
    }

    // Filter to qualified players if filter provided
    const qualifiedPlayers = qualificationFilter
      ? players.filter(player => {
          try {
            return qualificationFilter(player);
          } catch (error) {
            console.warn(`Error applying qualification filter for player ${player?.id}:`, error);
            return false;
          }
        })
      : players;

    if (qualifiedPlayers.length === 0) {
      return {
        mean: 0,
        standardDeviation: 0,
        qualifiedValues: [],
        qualifiedCount: 0,
        error: 'No qualified players'
      };
    }

    // Extract values safely
    const values = qualifiedPlayers.map(player => {
      try {
        if (category === 'fg_pct' || category === 'ft_pct') {
          const val = player.stats?.[category];
          return (typeof val === 'number' && !isNaN(val)) ? val : 0;
        }
        const val = player.stats?.[category];
        return (typeof val === 'number' && !isNaN(val)) ? val : 0;
      } catch (error) {
        console.warn(`Error extracting ${category} for player ${player?.id}:`, error);
        return 0;
      }
    });

    const mean = safeCalculateMean(values);
    const standardDeviation = safeCalculateStandardDeviation(values, mean);

    return {
      mean,
      standardDeviation,
      qualifiedValues: values,
      qualifiedCount: qualifiedPlayers.length
    };
  } catch (error) {
    console.error(`Error calculating category stats for ${category}:`, error);
    return {
      mean: 0,
      standardDeviation: 0,
      qualifiedValues: [],
      qualifiedCount: 0,
      error: error.message
    };
  }
}

/**
 * Validate calculation inputs before processing
 * @param {Object[]} players - Player array
 * @param {string[]} categories - Category array
 * @returns {Object} Validation result
 */
export function validateCalculationInputs(players, categories) {
  const errors = [];

  if (!Array.isArray(players)) {
    errors.push('Players must be an array');
  } else if (players.length === 0) {
    errors.push('Players array cannot be empty');
  }

  if (!Array.isArray(categories)) {
    errors.push('Categories must be an array');
  } else if (categories.length === 0) {
    errors.push('Categories array cannot be empty');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}