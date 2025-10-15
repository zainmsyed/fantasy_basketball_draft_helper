// Performance Monitoring for Ranking Engine
// Monitors and reports performance metrics for ranking calculations

import { performanceMonitor } from '../../utils/performance.js';
import { rankingEngine } from './index.js';
import { zScoreCalculator } from './z-score-calculator.js';
import { rankingServiceImplementation } from './ranking-service.js';

/**
 * RankingPerformanceMonitor - Specialized performance monitoring for ranking operations
 * Tracks timing, memory usage, and performance targets for ranking calculations
 */
export class RankingPerformanceMonitor {
  constructor() {
    this.metrics = {
      totalCalculations: 0,
      averageTime: 0,
      maxTime: 0,
      minTime: Infinity,
      violations: 0,
      targetTime: 100, // ms
      memoryUsage: [],
      categoryBreakdown: new Map()
    };

    this.isEnabled = true;
  }

  /**
   * Monitor a ranking calculation operation
   * @param {string} operationName - Name of the operation
   * @param {Function} operation - The operation to monitor
   * @returns {*} Operation result
   */
  async monitorOperation(operationName, operation) {
    if (!this.isEnabled) {
      return operation();
    }

    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();

    try {
      const result = await performanceMonitor.measureAsyncFunction(
        `RankingPerformanceMonitor.${operationName}`,
        operation
      );

      const endTime = performance.now();
      const endMemory = this.getMemoryUsage();
      const duration = endTime - startTime;
      const memoryDelta = endMemory - startMemory;

      this.recordMetric(operationName, duration, memoryDelta);

      // Check performance target
      if (duration > this.metrics.targetTime) {
        console.warn(`Performance violation in ${operationName}: ${duration.toFixed(2)}ms (> ${this.metrics.targetTime}ms target)`);
        this.metrics.violations++;
      }

      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      this.recordMetric(operationName, duration, 0);
      throw error;
    }
  }

  /**
   * Record a performance metric
   * @param {string} operationName - Operation name
   * @param {number} duration - Duration in ms
   * @param {number} memoryDelta - Memory usage change
   */
  recordMetric(operationName, duration, memoryDelta) {
    this.metrics.totalCalculations++;

    // Update timing statistics
    this.metrics.averageTime = (
      (this.metrics.averageTime * (this.metrics.totalCalculations - 1)) + duration
    ) / this.metrics.totalCalculations;

    this.metrics.maxTime = Math.max(this.metrics.maxTime, duration);
    this.metrics.minTime = Math.min(this.metrics.minTime, duration);

    // Record memory usage
    if (memoryDelta !== 0) {
      this.metrics.memoryUsage.push({
        operation: operationName,
        delta: memoryDelta,
        timestamp: Date.now()
      });
    }

    // Track category breakdown
    if (!this.metrics.categoryBreakdown.has(operationName)) {
      this.metrics.categoryBreakdown.set(operationName, {
        count: 0,
        totalTime: 0,
        averageTime: 0,
        maxTime: 0
      });
    }

    const category = this.metrics.categoryBreakdown.get(operationName);
    category.count++;
    category.totalTime += duration;
    category.averageTime = category.totalTime / category.count;
    category.maxTime = Math.max(category.maxTime, duration);
  }

  /**
   * Get current memory usage
   * @returns {number} Memory usage in bytes
   */
  getMemoryUsage() {
    if (typeof performance !== 'undefined' && performance.memory) {
      return performance.memory.usedJSHeapSize || 0;
    }
    return 0;
  }

  /**
   * Get comprehensive performance report
   * @returns {Object} Performance report
   */
  getPerformanceReport() {
    const rankingEngineMetrics = rankingEngine.getPerformanceMetrics();
    const calculatorMetrics = zScoreCalculator.getPerformanceMetrics();
    const serviceMetrics = rankingServiceImplementation.getPerformanceMetrics();

    return {
      overall: { ...this.metrics },
      rankingEngine: rankingEngineMetrics,
      zScoreCalculator: calculatorMetrics,
      rankingService: serviceMetrics,
      summary: {
        totalOperations: this.metrics.totalCalculations,
        averageTime: this.metrics.averageTime,
        maxTime: this.metrics.maxTime,
        violations: this.metrics.violations,
        withinTarget: this.metrics.averageTime <= this.metrics.targetTime,
        targetTime: this.metrics.targetTime
      },
      recommendations: this.generateRecommendations()
    };
  }

  /**
   * Generate performance recommendations
   * @returns {string[]} Performance recommendations
   */
  generateRecommendations() {
    const recommendations = [];

    if (this.metrics.averageTime > this.metrics.targetTime) {
      recommendations.push(`Average calculation time (${this.metrics.averageTime.toFixed(2)}ms) exceeds target (${this.metrics.targetTime}ms). Consider optimizing Z-score calculations.`);
    }

    if (this.metrics.violations > 0) {
      recommendations.push(`${this.metrics.violations} performance violations detected. Review calculation bottlenecks.`);
    }

    if (this.metrics.maxTime > this.metrics.targetTime * 2) {
      recommendations.push(`Maximum calculation time (${this.metrics.maxTime.toFixed(2)}ms) is significantly above target. Investigate outliers.`);
    }

    const memoryIssues = this.metrics.memoryUsage.filter(m => m.delta > 1024 * 1024); // > 1MB
    if (memoryIssues.length > 0) {
      recommendations.push(`${memoryIssues.length} operations caused significant memory increases. Consider memory optimization.`);
    }

    if (recommendations.length === 0) {
      recommendations.push('Performance is within acceptable limits. Continue monitoring.');
    }

    return recommendations;
  }

  /**
   * Reset performance metrics
   */
  resetMetrics() {
    this.metrics = {
      totalCalculations: 0,
      averageTime: 0,
      maxTime: 0,
      minTime: Infinity,
      violations: 0,
      targetTime: 100,
      memoryUsage: [],
      categoryBreakdown: new Map()
    };
  }

  /**
   * Enable or disable performance monitoring
   * @param {boolean} enabled - Whether to enable monitoring
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
  }

  /**
   * Check if performance monitoring is enabled
   * @returns {boolean} Enabled status
   */
  isEnabled() {
    return this.isEnabled;
  }

  /**
   * Set performance target time
   * @param {number} targetMs - Target time in milliseconds
   */
  setTargetTime(targetMs) {
    this.metrics.targetTime = targetMs;
  }

  /**
   * Get performance target time
   * @returns {number} Target time in milliseconds
   */
  getTargetTime() {
    return this.metrics.targetTime;
  }
}

// Export singleton instance
export const rankingPerformanceMonitor = new RankingPerformanceMonitor();
export default rankingPerformanceMonitor;