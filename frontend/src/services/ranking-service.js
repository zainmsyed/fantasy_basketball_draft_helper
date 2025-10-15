// Core ranking service interface
// Orchestrates Z-score calculations with caching and memoization for performance

import { performanceMonitor } from '../utils/performance.js';
import { calculateCategoryStats, calculatePlayerZScores, createQualificationFilter } from '../utils/calculations.js';
import { FANTASY_CATEGORIES } from '../data/categories.js';

class RankingService {
  constructor() {
    this.cache = new Map();
    this.cacheKey = null;
  }

  /**
   * Calculate rankings for all players based on included categories
   * @param {Object[]} players - Array of player objects
   * @param {string[]} includedCategories - Categories to include in ranking
   * @returns {Object[]} Ranked players with algoRank property
   */
  calculateRankings(players, includedCategories = FANTASY_CATEGORIES) {
    return performanceMonitor.measureFunction('calculateRankings', () => {
      const cacheKey = this.generateCacheKey(players, includedCategories);

      // Check cache first
      if (this.cacheKey === cacheKey && this.cache.has('rankings')) {
        return this.cache.get('rankings');
      }

      // Clear cache if data changed
      if (this.cacheKey !== cacheKey) {
        this.cache.clear();
        this.cacheKey = cacheKey;
      }

      // Calculate category statistics
      const categoryStats = this.calculateAllCategoryStats(players, includedCategories);
      this.cache.set('categoryStats', categoryStats);

      // Calculate individual player rankings
      const playerRankings = this.calculatePlayerRankings(players, includedCategories, categoryStats);
      this.cache.set('playerRankings', playerRankings);

      // Sort and assign ranks
      const rankedPlayers = this.assignRanks(players, playerRankings);

      this.cache.set('rankings', rankedPlayers);
      return rankedPlayers;
    });
  }

  /**
   * Calculate statistics for all included categories
   * @param {Object[]} players - Array of player objects
   * @param {string[]} includedCategories - Categories to calculate
   * @returns {Object} Category statistics keyed by category name
   */
  calculateAllCategoryStats(players, includedCategories) {
    const stats = {};

    includedCategories.forEach(category => {
      const qualificationFilter = createQualificationFilter(category);
      stats[category] = calculateCategoryStats(players, category, qualificationFilter);
    });

    return stats;
  }

  /**
   * Calculate Z-scores for all players across categories
   * @param {Object[]} players - Array of player objects
   * @param {string[]} includedCategories - Categories to include
   * @param {Object} categoryStats - Pre-calculated category statistics
   * @returns {Object[]} Player ranking objects
   */
  calculatePlayerRankings(players, includedCategories, categoryStats) {
    const rankings = [];

    players.forEach(player => {
      const categoryZScores = {};
      let totalZScore = 0;

      includedCategories.forEach(category => {
        const qualificationFilter = createQualificationFilter(category);
        const qualifies = qualificationFilter(player);

        if (qualifies) {
          const zScores = calculatePlayerZScores([player], category, categoryStats[category], qualificationFilter);
          categoryZScores[category] = zScores.get(player.id) || 0;
          totalZScore += categoryZScores[category];
        } else {
          categoryZScores[category] = 0; // Neutral score for unqualified
        }
      });

      rankings.push({
        playerId: player.id,
        totalZScore,
        categoryZScores,
        qualifiesForPercentages: {
          fg_pct: createQualificationFilter('fg_pct')(player),
          ft_pct: createQualificationFilter('ft_pct')(player)
        }
      });
    });

    return rankings;
  }

  /**
   * Sort players by total Z-score and assign ranking positions
   * @param {Object[]} players - Original player array
   * @param {Object[]} playerRankings - Ranking calculations
   * @returns {Object[]} Players with algoRank assigned
   */
  assignRanks(players, playerRankings) {
    // Create lookup map for rankings
    const rankingMap = new Map();
    playerRankings.forEach(ranking => {
      rankingMap.set(ranking.playerId, ranking);
    });

    // Sort players by total Z-score (descending)
    const sortedPlayers = [...players].sort((a, b) => {
      const rankA = rankingMap.get(a.id);
      const rankB = rankingMap.get(b.id);
      return (rankB?.totalZScore || 0) - (rankA?.totalZScore || 0);
    });

    // Assign ranks, handling ties
    let currentRank = 1;
    let previousZScore = null;
    let tieCount = 0;

    sortedPlayers.forEach((player) => {
      const ranking = rankingMap.get(player.id);
      const zScore = ranking?.totalZScore || 0;

      if (previousZScore !== null && zScore === previousZScore) {
        tieCount++;
      } else {
        currentRank += tieCount;
        tieCount = 1;
        previousZScore = zScore;
      }

      player.algoRank = currentRank;
    });

    return sortedPlayers;
  }

  /**
   * Get cached category statistics
   * @returns {Object|null} Cached category stats or null if not available
   */
  getCategoryStats() {
    return this.cache.get('categoryStats') || null;
  }

  /**
   * Get cached player rankings
   * @returns {Object[]|null} Cached player rankings or null if not available
   */
  getPlayerRankings() {
    return this.cache.get('playerRankings') || null;
  }

  /**
   * Clear all cached calculations
   */
  clearCache() {
    this.cache.clear();
    this.cacheKey = null;
  }

  /**
   * Generate a cache key based on player data and included categories
   * @param {Object[]} players - Player array
   * @param {string[]} includedCategories - Included categories
   * @returns {string} Cache key string
   */
  generateCacheKey(players, includedCategories) {
    // Simple cache key based on player count and category hash
    const playerCount = players.length;
    const categoryHash = includedCategories.sort().join(',');
    return `${playerCount}-${categoryHash}`;
  }

  /**
   * Update rankings when player draft status changes
   * @param {Object[]} players - Updated player array
   * @param {string[]} includedCategories - Current included categories
   * @returns {Object[]} Updated rankings
   */
  updateRankingsForDraftChange(players, includedCategories) {
    // For draft changes, we need to recalculate ranks but can reuse category stats
    const categoryStats = this.cache.get('categoryStats');
    if (!categoryStats) {
      return this.calculateRankings(players, includedCategories);
    }

    const playerRankings = this.calculatePlayerRankings(players, includedCategories, categoryStats);
    this.cache.set('playerRankings', playerRankings);

    const rankedPlayers = this.assignRanks(players, playerRankings);
    this.cache.set('rankings', rankedPlayers);

    return rankedPlayers;
  }
}

// Export singleton instance
export const rankingService = new RankingService();
export default rankingService;