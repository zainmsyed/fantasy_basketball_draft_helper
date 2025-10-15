// Player Ranking Logic
// Implements the core ranking calculations and data structures

import { calculateCategoryStats, calculatePlayerZScores, createQualificationFilter } from '../../utils/calculations.js';
import { FANTASY_CATEGORIES, NEGATIVE_CATEGORIES } from '../../data/categories.js';

/**
 * PlayerRankingCalculator - Handles individual player ranking calculations
 * Provides methods for calculating Z-scores and rankings for players
 */
export class PlayerRankingCalculator {
  constructor() {
    this.categoryStats = new Map();
  }

  /**
   * Calculate comprehensive ranking for a single player
   * @param {Object} player - Player object
   * @param {Object} categoryStats - Pre-calculated category statistics
   * @param {string[]} includedCategories - Categories to include in calculation
   * @returns {Object} Player ranking data
   */
  calculatePlayerRanking(player, categoryStats, includedCategories = FANTASY_CATEGORIES) {
    const categoryZScores = {};
    let totalZScore = 0;
    let validCategories = 0;

    includedCategories.forEach(category => {
      const stats = categoryStats[category];
      if (!stats) {
        console.warn(`No stats available for category: ${category}`);
        return;
      }

      const qualificationFilter = createQualificationFilter(category);
      const qualifies = qualificationFilter(player);

      if (qualifies) {
        const zScores = calculatePlayerZScores([player], category, stats, qualificationFilter);
        const zScore = zScores.get(player.id) || 0;
        categoryZScores[category] = zScore;
        totalZScore += zScore;
        validCategories++;
      } else {
        categoryZScores[category] = 0; // Neutral score for unqualified
      }
    });

    // Calculate average Z-score across valid categories
    const averageZScore = validCategories > 0 ? totalZScore / validCategories : 0;

    return {
      playerId: player.id,
      totalZScore,
      averageZScore,
      categoryZScores,
      validCategories,
      qualifiesForPercentages: {
        fg_pct: createQualificationFilter('fg_pct')(player),
        ft_pct: createQualificationFilter('ft_pct')(player)
      }
    };
  }

  /**
   * Calculate rankings for multiple players
   * @param {Object[]} players - Array of player objects
   * @param {string[]} includedCategories - Categories to include
   * @returns {Object[]} Array of player ranking objects
   */
  calculateMultiplePlayerRankings(players, includedCategories = FANTASY_CATEGORIES) {
    // Calculate category statistics
    const categoryStats = {};
    includedCategories.forEach(category => {
      const qualificationFilter = createQualificationFilter(category);
      categoryStats[category] = calculateCategoryStats(players, category, qualificationFilter);
    });

    // Calculate rankings for each player
    const rankings = players.map(player =>
      this.calculatePlayerRanking(player, categoryStats, includedCategories)
    );

    return rankings;
  }

  /**
   * Sort players by ranking and assign position numbers
   * @param {Object[]} players - Original player array
   * @param {Object[]} rankings - Ranking calculations
   * @returns {Object[]} Players with ranking positions assigned
   */
  assignRankingPositions(players, rankings) {
    // Create lookup map for rankings
    const rankingMap = new Map();
    rankings.forEach(ranking => {
      rankingMap.set(ranking.playerId, ranking);
    });

    // Sort players by total Z-score (descending)
    const sortedPlayers = [...players].sort((a, b) => {
      const rankA = rankingMap.get(a.id);
      const rankB = rankingMap.get(b.id);
      const scoreA = rankA?.totalZScore || 0;
      const scoreB = rankB?.totalZScore || 0;
      return scoreB - scoreA;
    });

    // Assign ranks, handling ties
    let currentRank = 1;
    let previousScore = null;
    let tieCount = 0;

    sortedPlayers.forEach((player) => {
      const ranking = rankingMap.get(player.id);
      const score = ranking?.totalZScore || 0;

      if (previousScore !== null && score === previousScore) {
        tieCount++;
      } else {
        currentRank += tieCount;
        tieCount = 1;
        previousScore = score;
      }

      player.algoRank = currentRank;
      player.rankingData = ranking; // Attach detailed ranking data
    });

    return sortedPlayers;
  }

  /**
   * Get category contribution breakdown for a player
   * @param {Object} playerRanking - Player ranking object
   * @returns {Object} Category contribution analysis
   */
  getCategoryBreakdown(playerRanking) {
    const { categoryZScores, validCategories } = playerRanking;

    const contributions = {};
    let totalPositive = 0;
    let totalNegative = 0;

    Object.entries(categoryZScores).forEach(([category, zScore]) => {
      contributions[category] = {
        zScore,
        contribution: validCategories > 0 ? zScore / validCategories : 0,
        isNegativeCategory: NEGATIVE_CATEGORIES.includes(category)
      };

      if (zScore > 0) totalPositive += zScore;
      else if (zScore < 0) totalNegative += Math.abs(zScore);
    });

    return {
      contributions,
      totalPositive,
      totalNegative,
      netContribution: totalPositive - totalNegative,
      strongestCategory: this.findExtremeCategory(contributions, 'max'),
      weakestCategory: this.findExtremeCategory(contributions, 'min')
    };
  }

  /**
   * Find the category with extreme Z-score
   * @param {Object} contributions - Category contributions
   * @param {string} type - 'max' or 'min'
   * @returns {string|null} Category name or null
   */
  findExtremeCategory(contributions, type) {
    let extremeCategory = null;
    let extremeValue = type === 'max' ? -Infinity : Infinity;

    Object.entries(contributions).forEach(([category, data]) => {
      const value = data.zScore;
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
   * Validate ranking calculation inputs
   * @param {Object[]} players - Player array
   * @param {string[]} categories - Category array
   * @returns {Object} Validation result
   */
  validateInputs(players, categories) {
    const errors = [];

    if (!Array.isArray(players) || players.length === 0) {
      errors.push('Players array must be non-empty');
    }

    if (!Array.isArray(categories) || categories.length === 0) {
      errors.push('Categories array must be non-empty');
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
export const playerRankingCalculator = new PlayerRankingCalculator();
export default playerRankingCalculator;