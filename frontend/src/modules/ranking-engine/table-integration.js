// Table Integration for Ranking Engine
// Integrates Z-score ranking calculations with Tabulator table display

import { rankingEngine } from '../ranking-engine/index.js';
import { performanceMonitor } from '../../utils/performance.js';

/**
 * TableIntegration - Manages integration between ranking engine and Tabulator table
 * Handles real-time ranking updates and table data synchronization
 */
export class TableIntegration {
  constructor() {
    this.table = null;
    this.currentPlayers = [];
    this.isUpdating = false;
    this.updateQueue = [];
  }

  /**
   * Initialize table integration with a Tabulator instance
   * @param {Tabulator} tableInstance - The Tabulator table instance
   */
  initialize(tableInstance) {
    if (!tableInstance) {
      throw new Error('TableIntegration: Valid table instance required');
    }

    this.table = tableInstance;

    // Set up event listeners for table updates
    this.setupEventListeners();

    console.info('TableIntegration: Initialized with ranking engine');
  }

  /**
   * Set up event listeners for table data changes
   */
  setupEventListeners() {
    if (!this.table) return;

    // Listen for data changes that might require ranking recalculation
    this.table.on('dataLoaded', () => {
      this.handleDataLoaded();
    });

    this.table.on('dataChanged', () => {
      this.handleDataChanged();
    });
  }

  /**
   * Handle table data loaded event
   */
  async handleDataLoaded() {
    const tableData = this.table.getData();
    await this.updateRankingsForData(tableData);
  }

  /**
   * Handle table data changed event
   */
  async handleDataChanged() {
    const tableData = this.table.getData();
    await this.updateRankingsForData(tableData);
  }

  /**
   * Update rankings for the provided table data
   * @param {Object[]} tableData - Current table data
   */
  async updateRankingsForData(tableData) {
    if (this.isUpdating) {
      // Queue the update if one is already in progress
      this.updateQueue.push(tableData);
      return;
    }

    this.isUpdating = true;

    try {
      await performanceMonitor.measureAsyncFunction('TableIntegration.updateRankingsForData', async () => {
        // Convert table data to player format expected by ranking engine
        const players = this.convertTableDataToPlayers(tableData);

        if (players.length === 0) {
          console.warn('TableIntegration: No players to rank');
          return;
        }

        // Calculate rankings using the ranking engine
        const rankedPlayers = rankingEngine.calculateRankings(players);

        // Update table data with new rankings
        await this.updateTableWithRankings(rankedPlayers);

        // Store current players for future reference
        this.currentPlayers = rankedPlayers;

        console.info(`TableIntegration: Updated rankings for ${rankedPlayers.length} players`);
      });
    } catch (error) {
      console.error('TableIntegration: Error updating rankings:', error);
    } finally {
      this.isUpdating = false;

      // Process any queued updates
      if (this.updateQueue.length > 0) {
        const nextData = this.updateQueue.shift();
        setTimeout(() => this.updateRankingsForData(nextData), 0);
      }
    }
  }

  /**
   * Convert table data format to player format expected by ranking engine
   * @param {Object[]} tableData - Table row data
   * @returns {Object[]} Player objects
   */
  convertTableDataToPlayers(tableData) {
    return tableData.map(row => ({
      id: row.id || `player_${Math.random()}`,
      name: row.name || '',
      team: row.team || '',
      position: this.parsePositionString(row._pos_display || row.position || ''),

      stats: {
        pts: Number(row.pts || 0),
        ast: Number(row.ast || 0),
        reb: Number(row.reb || 0),
        threes: Number(row.threes || 0),
        fg_pct: Number(row.fg_pct || 0),
        ft_pct: Number(row.ft_pct || 0),
        stl: Number(row.stl || 0),
        blk: Number(row.blk || 0),
        to: Number(row.to || 0)
      },

      gp: Number(row.gp || 0),
      fga: Number(row.fga || 0), // May not be available in table data
      fta: Number(row.fta || 0), // May not be available in table data

      expertRank: Number(row.expert_rank || 0),
      algoRank: Number(row.algo_rank || 0),

      isDrafted: Boolean(row.isDrafted || false),
      isMyTeam: Boolean(row.isMyTeam || false)
    }));
  }

  /**
   * Parse position string into position array
   * @param {string} positionStr - Position string like "PG/SG" or "C"
   * @returns {string[]} Position array
   */
  parsePositionString(positionStr) {
    if (!positionStr) return [];

    return positionStr.split('/')
      .map(pos => pos.trim())
      .filter(pos => pos.length > 0);
  }

  /**
   * Update table with new ranking data
   * @param {Object[]} rankedPlayers - Players with updated rankings
   */
  async updateTableWithRankings(rankedPlayers) {
    if (!this.table) return;

    // Create a map for quick lookup
    const rankingMap = new Map();
    rankedPlayers.forEach(player => {
      rankingMap.set(player.id, player);
    });

    // Update existing table data
    const updatedData = this.table.getData().map(row => {
      const player = rankingMap.get(row.id);
      if (player) {
        return {
          ...row,
          algo_rank: player.algoRank,
          // Could also update other fields if needed
        };
      }
      return row;
    });

    // Replace table data
    await this.table.replaceData(updatedData);
  }

  /**
   * Force a ranking recalculation
   * @param {string[]} categories - Optional category selection
   */
  async recalculateRankings(categories = null) {
    if (categories) {
      rankingEngine.setCategories(categories);
    }

    const tableData = this.table ? this.table.getData() : [];
    await this.updateRankingsForData(tableData);
  }

  /**
   * Get current ranking performance metrics
   * @returns {Object} Performance metrics
   */
  getPerformanceMetrics() {
    return {
      rankingEngine: rankingEngine.getPerformanceMetrics(),
      tableIntegration: performanceMonitor.getMetrics().filter(m =>
        m.label.includes('TableIntegration')
      )
    };
  }

  /**
   * Check if integration is ready
   * @returns {boolean} Ready status
   */
  isReady() {
    return this.table !== null && rankingEngine.isReady();
  }

  /**
   * Clean up resources
   */
  destroy() {
    if (this.table) {
      // Remove event listeners if needed
      this.table.off('dataLoaded');
      this.table.off('dataChanged');
    }

    this.table = null;
    this.currentPlayers = [];
    this.updateQueue = [];
  }
}

// Export singleton instance
export const tableIntegration = new TableIntegration();
export default tableIntegration;