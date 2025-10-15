// Equal Weighting Logic for Fantasy Basketball Rankings
// Implements the core ranking algorithm with equal weighting across all 9 categories
// Handles turnover inversion and ensures mathematical accuracy

import { FANTASY_CATEGORIES, NEGATIVE_CATEGORIES } from '../../data/categories.js';
import { safeCalculateZScore } from '../../utils/calculations.js';
import { performanceMonitor } from '../../utils/performance.js';

/**
 * EqualWeightingCalculator - Implements equal weighting ranking algorithm
 * All 9 fantasy categories contribute equally to the final ranking
 */
export class EqualWeightingCalculator {
  constructor() {
    this.categoryWeights = this.initializeWeights();
    this.invertedCategories = new Set(NEGATIVE_CATEGORIES);
  }

  /**
   * Initialize equal weights for all categories
   * @returns {Object} Category weights (all equal)
   */
  initializeWeights() {
    const weight = 1 / FANTASY_CATEGORIES.length; // Equal weighting
    const weights = {};

    FANTASY_CATEGORIES.forEach(category => {
      weights[category] = weight;
    });

    return weights;
  }

  /**
   * Calculate equal-weighted ranking for a player
   * @param {Object} player - Player object with stats
   * @param {Object} categoryStats - Pre-calculated category statistics
   * @param {string[]} includedCategories - Categories to include in calculation
   * @returns {Object} Ranking calculation result
   */
  calculateEqualWeightedRanking(player, categoryStats, includedCategories = FANTASY_CATEGORIES) {
    return performanceMonitor.measureFunction('EqualWeightingCalculator.calculateEqualWeightedRanking', () => {
      const categoryZScores = {};
      let totalWeightedScore = 0;
      let validCategories = 0;

      includedCategories.forEach(category => {
        const weight = this.categoryWeights[category] || 0;
        const stats = categoryStats[category];

        if (!stats || stats.qualifiedCount === 0) {
          console.warn(`No valid statistics for category: ${category}`);
          categoryZScores[category] = 0;
          return;
        }

        // Get player's stat value
        const rawValue = player.stats[category] || 0;

        // Calculate Z-score with safety checks
        const zScore = safeCalculateZScore(
          rawValue,
          stats.mean,
          stats.standardDeviation,
          this.invertedCategories.has(category)
        );

        categoryZScores[category] = zScore;

        // Apply equal weighting
        totalWeightedScore += zScore * weight;
        validCategories++;
      });

      // Calculate final ranking score
      const finalScore = validCategories > 0 ? totalWeightedScore : 0;

      return {
        playerId: player.id,
        totalWeightedScore: finalScore,
        categoryZScores,
        categoryWeights: { ...this.categoryWeights },
        validCategories,
        includedCategories: includedCategories.length,
        algorithm: 'equal_weighting',
        version: '1.0'
      };
    });
  }

  /**
   * Calculate rankings for multiple players using equal weighting
   * @param {Object[]} players - Array of player objects
   * @param {Object} categoryStats - Pre-calculated category statistics
   * @param {string[]} includedCategories - Categories to include
   * @returns {Object[]} Ranking results for all players
   */
  calculateMultipleRankings(players, categoryStats, includedCategories = FANTASY_CATEGORIES) {
    return performanceMonitor.measureFunction('EqualWeightingCalculator.calculateMultipleRankings', () => {
      const rankings = players.map(player =>
        this.calculateEqualWeightedRanking(player, categoryStats, includedCategories)
      );

      // Sort by total weighted score (descending - higher Z-scores are better)
      rankings.sort((a, b) => b.totalWeightedScore - a.totalWeightedScore);

      // Assign ranking positions
      rankings.forEach((ranking, index) => {
        ranking.rank = index + 1;
        ranking.percentile = ((players.length - index) / players.length) * 100;
      });

      return rankings;
    });
  }

