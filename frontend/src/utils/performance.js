// Performance monitoring utilities for core logic requirements
// Ensures <100ms response times for ranking calculations and UI updates

export class PerformanceMonitor {
  constructor() {
    this.timers = new Map();
    this.metrics = [];
  }

  startTimer(label) {
    this.timers.set(label, performance.now());
  }

  endTimer(label) {
    const startTime = this.timers.get(label);
    if (!startTime) {
      console.warn(`Timer '${label}' was not started`);
      return null;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(label);

    const metric = {
      label,
      duration,
      timestamp: Date.now()
    };

    this.metrics.push(metric);

    // Log warnings for slow operations
    if (duration > 100) {
      console.warn(`Performance warning: ${label} took ${duration.toFixed(2)}ms (>100ms target)`);
    } else if (duration > 50) {
      console.info(`Performance note: ${label} took ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  measureFunction(label, fn) {
    this.startTimer(label);
    try {
      const result = fn();
      this.endTimer(label);
      return result;
    } catch (error) {
      this.endTimer(label);
      throw error;
    }
  }

  async measureAsyncFunction(label, asyncFn) {
    this.startTimer(label);
    try {
      const result = await asyncFn();
      this.endTimer(label);
      return result;
    } catch (error) {
      this.endTimer(label);
      throw error;
    }
  }

  getMetrics() {
    return [...this.metrics];
  }

  getAverageDuration(label) {
    const labelMetrics = this.metrics.filter(m => m.label === label);
    if (labelMetrics.length === 0) return 0;

    const sum = labelMetrics.reduce((acc, m) => acc + m.duration, 0);
    return sum / labelMetrics.length;
  }

  clearMetrics() {
    this.metrics = [];
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Utility functions for common performance checks
export function assertPerformance(label, maxDuration = 100) {
  return (fn) => {
    return (...args) => {
      const start = performance.now();
      const result = fn(...args);
      const duration = performance.now() - start;

      if (duration > maxDuration) {
        console.error(`Performance violation: ${label} took ${duration.toFixed(2)}ms (max: ${maxDuration}ms)`);
      }

      return result;
    };
  };
}

export function assertAsyncPerformance(label, maxDuration = 100) {
  return (asyncFn) => {
    return async (...args) => {
      const start = performance.now();
      const result = await asyncFn(...args);
      const duration = performance.now() - start;

      if (duration > maxDuration) {
        console.error(`Performance violation: ${label} took ${duration.toFixed(2)}ms (max: ${maxDuration}ms)`);
      }

      return result;
    };
  };
}