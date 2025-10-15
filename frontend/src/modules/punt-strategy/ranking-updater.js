// Real-time Ranking Updates
// Handles dynamic ranking recalculation when punt strategies change

import { rankingEngine } from '../ranking-engine/index.js';
import { performanceMonitor } from '../../utils/performance.js';

/**
 * RankingUpdater - Manages real-time ranking updates in response to strategy changes
 */
export class RankingUpdater {
  constructor() {
    this.currentPlayers = [];
    this.currentRankings = [];
    this.updateCallbacks = [];
    this.isUpdating = false;
  }

  /**
   * Initialize the ranking updater
   * @param {Object[]} initialPlayers - Initial player data
   */
  initialize(initialPlayers = []) {
    this.currentPlayers = [...initialPlayers];
    this.updateRankings();
  }

  /**
   * Update player data
   * @param {Object[]} players - New player data
   */
  updatePlayers(players) {
    this.currentPlayers = [...players];
    this.updateRankings();
  }

  /**
   * Recalculate rankings with current strategy
   * @returns {Object[]} Updated rankings
   */
  updateRankings() {
    if (this.isUpdating || this.currentPlayers.length === 0) {
      return this.currentRankings;
    }

    return performanceMonitor.measureFunction('RankingUpdater.updateRankings', () => {
      try {
        this.isUpdating = true;

        // Calculate new rankings
        const newRankings = rankingEngine.calculateRankings(this.currentPlayers);
        this.currentRankings = newRankings;

        // Notify subscribers
        this.notifyUpdateCallbacks(newRankings);

        return newRankings;
      } catch (error) {
        console.error('Failed to update rankings:', error);
        return this.currentRankings;
      } finally {
        this.isUpdating = false;
      }
    });
  }

  /**
   * Get current rankings
   * @returns {Object[]} Current rankings
   */
  getCurrentRankings() {
    return [...this.currentRankings];
  }

  /**
   * Register a callback for ranking updates
   * @param {Function} callback - Callback function to call when rankings update
   * @returns {Function} Unsubscribe function
   */
  onUpdate(callback) {
    this.updateCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.updateCallbacks.indexOf(callback);
      if (index > -1) {
        this.updateCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Notify all update callbacks
   * @param {Object[]} rankings - Updated rankings
   */
  notifyUpdateCallbacks(rankings) {
    this.updateCallbacks.forEach(callback => {
      try {
        callback(rankings);
      } catch (error) {
        console.error('Error in ranking update callback:', error);
      }
    });
  }

  /**
   * Clear all rankings and reset state
   */
  clear() {
    this.currentPlayers = [];
    this.currentRankings = [];
    this.updateCallbacks = [];
    this.isUpdating = false;
  }

  /**
   * Get performance metrics
   * @returns {Object} Performance data
   */
  getPerformanceMetrics() {
    return {
      playerCount: this.currentPlayers.length,
      rankingCount: this.currentRankings.length,
      callbackCount: this.updateCallbacks.length,
      isUpdating: this.isUpdating,
      engineMetrics: rankingEngine.getPerformanceMetrics()
    };
  }
}

// Export singleton instance
export const rankingUpdater = new RankingUpdater();
export default rankingUpdater;