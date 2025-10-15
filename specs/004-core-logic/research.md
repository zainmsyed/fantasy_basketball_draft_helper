# Research: Core Logic Implementation

**Date**: 2025-10-14  
**Phase**: 0 - Research & Analysis  
**Feature**: Core Logic Implementation (Z-score ranking, punt strategies, visual indicators)

## Research Tasks Completed

### Z-Score Algorithm Implementation

**Decision**: Use standard statistical Z-score formula with equal weighting across 9 categories  
**Rationale**: Industry standard for fantasy basketball rankings; mathematically sound for comparing players across different statistical scales  
**Alternatives considered**: 
- Weighted Z-scores (rejected - adds complexity without clear user benefit)
- Percentile rankings (rejected - less precise for close comparisons)
- Simple standardization (rejected - doesn't account for population variance)

**Implementation approach**:
```
Z-score = (player_stat - mean_stat) / std_deviation_stat
Overall ranking = sum(category_z_scores) / num_included_categories
```

### Punt Strategy Architecture

**Decision**: Boolean inclusion/exclusion system with real-time recalculation  
**Rationale**: Simple, intuitive interface; allows immediate feedback on strategy changes  
**Alternatives considered**:
- Category weighting system (rejected - too complex for MVP)
- Preset strategy templates only (rejected - limits user customization)
- Advanced conditional logic (deferred to future iterations)

**Implementation approach**:
- Checkbox UI for each of 9 categories
- Reactive calculation engine that recalculates on state change
- Local storage persistence of strategy configurations

### Performance Optimization Strategy

**Decision**: Memoized calculations with incremental updates  
**Rationale**: Meets <100ms requirement while handling 200 players efficiently  
**Alternatives considered**:
- Full recalculation each time (rejected - too slow for real-time updates)
- Web Workers for calculations (rejected - overkill for current dataset size)
- Pre-computed ranking matrices (rejected - memory intensive, less flexible)

**Implementation approach**:
- Cache mean/std deviation calculations per category
- Only recalculate affected rankings when categories change
- Use requestAnimationFrame for smooth UI updates

### Visual Indicator System

**Decision**: CSS class-based highlighting with dynamic style application  
**Rationale**: Performant, accessible, integrates well with Tailwind CSS system  
**Alternatives considered**:
- SVG-based indicators (rejected - unnecessary complexity)
- Chart.js mini-charts (rejected - bundle size impact)
- Color gradients (rejected - harder to distinguish quickly)

**Implementation approach**:
- Green highlight for max stat among included categories
- Red highlight for min stat among included categories  
- Exclude non-statistical columns (GP, Team, Position, Ranks)
- Update highlights when punt strategy changes

### Data Flow Architecture

**Decision**: Centralized ranking service with reactive state management  
**Rationale**: Single source of truth; clear separation of concerns; easy to test  
**Alternatives considered**:
- Component-level state management (rejected - leads to sync issues)
- Global state store (rejected - overkill for current scope)
- Event-driven architecture (deferred - adds complexity)

**Implementation approach**:
- RankingService orchestrates all calculations
- Alpine.js reactive data bindings for UI updates
- Pure calculation functions for testability

### Integration Points

**Decision**: Extend existing Tabulator component with custom formatters  
**Rationale**: Leverages existing table functionality; maintains consistency  
**Alternatives considered**:
- Replace Tabulator with custom table (rejected - loss of existing features)
- Parallel table implementation (rejected - duplicate functionality)
- External ranking display (rejected - poor user experience)

**Implementation approach**:
- Custom cell formatters for visual indicators
- Tabulator column sorting integration
- Real-time data updates through Tabulator's setData API

### Testing Strategy

**Decision**: Comprehensive unit tests for calculations, integration tests for workflows  
**Rationale**: Mathematical accuracy is critical; user workflows must work end-to-end  
**Test coverage targets**:
- 100% coverage for pure calculation functions
- Integration tests for all user scenarios
- Performance benchmarks for large datasets
- Cross-browser compatibility verification

## Technical Dependencies Confirmed

**No new dependencies required** - feature uses existing approved stack:
- Alpine.js for reactivity
- Tabulator for table functionality  
- Tailwind CSS for styling
- LocalForage for persistence

## Risk Assessment

**Low Risk**: Well-defined mathematical requirements, established patterns  
**Mitigation strategies**:
- Extensive unit testing for calculation accuracy
- Performance monitoring during development
- Progressive enhancement approach for complex features

## Next Phase Readiness

All research complete. No blocking unknowns identified. Ready to proceed to Phase 1 (Design & Contracts).