  /**
   * Handle turnover inversion logic
   * Turnovers are negative categories - higher values are worse
   * @param {number} turnoverValue - Raw turnover value
   * @param {number} mean - Category mean
   * @param {number} standardDeviation - Category standard deviation
   * @returns {number} Inverted Z-score
   */
  calculateInvertedTurnoverZScore(turnoverValue, mean, standardDeviation) {
    // For turnovers: higher values are worse, so we invert the Z-score
    // A player with fewer turnovers than average gets a positive Z-score
    const zScore = safeCalculateZScore(turnoverValue, mean, standardDeviation, false);
    return -zScore; // Invert so fewer turnovers = higher (better) score
  }

  /**
   * Validate that all categories have equal weighting
   * @returns {boolean} True if all weights are equal
   */
  validateEqualWeighting() {
    const weights = Object.values(this.categoryWeights);
    const firstWeight = weights[0];

    return weights.every(weight => Math.abs(weight - firstWeight) < 0.0001); // Allow for floating point precision
  }

  /**
   * Get category contribution breakdown
   * @param {Object} ranking - Player ranking object
   * @returns {Object} Contribution analysis
   */
  getCategoryContributions(ranking) {
    const { categoryZScores, categoryWeights } = ranking;
    const contributions = {};

    Object.entries(categoryZScores).forEach(([category, zScore]) => {
      const weight = categoryWeights[category] || 0;
      contributions[category] = {
        zScore,
        weight,
        weightedContribution: zScore * weight,
        isNegativeCategory: this.invertedCategories.has(category),
        percentageOfTotal: 0 // Will be calculated after all contributions
      };
    });

    // Calculate percentage contributions
    const totalWeightedScore = ranking.totalWeightedScore;
    if (totalWeightedScore !== 0) {
      Object.values(contributions).forEach(contrib => {
        contrib.percentageOfTotal = (contrib.weightedContribution / totalWeightedScore) * 100;
      });
    }

    return {
      contributions,
      totalWeightedScore: ranking.totalWeightedScore,
      strongestCategory: this.findExtremeCategory(contributions, 'weightedContribution', 'max'),
      weakestCategory: this.findExtremeCategory(contributions, 'weightedContribution', 'min')
    };
  }

  /**
   * Find category with extreme value
   * @param {Object} contributions - Category contributions
   * @param {string} property - Property to compare
   * @param {string} type - 'max' or 'min'
   * @returns {string|null} Category name
   */
  findExtremeCategory(contributions, property, type) {
    let extremeCategory = null;
    let extremeValue = type === 'max' ? -Infinity : Infinity;

    Object.entries(contributions).forEach(([category, data]) => {
      const value = data[property];
      if (type === 'max' && value > extremeValue) {
        extremeValue = value;
        extremeCategory = category;
      } else if (type === 'min' && value < extremeValue) {
        extremeValue = value;
        extremeCategory = category;
      }
    });

    return extremeCategory;
  }

  /**
   * Get algorithm metadata
   * @returns {Object} Algorithm information
   */
  getAlgorithmMetadata() {
    return {
      name: 'Equal Weighting Z-Score Algorithm',
      version: '1.0',
      description: 'All 9 fantasy categories contribute equally to ranking using standardized Z-scores',
      categories: FANTASY_CATEGORIES,
      weights: this.categoryWeights,
      negativeCategories: Array.from(this.invertedCategories),
      equalWeighting: this.validateEqualWeighting()
    };
  }

  /**
   * Recalculate rankings when categories change
   * @param {Object[]} players - Player array
   * @param {string[]} newIncludedCategories - New category selection
   * @param {Object} categoryStats - Category statistics
   * @returns {Object[]} Updated rankings
   */
  recalculateForCategories(players, newIncludedCategories, categoryStats) {
    // Update weights for included categories only
    const newWeights = {};
    const weight = 1 / newIncludedCategories.length;

    newIncludedCategories.forEach(category => {
      newWeights[category] = weight;
    });

    this.categoryWeights = newWeights;

    return this.calculateMultipleRankings(players, categoryStats, newIncludedCategories);
  }
}

// Export singleton instance
export const equalWeightingCalculator = new EqualWeightingCalculator();
export default equalWeightingCalculator;