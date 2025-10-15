// LocalForage storage service for punt strategy persistence
// Provides persistent storage without external dependencies

import localforage from 'localforage';

const STORAGE_KEYS = {
  PUNT_STRATEGIES: 'draft_helper_punt_strategies',
  ACTIVE_STRATEGY: 'draft_helper_active_strategy',
  STAT_DISPLAY_CONFIG: 'draft_helper_stat_display',
  CALCULATION_CACHE: 'draft_helper_calculation_cache'
};

class StorageService {
  constructor() {
    // Configure LocalForage
    localforage.config({
      name: 'DraftHelper',
      version: 1.0,
      storeName: 'draft_helper_store'
    });

    this.isReady = false;
    this.initPromise = this.initialize();
  }

  async initialize() {
    try {
      // Test storage availability
      await localforage.setItem('test', 'test');
      await localforage.removeItem('test');
      this.isReady = true;
    } catch (error) {
      console.warn('LocalForage storage not available:', error);
      this.isReady = false;
    }
  }

  async waitForReady() {
    await this.initPromise;
    return this.isReady;
  }

  // Punt Strategy Management

  /**
   * Save a punt strategy
   * @param {Object} strategy - Strategy object to save
   * @returns {Promise<boolean>} Success status
   */
  async savePuntStrategy(strategy) {
    if (!await this.waitForReady()) return false;

    try {
      const strategies = await this.getPuntStrategies();
      const existingIndex = strategies.findIndex(s => s.id === strategy.id);

      if (existingIndex >= 0) {
        strategies[existingIndex] = { ...strategy, updatedAt: new Date() };
      } else {
        strategies.push({ ...strategy, createdAt: new Date() });
      }

      await localforage.setItem(STORAGE_KEYS.PUNT_STRATEGIES, strategies);
      return true;
    } catch (error) {
      console.error('Failed to save punt strategy:', error);
      return false;
    }
  }

  /**
   * Get all saved punt strategies
   * @returns {Promise<Object[]>} Array of strategy objects
   */
  async getPuntStrategies() {
    if (!await this.waitForReady()) return [];

    try {
      const strategies = await localforage.getItem(STORAGE_KEYS.PUNT_STRATEGIES);
      return strategies || [];
    } catch (error) {
      console.error('Failed to get punt strategies:', error);
      return [];
    }
  }

  /**
   * Delete a punt strategy by ID
   * @param {string} strategyId - Strategy ID to delete
   * @returns {Promise<boolean>} Success status
   */
  async deletePuntStrategy(strategyId) {
    if (!await this.waitForReady()) return false;

    try {
      const strategies = await this.getPuntStrategies();
      const filteredStrategies = strategies.filter(s => s.id !== strategyId);
      await localforage.setItem(STORAGE_KEYS.PUNT_STRATEGIES, filteredStrategies);
      return true;
    } catch (error) {
      console.error('Failed to delete punt strategy:', error);
      return false;
    }
  }

  /**
   * Set the active punt strategy
   * @param {string} strategyId - Strategy ID to activate
   * @returns {Promise<boolean>} Success status
   */
  async setActiveStrategy(strategyId) {
    if (!await this.waitForReady()) return false;

    try {
      await localforage.setItem(STORAGE_KEYS.ACTIVE_STRATEGY, strategyId);
      return true;
    } catch (error) {
      console.error('Failed to set active strategy:', error);
      return false;
    }
  }

  /**
   * Get the active punt strategy ID
   * @returns {Promise<string|null>} Active strategy ID or null
   */
  async getActiveStrategy() {
    if (!await this.waitForReady()) return null;

    try {
      return await localforage.getItem(STORAGE_KEYS.ACTIVE_STRATEGY);
    } catch (error) {
      console.error('Failed to get active strategy:', error);
      return null;
    }
  }

  // Stat Display Configuration

  /**
   * Save stat display configuration
   * @param {Object} config - Display config object
   * @returns {Promise<boolean>} Success status
   */
  async saveStatDisplayConfig(config) {
    if (!await this.waitForReady()) return false;

    try {
      await localforage.setItem(STORAGE_KEYS.STAT_DISPLAY_CONFIG, config);
      return true;
    } catch (error) {
      console.error('Failed to save stat display config:', error);
      return false;
    }
  }

  /**
   * Get stat display configuration
   * @returns {Promise<Object|null>} Display config or null
   */
  async getStatDisplayConfig() {
    if (!await this.waitForReady()) return null;

    try {
      return await localforage.getItem(STORAGE_KEYS.STAT_DISPLAY_CONFIG);
    } catch (error) {
      console.error('Failed to get stat display config:', error);
      return null;
    }
  }

  // Calculation Cache (for performance optimization)

  /**
   * Save calculation cache
   * @param {Object} cache - Cache object
   * @returns {Promise<boolean>} Success status
   */
  async saveCalculationCache(cache) {
    if (!await this.waitForReady()) return false;

    try {
      await localforage.setItem(STORAGE_KEYS.CALCULATION_CACHE, {
        ...cache,
        savedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Failed to save calculation cache:', error);
      return false;
    }
  }

  /**
   * Get calculation cache
   * @returns {Promise<Object|null>} Cache object or null
   */
  async getCalculationCache() {
    if (!await this.waitForReady()) return null;

    try {
      return await localforage.getItem(STORAGE_KEYS.CALCULATION_CACHE);
    } catch (error) {
      console.error('Failed to get calculation cache:', error);
      return null;
    }
  }

  /**
   * Clear all stored data
   * @returns {Promise<boolean>} Success status
   */
  async clearAll() {
    if (!await this.waitForReady()) return false;

    try {
      await localforage.clear();
      return true;
    } catch (error) {
      console.error('Failed to clear storage:', error);
      return false;
    }
  }

  /**
   * Get storage usage information
   * @returns {Promise<Object>} Storage info
   */
  async getStorageInfo() {
    if (!await this.waitForReady()) {
      return { available: false };
    }

    try {
      const keys = await localforage.keys();
      return {
        available: true,
        keyCount: keys.length,
        keys: keys
      };
    } catch (error) {
      return {
        available: false,
        error: error.message
      };
    }
  }
}

// Export singleton instance
export const storageService = new StorageService();
export default storageService;