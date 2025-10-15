// Punt Strategy UI Components
// Alpine.js components for punt strategy selection and management

import { FANTASY_CATEGORIES, CATEGORY_DISPLAY_NAMES, CATEGORY_DESCRIPTIONS } from '../../data/categories.js';
import { puntStrategyManager } from './index.js';
import { STRATEGY_PRESETS } from './strategy-model.js';

/**
 * CategorySelector - Component for selecting which categories to include/exclude
 */
export function CategorySelector() {
  return {
    // Data
    selectedCategories: [...FANTASY_CATEGORIES],
    strategyManager: null,

    // Computed
    get excludedCategories() {
      return FANTASY_CATEGORIES.filter(cat => !this.selectedCategories.includes(cat));
    },

    get selectedCount() {
      return this.selectedCategories.length;
    },

    get totalCount() {
      return FANTASY_CATEGORIES.length;
    },

    get isAllSelected() {
      return this.selectedCategories.length === FANTASY_CATEGORIES.length;
    },

    get isNoneSelected() {
      return this.selectedCategories.length === 0;
    },

    // Methods
    init() {
      this.strategyManager = puntStrategyManager;
      this.loadCurrentStrategy();
    },

    loadCurrentStrategy() {
      const activeStrategy = this.strategyManager.getActiveStrategy();
      if (activeStrategy) {
        this.selectedCategories = [...activeStrategy.includedCategories];
      } else {
        this.selectedCategories = [...FANTASY_CATEGORIES];
      }
    },

    toggleCategory(category) {
      const newCategories = this.selectedCategories.includes(category)
        ? this.selectedCategories.filter(cat => cat !== category)
        : [...this.selectedCategories, category];
      
      this.selectedCategories = newCategories;
      this.applyChanges();
    },

    selectAll() {
      this.selectedCategories = [...FANTASY_CATEGORIES];
      this.applyChanges();
    },

    selectNone() {
      this.selectedCategories = [];
      this.applyChanges();
    },

    applyChanges() {
      // Apply to ranking engine immediately
      this.strategyManager.applyStrategy(this.selectedCategories);
      // Trigger ranking update
      this.$dispatch('strategy-changed', { categories: this.selectedCategories });
    },

    isCategorySelected(category) {
      return this.selectedCategories.includes(category);
    },

    getCategoryDisplayName(category) {
      return CATEGORY_DISPLAY_NAMES[category] || category;
    },

    getCategoryDescription(category) {
      return CATEGORY_DESCRIPTIONS[category] || '';
    },

    // Listen for strategy changes from other components
    onStrategyChanged(event) {
      if (event.detail && event.detail.categories) {
        this.selectedCategories = [...event.detail.categories];
      }
    }
  };
}

/**
 * StrategyManager - Component for managing saved strategies
 */
export function StrategyManager() {
  return {
    // Data
    strategies: [],
    activeStrategyId: null,
    showCreateDialog: false,
    showEditDialog: false,
    newStrategyName: '',
    editingStrategy: null,
    strategyManager: null,

    // Computed
    get activeStrategy() {
      return this.strategies.find(s => s.id === this.activeStrategyId);
    },

    get hasStrategies() {
      return this.strategies.length > 0;
    },

    // Methods
    init() {
      this.strategyManager = puntStrategyManager;
      this.loadStrategies();
    },

    async loadStrategies() {
      try {
        this.strategies = await this.strategyManager.loadStrategies();
        this.activeStrategyId = this.strategyManager.getActiveStrategyId();
      } catch (error) {
        console.error('Failed to load strategies:', error);
        this.strategies = [];
      }
    },

    async createStrategy() {
      if (!this.newStrategyName.trim()) return;

      try {
        const strategy = this.strategyManager.createStrategy(
          this.newStrategyName.trim(),
          this.strategyManager.getCurrentCategories()
        );

        // Auto-save the strategy
        await this.strategyManager.saveStrategy(strategy);

        this.strategies.push(strategy);
        this.newStrategyName = '';
        this.showCreateDialog = false;
      } catch (error) {
        console.error('Failed to create strategy:', error);
        alert('Failed to create strategy. Please try again.');
      }
    },

    async activateStrategy(strategyId) {
      try {
        await this.strategyManager.activateStrategy(strategyId);
        this.activeStrategyId = strategyId;
        // Notify other components that strategy changed
        this.$dispatch('strategy-changed', { strategyId, categories: this.strategyManager.getCurrentCategories() });
      } catch (error) {
        console.error('Failed to activate strategy:', error);
        alert('Failed to activate strategy. Please try again.');
      }
    },

    async deleteStrategy(strategyId) {
      if (!confirm('Are you sure you want to delete this strategy?')) return;

      try {
        await this.strategyManager.deleteStrategy(strategyId);
        this.strategies = this.strategies.filter(s => s.id !== strategyId);
        if (this.activeStrategyId === strategyId) {
          this.activeStrategyId = null;
          this.$dispatch('strategy-changed', { strategyId: null });
        }
      } catch (error) {
        console.error('Failed to delete strategy:', error);
        alert('Failed to delete strategy. Please try again.');
      }
    },

    startEditStrategy(strategy) {
      this.editingStrategy = { ...strategy };
      this.showEditDialog = true;
    },

    async saveEditedStrategy() {
      if (!this.editingStrategy.name.trim()) return;

      try {
        await this.strategyManager.updateStrategy(
          this.editingStrategy.id,
          this.editingStrategy.name.trim()
        );
        // Update local strategies list
        const index = this.strategies.findIndex(s => s.id === this.editingStrategy.id);
        if (index !== -1) {
          this.strategies[index].name = this.editingStrategy.name.trim();
          this.strategies[index].updatedAt = new Date();
        }
        this.showEditDialog = false;
        this.editingStrategy = null;
      } catch (error) {
        console.error('Failed to update strategy:', error);
        alert('Failed to update strategy. Please try again.');
      }
    },

    cancelEdit() {
      this.showEditDialog = false;
      this.editingStrategy = null;
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString();
    }
  };
}

/**
 * StrategyPresets - Component for applying predefined strategy templates
 */
export function StrategyPresets() {
  return {
    // Data
    presets: Object.values(STRATEGY_PRESETS),
    strategyManager: null,

    // Methods
    init() {
      this.strategyManager = puntStrategyManager;
    },

    applyPreset(preset) {
      // Apply preset categories directly
      this.strategyManager.applyStrategy(preset.includedCategories);
      // Dispatch event to update UI
      this.$dispatch('strategy-changed', { categories: preset.includedCategories, source: 'preset' });
    },

    getPresetDisplayName(preset) {
      return preset.name;
    }
  };
}

/**
 * StrategyStats - Component for displaying strategy statistics
 */
export function StrategyStats() {
  return {
    // Data
    currentStrategy: null,
    strategyManager: null,

    // Computed
    get stats() {
      if (!this.currentStrategy) return null;
      return this.currentStrategy.getStatistics();
    },

    // Methods
    init() {
      this.strategyManager = puntStrategyManager;
      this.updateStats();
    },

    updateStats() {
      this.currentStrategy = this.strategyManager.getActiveStrategy();
    },

    // Listen for strategy changes
    onStrategyChanged(_event) {
      this.updateStats();
    }
  };
}

// Export components for use in templates
export const PuntStrategyComponents = {
  CategorySelector,
  StrategyManager,
  StrategyPresets,
  StrategyStats
};