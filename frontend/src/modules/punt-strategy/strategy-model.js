// Punt Strategy Data Models
// Defines the data structures and validation for punt strategies

import { FANTASY_CATEGORIES, CATEGORY_DISPLAY_NAMES } from '../../data/categories.js';

/**
 * PuntStrategy - Core data model for punt strategies
 * Represents a user's choice to exclude certain categories from ranking calculations
 */
export class PuntStrategy {
  constructor(name, includedCategories, options = {}) {
    this.id = options.id || this.generateId();
    this.name = name;
    this.includedCategories = [...includedCategories];
    this.excludedCategories = FANTASY_CATEGORIES.filter(cat => !includedCategories.includes(cat));
    this.createdAt = options.createdAt || new Date();
    this.updatedAt = options.updatedAt || new Date();
    this.isActive = options.isActive || false;
    this.description = options.description || this.generateDescription();
  }

  /**
   * Generate a unique ID for the strategy
   * @returns {string} Unique identifier
   */
  generateId() {
    return `strategy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate a human-readable description
   * @returns {string} Description of the strategy
   */
  generateDescription() {
    if (this.excludedCategories.length === 0) {
      return 'Includes all fantasy categories';
    }

    const excludedNames = this.excludedCategories.map(cat => CATEGORY_DISPLAY_NAMES[cat] || cat);
    return `Excludes: ${excludedNames.join(', ')}`;
  }

  /**
   * Update the strategy with new categories
   * @param {string[]} includedCategories - New included categories
   */
  updateCategories(includedCategories) {
    this.includedCategories = [...includedCategories];
    this.excludedCategories = FANTASY_CATEGORIES.filter(cat => !includedCategories.includes(cat));
    this.updatedAt = new Date();
    this.description = this.generateDescription();
  }

  /**
   * Rename the strategy
   * @param {string} newName - New strategy name
   */
  rename(newName) {
    this.name = newName.trim();
    this.updatedAt = new Date();
  }

  /**
   * Mark strategy as active
   */
  activate() {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  /**
   * Mark strategy as inactive
   */
  deactivate() {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  /**
   * Get strategy statistics
   * @returns {Object} Statistical information about the strategy
   */
  getStatistics() {
    return {
      totalCategories: FANTASY_CATEGORIES.length,
      includedCount: this.includedCategories.length,
      excludedCount: this.excludedCategories.length,
      inclusionRate: this.includedCategories.length / FANTASY_CATEGORIES.length,
      excludedNames: this.excludedCategories.map(cat => CATEGORY_DISPLAY_NAMES[cat] || cat)
    };
  }

  /**
   * Check if category is included in this strategy
   * @param {string} category - Category to check
   * @returns {boolean} Whether category is included
   */
  includesCategory(category) {
    return this.includedCategories.includes(category);
  }

  /**
   * Check if category is excluded from this strategy
   * @param {string} category - Category to check
   * @returns {boolean} Whether category is excluded
   */
  excludesCategory(category) {
    return this.excludedCategories.includes(category);
  }

  /**
   * Create a copy of this strategy
   * @param {string} newName - Optional new name for the copy
   * @returns {PuntStrategy} New strategy instance
   */
  clone(newName = null) {
    return new PuntStrategy(
      newName || `${this.name} (Copy)`,
      [...this.includedCategories],
      {
        description: this.description,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    );
  }

  /**
   * Convert to plain object for storage/serialization
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      includedCategories: [...this.includedCategories],
      excludedCategories: [...this.excludedCategories],
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      isActive: this.isActive,
      description: this.description
    };
  }

  /**
   * Create strategy instance from plain object
   * @param {Object} data - Plain object data
   * @returns {PuntStrategy} Strategy instance
   */
  static fromJSON(data) {
    return new PuntStrategy(
      data.name,
      data.includedCategories,
      {
        id: data.id,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
        isActive: data.isActive,
        description: data.description
      }
    );
  }
}

/**
 * StrategyPreset - Predefined strategy templates
 * Common punt strategies that users might want to use
 */
export class StrategyPreset {
  constructor(name, description, excludedCategories) {
    this.name = name;
    this.description = description;
    this.excludedCategories = excludedCategories;
    this.includedCategories = FANTASY_CATEGORIES.filter(cat => !excludedCategories.includes(cat));
  }

  /**
   * Create a PuntStrategy from this preset
   * @param {string} customName - Optional custom name
   * @returns {PuntStrategy} Strategy instance
   */
  createStrategy(customName = null) {
    return new PuntStrategy(
      customName || this.name,
      this.includedCategories,
      {
        description: this.description
      }
    );
  }
}

// Predefined strategy presets
export const STRATEGY_PRESETS = {
  DEFAULT: new StrategyPreset(
    'All Categories',
    'Includes all 9 fantasy basketball categories',
    []
  ),

  NO_TURNOVERS: new StrategyPreset(
    'No Turnovers',
    'Excludes turnovers - good for players who are careless with the ball',
    ['to']
  ),

  NO_FREE_THROWS: new StrategyPreset(
    'No Free Throws',
    'Excludes free throw percentage - good for players who don\'t shoot many free throws',
    ['ft_pct']
  ),

  EFFICIENCY_FOCUS: new StrategyPreset(
    'Efficiency Focus',
    'Excludes turnovers and free throws - focuses on efficient scoring and defense',
    ['to', 'ft_pct']
  ),

  BIG_MAN_FOCUS: new StrategyPreset(
    'Big Man Focus',
    'Excludes 3-pointers and free throws - better for centers and power forwards',
    ['threes', 'ft_pct']
  ),

  GUARD_FOCUS: new StrategyPreset(
    'Guard Focus',
    'Excludes rebounds - better for perimeter players',
    ['reb']
  )
};

/**
 * StrategyValidator - Validation utilities for punt strategies
 */
export class StrategyValidator {
  /**
   * Validate strategy name
   * @param {string} name - Strategy name to validate
   * @returns {Object} Validation result
   */
  static validateName(name) {
    const errors = [];

    if (!name || typeof name !== 'string') {
      errors.push('Strategy name must be a string');
    } else {
      const trimmed = name.trim();
      if (trimmed.length === 0) {
        errors.push('Strategy name cannot be empty');
      } else if (trimmed.length > 50) {
        errors.push('Strategy name cannot exceed 50 characters');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate category selection
   * @param {string[]} categories - Categories to validate
   * @returns {Object} Validation result
   */
  static validateCategories(categories) {
    const errors = [];

    if (!Array.isArray(categories)) {
      errors.push('Categories must be an array');
    } else {
      if (categories.length === 0) {
        errors.push('At least one category must be included');
      }

      // Check for invalid categories
      const invalidCategories = categories.filter(cat => !FANTASY_CATEGORIES.includes(cat));
      if (invalidCategories.length > 0) {
        errors.push(`Invalid categories: ${invalidCategories.join(', ')}`);
      }

      // Check for duplicates
      const uniqueCategories = [...new Set(categories)];
      if (uniqueCategories.length !== categories.length) {
        errors.push('Categories cannot contain duplicates');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate complete strategy object
   * @param {Object} strategy - Strategy object to validate
   * @returns {Object} Validation result
   */
  static validateStrategy(strategy) {
    const errors = [];

    if (!strategy || typeof strategy !== 'object') {
      errors.push('Strategy must be a valid object');
      return { isValid: false, errors };
    }

    // Validate name
    const nameValidation = this.validateName(strategy.name);
    if (!nameValidation.isValid) {
      errors.push(...nameValidation.errors);
    }

    // Validate categories
    const categoryValidation = this.validateCategories(strategy.includedCategories);
    if (!categoryValidation.isValid) {
      errors.push(...categoryValidation.errors);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}