// Punt Strategy Module
// Enables users to customize rankings by excluding categories they want to "punt"

import { storageService } from '../../services/storage.js';
import { rankingEngine } from '../ranking-engine/index.js';
import { performanceMonitor } from '../../utils/performance.js';
import { FANTASY_CATEGORIES } from '../../data/categories.js';
import { PuntStrategy, StrategyValidator } from './strategy-model.js';

/**
 * PuntStrategyManager - Main entry point for punt strategy functionality
 * Manages strategy creation, application, and persistence
 */
class PuntStrategyManager {
  constructor() {
    this.currentStrategy = null;
    this.strategies = [];
    this.isInitialized = false;
  }

  /**
   * Initialize the punt strategy manager
   * @returns {Promise<boolean>} Success status
   */
  async initialize() {
    try {
      // Load saved strategies from storage
      const savedStrategies = await storageService.getPuntStrategies() || [];
      this.strategies = savedStrategies.map(data => PuntStrategy.fromJSON(data));

      // Load active strategy
      const activeStrategyId = await storageService.getActiveStrategy();
      if (activeStrategyId) {
        this.currentStrategy = this.strategies.find(s => s.id === activeStrategyId) || null;
      }

      // Apply current strategy to ranking engine if it exists
      if (this.currentStrategy) {
        this.applyStrategy(this.currentStrategy.includedCategories);
      }

      this.isInitialized = true;
      console.info('PuntStrategyManager: Initialized with', this.strategies.length, 'strategies');

      return true;
    } catch (error) {
      console.error('Failed to initialize PuntStrategyManager:', error);
      return false;
    }
  }

  /**
   * Create a new punt strategy
   * @param {string} name - Strategy name
   * @param {string[]} includedCategories - Categories to include
   * @returns {PuntStrategy} Created strategy object
   */
  createStrategy(name, includedCategories) {
    // Validate inputs
    const nameValidation = StrategyValidator.validateName(name);
    if (!nameValidation.isValid) {
      throw new Error(nameValidation.errors.join(', '));
    }

    const categoryValidation = StrategyValidator.validateCategories(includedCategories);
    if (!categoryValidation.isValid) {
      throw new Error(categoryValidation.errors.join(', '));
    }

    const strategy = new PuntStrategy(name, includedCategories);
    return strategy;
  }

  /**
   * Save a strategy to storage
   * @param {PuntStrategy} strategy - Strategy to save
   * @returns {Promise<boolean>} Success status
   */
  async saveStrategy(strategy) {
    try {
      const success = await storageService.savePuntStrategy(strategy.toJSON());
      if (success) {
        // Update local strategies list
        const existingIndex = this.strategies.findIndex(s => s.id === strategy.id);
        if (existingIndex >= 0) {
          this.strategies[existingIndex] = strategy;
        } else {
          this.strategies.push(strategy);
        }
      }
      return success;
    } catch (error) {
      console.error('Failed to save strategy:', error);
      return false;
    }
  }

  /**
   * Apply categories directly to ranking engine (for immediate UI updates)
   * @param {string[]} includedCategories - Categories to include
   * @returns {boolean} Success status
   */
  applyStrategy(includedCategories) {
    return performanceMonitor.measureFunction('PuntStrategyManager.applyStrategy', () => {
      try {
        // Validate categories
        const validation = StrategyValidator.validateCategories(includedCategories);
        if (!validation.isValid) {
          throw new Error(validation.errors.join(', '));
        }

        // Update ranking engine with new categories
        rankingEngine.setCategories(includedCategories);

        console.info(`Applied strategy with ${includedCategories.length} categories`);
        return true;
      } catch (error) {
        console.error('Failed to apply strategy:', error);
        return false;
      }
    });
  }

  /**
   * Activate a saved strategy
   * @param {string} strategyId - ID of strategy to activate
   * @returns {Promise<boolean>} Success status
   */
  async activateStrategy(strategyId) {
    try {
      const strategy = this.strategies.find(s => s.id === strategyId);
      if (!strategy) {
        throw new Error('Strategy not found');
      }

      // Apply strategy categories
      this.applyStrategy(strategy.includedCategories);

      // Update active strategy
      if (this.currentStrategy) {
        this.currentStrategy.deactivate();
        await this.saveStrategy(this.currentStrategy);
      }

      strategy.activate();
      this.currentStrategy = strategy;
      await this.saveStrategy(strategy);

      // Save active strategy to storage
      await storageService.setActiveStrategy(strategyId);

      console.info(`Activated strategy "${strategy.name}"`);
      return true;
    } catch (error) {
      console.error('Failed to activate strategy:', error);
      return false;
    }
  }

