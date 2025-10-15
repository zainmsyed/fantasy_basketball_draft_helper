// Ranking Engine Module
// Implements Z-score based algorithmic ranking for fantasy basketball players

import { rankingService } from '../../services/ranking-service.js';
import { performanceMonitor } from '../../utils/performance.js';
import { FANTASY_CATEGORIES } from '../../data/categories.js';

/**
 * RankingEngine - Main entry point for algorithmic ranking functionality
 * Provides high-level interface for calculating and managing player rankings
 */
class RankingEngine {
  constructor() {
    this.isInitialized = false;
    this.currentCategories = [...FANTASY_CATEGORIES];
    this.lastCalculationTime = null;
  }

  /**
   * Initialize the ranking engine
   * @returns {Promise<boolean>} Success status
   */
  async initialize() {
    try {
      // Verify dependencies are available
      if (!rankingService) {
        throw new Error('RankingService not available');
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize RankingEngine:', error);
      return false;
    }
  }

  /**
   * Calculate rankings for players using current category selection
   * @param {Object[]} players - Array of player objects
   * @returns {Object[]} Players with algoRank property added
   */
  calculateRankings(players) {
    if (!this.isInitialized) {
      throw new Error('RankingEngine not initialized');
    }

    return performanceMonitor.measureFunction('RankingEngine.calculateRankings', () => {
      const startTime = performance.now();

      const rankedPlayers = rankingService.calculateRankings(players, this.currentCategories);

      const endTime = performance.now();
      this.lastCalculationTime = endTime - startTime;

      return rankedPlayers;
    });
  }

  /**
   * Update category selection for ranking calculations
   * @param {string[]} categories - Array of category names to include
   */
  setCategories(categories) {
    this.currentCategories = [...categories];
    // Clear ranking service cache when categories change
    rankingService.clearCache();
  }

  /**
   * Get current category selection
   * @returns {string[]} Current categories
   */
  getCategories() {
    return [...this.currentCategories];
  }

  /**
   * Get performance metrics for last calculation
   * @returns {Object} Performance data
   */
  getPerformanceMetrics() {
    return {
      lastCalculationTime: this.lastCalculationTime,
      targetTime: 100, // ms
      isWithinTarget: this.lastCalculationTime ? this.lastCalculationTime < 100 : null
    };
  }

  /**
   * Check if ranking engine is ready for calculations
   * @returns {boolean} Ready status
   */
  isReady() {
    return this.isInitialized;
  }
}

// Export singleton instance
export const rankingEngine = new RankingEngine();
export default rankingEngine;