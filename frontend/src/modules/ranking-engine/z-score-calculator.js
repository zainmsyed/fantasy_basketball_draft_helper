// Z-Score Calculator Orchestration
// Coordinates Z-score calculations across all categories and players

import { calculateCategoryStats, calculatePlayerZScores, createQualificationFilter } from '../../utils/calculations.js';
import { FANTASY_CATEGORIES } from '../../data/categories.js';
import { performanceMonitor } from '../../utils/performance.js';

/**
 * ZScoreCalculator - Orchestrates Z-score calculations for ranking algorithm
 * Handles the coordination of statistical calculations across all fantasy categories
 */
export class ZScoreCalculator {
  constructor() {
    this.categoryStatsCache = new Map();
    this.calculationHistory = [];
  }

  /**
   * Calculate Z-scores for all players across all categories
   * @param {Object[]} players - Array of player objects
   * @param {string[]} includedCategories - Categories to include in calculations
   * @returns {Object} Calculation results with category stats and player Z-scores
   */
  calculateAllZScores(players, includedCategories = FANTASY_CATEGORIES) {
    return performanceMonitor.measureFunction('ZScoreCalculator.calculateAllZScores', () => {
      const startTime = performance.now();

      // Validate inputs
      const validation = this.validateCalculationInputs(players, includedCategories);
      if (!validation.isValid) {
        throw new Error(`Invalid inputs: ${validation.errors.join(', ')}`);
      }

      // Calculate category statistics
      const categoryStats = this.calculateCategoryStatistics(players, includedCategories);

      // Calculate player Z-scores for each category
      const playerZScores = this.calculatePlayerZScores(players, includedCategories, categoryStats);

      // Calculate composite rankings
      const compositeRankings = this.calculateCompositeRankings(playerZScores, includedCategories);

      const endTime = performance.now();
      const duration = endTime - startTime;

      const result = {
        categoryStats,
        playerZScores,
        compositeRankings,
        metadata: {
          playerCount: players.length,
          categoryCount: includedCategories.length,
          calculationTime: duration,
          timestamp: new Date().toISOString()
        }
      };

      // Store in history for debugging/analysis
      this.calculationHistory.push(result);

      return result;
    });
  }

  /**
   * Calculate statistics for each included category
   * @param {Object[]} players - Player array
   * @param {string[]} includedCategories - Categories to calculate
   * @returns {Object} Category statistics keyed by category name
   */
  calculateCategoryStatistics(players, includedCategories) {
    const stats = {};
    const cacheKey = this.generateCacheKey(players, includedCategories);

    // Check cache first
    if (this.categoryStatsCache.has(cacheKey)) {
      return this.categoryStatsCache.get(cacheKey);
    }

    includedCategories.forEach(category => {
      const qualificationFilter = createQualificationFilter(category);
      stats[category] = calculateCategoryStats(players, category, qualificationFilter);
    });

    // Cache the results
    this.categoryStatsCache.set(cacheKey, stats);

    return stats;
  }

  /**
   * Calculate Z-scores for all players in each category
   * @param {Object[]} players - Player array
   * @param {string[]} includedCategories - Categories included
   * @param {Object} categoryStats - Pre-calculated category statistics
   * @returns {Map} Player Z-scores by category
   */
  calculatePlayerZScores(players, includedCategories, categoryStats) {
    const allPlayerZScores = new Map();

    includedCategories.forEach(category => {
      const stats = categoryStats[category];
      const qualificationFilter = createQualificationFilter(category);
      const categoryZScores = calculatePlayerZScores(players, category, stats, qualificationFilter);

              // Merge into master map
        categoryZScores.forEach((zScore, playerId) => {
          if (!allPlayerZScores.has(playerId)) {
            allPlayerZScores.set(playerId, {});
          }
          const playerScores = allPlayerZScores.get(playerId);
          playerScores[category] = zScore;
        });
    });

    return allPlayerZScores;
  }

  /**
   * Calculate composite rankings by combining Z-scores across categories
   * @param {Map} playerZScores - Player Z-scores by category
   * @param {string[]} includedCategories - Categories included in calculation
   * @returns {Object[]} Composite ranking objects
   */
  calculateCompositeRankings(playerZScores, includedCategories) {
    const rankings = [];

    playerZScores.forEach((categoryScores, playerId) => {
      let totalZScore = 0;
      let validCategories = 0;

      includedCategories.forEach(category => {
        const zScore = categoryScores[category] || 0;
        if (zScore !== 0 || Object.prototype.hasOwnProperty.call(categoryScores, category)) {
          totalZScore += zScore;
          validCategories++;
        }
      });

      const averageZScore = validCategories > 0 ? totalZScore / validCategories : 0;

      rankings.push({
        playerId,
        totalZScore,
        averageZScore,
        categoryZScores: categoryScores,
        validCategories,
        includedCategories: includedCategories.length
      });
    });

    // Sort by total Z-score descending
    rankings.sort((a, b) => b.totalZScore - a.totalZScore);

    // Assign ranking positions
    rankings.forEach((ranking, index) => {
      ranking.rank = index + 1;
    });

    return rankings;
  }

  /**
   * Recalculate rankings when categories change
   * @param {Object[]} players - Player array
   * @param {string[]} newIncludedCategories - New category selection
   * @returns {Object} Updated calculation results
   */
  recalculateForCategories(players, newIncludedCategories) {
    // Clear relevant cache
    this.clearCache();

    return this.calculateAllZScores(players, newIncludedCategories);
  }

  /**
   * Get calculation history for debugging
   * @param {number} limit - Maximum number of entries to return
   * @returns {Object[]} Calculation history
   */
  getCalculationHistory(limit = 10) {
    return this.calculationHistory.slice(-limit);
  }

  /**
   * Clear calculation cache
   */
  clearCache() {
    this.categoryStatsCache.clear();
  }

  /**
   * Generate cache key for category statistics
   * @param {Object[]} players - Player array
   * @param {string[]} categories - Category array
   * @returns {string} Cache key
   */
  generateCacheKey(players, categories) {
    const playerHash = players.length.toString();
    const categoryHash = categories.sort().join(',');
    return `${playerHash}-${categoryHash}`;
  }

  /**
   * Validate calculation inputs
   * @param {Object[]} players - Player array
   * @param {string[]} categories - Category array
   * @returns {Object} Validation result
   */
  validateCalculationInputs(players, categories) {
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

    // Check for invalid categories
    const invalidCategories = categories.filter(cat => !FANTASY_CATEGORIES.includes(cat));
    if (invalidCategories.length > 0) {
      errors.push(`Invalid categories: ${invalidCategories.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get performance metrics
   * @returns {Object} Performance data
   */
  getPerformanceMetrics() {
    const history = this.calculationHistory;
    if (history.length === 0) return null;

    const times = history.map(h => h.metadata.calculationTime);
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const maxTime = Math.max(...times);
    const minTime = Math.min(...times);

    return {
      averageTime: avgTime,
      maxTime,
      minTime,
      sampleCount: history.length,
      targetTime: 100, // ms
      withinTarget: avgTime < 100
    };
  }
}

// Export singleton instance
export const zScoreCalculator = new ZScoreCalculator();
export default zScoreCalculator;