  /**
   * Update an existing strategy
   * @param {string} strategyId - ID of strategy to update
   * @param {string} newName - New strategy name
   * @returns {Promise<boolean>} Success status
   */
  async updateStrategy(strategyId, newName) {
    try {
      const strategy = this.strategies.find(s => s.id === strategyId);
      if (!strategy) {
        throw new Error('Strategy not found');
      }

      const nameValidation = StrategyValidator.validateName(newName);
      if (!nameValidation.isValid) {
        throw new Error(nameValidation.errors.join(', '));
      }

      strategy.rename(newName);
      await this.saveStrategy(strategy);

      return true;
    } catch (error) {
      console.error('Failed to update strategy:', error);
      return false;
    }
  }

  /**
   * Delete a strategy
   * @param {string} strategyId - ID of strategy to delete
   * @returns {Promise<boolean>} Success status
   */
  async deleteStrategy(strategyId) {
    try {
      // If deleting active strategy, reset to default
      if (this.currentStrategy && this.currentStrategy.id === strategyId) {
        await this.resetToDefault();
      }

      const success = await storageService.deletePuntStrategy(strategyId);
      if (success) {
        this.strategies = this.strategies.filter(s => s.id !== strategyId);
      }
      return success;
    } catch (error) {
      console.error('Failed to delete strategy:', error);
      return false;
    }
  }

  /**
   * Load strategies from storage
   * @returns {Promise<PuntStrategy[]>} Array of strategy objects
   */
  async loadStrategies() {
    try {
      const savedStrategies = await storageService.getPuntStrategies() || [];
      return savedStrategies.map(data => PuntStrategy.fromJSON(data));
    } catch (error) {
      console.error('Failed to load strategies:', error);
      return [];
    }
  }

  /**
   * Reset to default strategy (all categories included)
   * @returns {Promise<boolean>} Success status
   */
  async resetToDefault() {
    try {
      this.applyStrategy(FANTASY_CATEGORIES);

      if (this.currentStrategy) {
        this.currentStrategy.deactivate();
        await this.saveStrategy(this.currentStrategy);
      }

      this.currentStrategy = null;
      await storageService.setActiveStrategy(null);
      return true;
    } catch (error) {
      console.error('Failed to reset to default:', error);
      return false;
    }
  }

  /**
   * Get all saved strategies
   * @returns {PuntStrategy[]} Array of strategy objects
   */
  getStrategies() {
    return [...this.strategies];
  }

  /**
   * Get the currently active strategy
   * @returns {PuntStrategy|null} Active strategy or null
   */
  getActiveStrategy() {
    return this.currentStrategy;
  }

  /**
   * Get the ID of the currently active strategy
   * @returns {string|null} Active strategy ID or null
   */
  getActiveStrategyId() {
    return this.currentStrategy ? this.currentStrategy.id : null;
  }

  /**
   * Get current categories being used by ranking engine
   * @returns {string[]} Current categories
   */
  getCurrentCategories() {
    return rankingEngine.getCategories();
  }

  /**
   * Check if a strategy is currently active
   * @param {string} strategyId - Strategy ID to check
   * @returns {boolean} Whether the strategy is active
   */
  isStrategyActive(strategyId) {
    return this.currentStrategy && this.currentStrategy.id === strategyId;
  }

  /**
   * Get strategy statistics
   * @returns {Object} Statistics about strategies
   */
  getStatistics() {
    return {
      totalStrategies: this.strategies.length,
      activeStrategy: this.currentStrategy ? this.currentStrategy.name : null,
      categoriesIncluded: this.currentStrategy ? this.currentStrategy.includedCategories.length : FANTASY_CATEGORIES.length,
      categoriesExcluded: this.currentStrategy ? this.currentStrategy.excludedCategories.length : 0
    };
  }
}

// Export singleton instance
export const puntStrategyManager = new PuntStrategyManager();