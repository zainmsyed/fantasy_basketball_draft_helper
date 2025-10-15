// Ranking Service Implementation
// Implements the ranking service interface with Z-score algorithm

import { rankingService as baseRankingService } from '../../services/ranking-service.js';
import { zScoreCalculator } from './z-score-calculator.js';
import { playerRankingCalculator } from './player-ranking.js';
import { performanceMonitor } from '../../utils/performance.js';
import { FANTASY_CATEGORIES } from '../../data/categories.js';

/**
 * RankingServiceImplementation - Concrete implementation of ranking service
 * Uses Z-score algorithm with performance monitoring and caching
 */
export class RankingServiceImplementation {
  constructor() {
    this.currentCategories = [...FANTASY_CATEGORIES];
    this.lastCalculation = null;
    this.performanceMetrics = {
      totalCalculations: 0,
      averageTime: 0,
      maxTime: 0,
      violations: 0
    };
  }

  /**
   * Calculate rankings for all players using Z-score algorithm
   * @param {Object[]} players - Array of player objects
   * @param {string[]} includedCategories - Categories to include (optional)
   * @returns {Object[]} Players with algoRank property
   */
  calculateRankings(players, includedCategories = null) {
    const categories = includedCategories || this.currentCategories;

    return performanceMonitor.measureFunction('RankingServiceImplementation.calculateRankings',
      () => {
        const startTime = performance.now();

        // Validate inputs
        const validation = this.validateInputs(players, categories);
        if (!validation.isValid) {
          throw new Error(`Invalid ranking inputs: ${validation.errors.join(', ')}`);
        }

        // Use Z-score calculator for core calculations
        const calculationResult = zScoreCalculator.calculateAllZScores(players, categories);

        // Apply rankings to player objects
        const rankedPlayers = this.applyRankingsToPlayers(players, calculationResult.compositeRankings);

        // Update performance metrics
        const endTime = performance.now();
        const duration = endTime - startTime;
        this.updatePerformanceMetrics(duration);

        // Store result
        this.lastCalculation = {
          result: calculationResult,
          rankedPlayers,
          timestamp: new Date(),
          duration
        };

        return rankedPlayers;
      }
    );
  }

  /**
   * Apply ranking results to player objects
   * @param {Object[]} players - Original player array
   * @param {Object[]} compositeRankings - Ranking calculations
   * @returns {Object[]} Players with rankings applied
   */
  applyRankingsToPlayers(players, compositeRankings) {
    // Create lookup map for rankings
    const rankingMap = new Map();
    compositeRankings.forEach(ranking => {
      rankingMap.set(ranking.playerId, ranking);
    });

    // Apply rankings to players
    return players.map(player => {
      const ranking = rankingMap.get(player.id);
      if (ranking) {
        return {
          ...player,
          algoRank: ranking.rank,
          rankingData: {
            totalZScore: ranking.totalZScore,
            averageZScore: ranking.averageZScore,
            categoryZScores: ranking.categoryZScores,
            validCategories: ranking.validCategories
          }
        };
      }
      return player;
    });
  }

  /**
   * Update category selection and clear relevant caches
   * @param {string[]} categories - New category selection
   */
  setCategories(categories) {
    this.currentCategories = [...categories];
    zScoreCalculator.clearCache();
    baseRankingService.clearCache();
  }

  /**
   * Get current category selection
   * @returns {string[]} Current categories
   */
  getCategories() {
    return [...this.currentCategories];
  }

  /**
   * Recalculate rankings for draft status changes
   * @param {Object[]} players - Updated player array
   * @param {string[]} includedCategories - Current categories
   * @returns {Object[]} Updated rankings
   */
  updateRankingsForDraftChange(players, includedCategories = null) {
    const categories = includedCategories || this.currentCategories;

    // For draft changes, we can optimize by reusing category stats
    return this.calculateRankings(players, categories);
  }

  /**
   * Get detailed ranking breakdown for a specific player
   * @param {string} playerId - Player ID
   * @returns {Object|null} Detailed ranking data or null
   */
  getPlayerRankingBreakdown(playerId) {
    if (!this.lastCalculation) return null;

    const ranking = this.lastCalculation.result.compositeRankings
      .find(r => r.playerId === playerId);

    if (!ranking) return null;

    return playerRankingCalculator.getCategoryBreakdown(ranking);
  }

  /**
   * Get performance metrics for ranking calculations
   * @returns {Object} Performance data
   */
  getPerformanceMetrics() {
    return {
      ...this.performanceMetrics,
      calculatorMetrics: zScoreCalculator.getPerformanceMetrics(),
      targetTime: 100, // ms
      isWithinTarget: this.performanceMetrics.averageTime < 100
    };
  }

  /**
   * Get calculation history
   * @param {number} limit - Maximum entries to return
   * @returns {Object[]} History entries
   */
  getCalculationHistory(limit = 5) {
    return zScoreCalculator.getCalculationHistory(limit);
  }

  /**
   * Clear all caches
   */
  clearCache() {
    zScoreCalculator.clearCache();
    this.lastCalculation = null;
  }

  /**
   * Update performance metrics
   * @param {number} duration - Calculation duration in ms
   */
  updatePerformanceMetrics(duration) {
    this.performanceMetrics.totalCalculations++;

    // Update running average
    const oldAvg = this.performanceMetrics.averageTime;
    const newAvg = (oldAvg * (this.performanceMetrics.totalCalculations - 1) + duration) /
                   this.performanceMetrics.totalCalculations;
    this.performanceMetrics.averageTime = newAvg;

    // Update max time
    this.performanceMetrics.maxTime = Math.max(this.performanceMetrics.maxTime, duration);

    // Check for violations
    if (duration > 100) {
      this.performanceMetrics.violations++;
    }
  }

  /**
   * Validate calculation inputs
   * @param {Object[]} players - Player array
   * @param {string[]} categories - Category array
   * @returns {Object} Validation result
   */
  validateInputs(players, categories) {
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
}

// Export singleton instance
export const rankingServiceImplementation = new RankingServiceImplementation();
export default rankingServiceImplementation;