# Quickstart: Core Logic Implementation

**Date**: 2025-10-14  
**Feature**: Core Logic Implementation  
**Estimated Development Time**: 4-6 days

## Overview

This quickstart guide provides a development roadmap for implementing the core ranking algorithm, punt strategy system, stat view toggling, and visual indicators for the Basketball Draft Helper application.

## Prerequisites

- ✅ Foundation features completed (Vite + Alpine.js setup)
- ✅ Data integration completed (CSV processing, data merging)
- ✅ TypeScript configuration active
- ✅ Tabulator table component integrated
- ✅ LocalForage storage available

## Development Phases

### Phase 1: Z-Score Calculation Engine (Days 1-2)

#### Day 1: Core Algorithm
**Goal**: Implement pure Z-score calculation functions

**Tasks**:
1. Create `src/utils/calculations.js` with Z-score functions
2. Implement category mean/standard deviation calculations  
3. Add player qualification threshold checking
4. Write comprehensive unit tests for mathematical accuracy

**Deliverable**: Working Z-score calculator with 100% test coverage

**Key Files**:
```typescript
// src/utils/calculations.js
export function calculateZScore(value: number, mean: number, stdDev: number): number;
export function calculateCategoryStats(players: PlayerStats[], category: CategoryName): CategoryStats;
export function checkQualification(player: PlayerStats): QualificationStatus;
```

**Testing**: 
- Verify mathematical accuracy against known datasets
- Test edge cases (zero variance, missing data)
- Performance benchmark for 200 players

#### Day 2: Ranking Service
**Goal**: Orchestrate Z-score calculations into player rankings

**Tasks**:
1. Create `src/services/ranking-service.js`
2. Implement player ranking algorithm with category inclusion/exclusion
3. Add caching for performance optimization
4. Integration with Alpine.js reactive state

**Deliverable**: Complete ranking service meeting <100ms performance requirement

**Key Files**:
```typescript
// src/services/ranking-service.js  
export class RankingService implements IRankingService;
```

### Phase 2: Punt Strategy System (Day 3)

#### Day 3: Strategy Management
**Goal**: Enable dynamic category selection and ranking recalculation

**Tasks**:
1. Create `src/modules/punt-strategy/` module
2. Implement strategy save/load with LocalForage
3. Add real-time ranking updates on category changes
4. Create strategy validation logic

**Deliverable**: Working punt strategy system with persistence

**Key Files**:
```typescript
// src/modules/punt-strategy/strategy-service.js
export class PuntStrategyService implements IPuntStrategyService;

// src/modules/punt-strategy/strategy-component.js  
export function initPuntStrategyUI(alpineData: any): void;
```

**UI Components**:
- Category selection checkboxes
- Save/load strategy controls
- Strategy name input and management

### Phase 3: Stat Display Toggle (Day 4)

#### Day 4: View Management
**Goal**: Enable switching between projected and historical stats

**Tasks**:
1. Create `src/modules/stat-display/` module
2. Implement stat view toggle functionality
3. Update Tabulator integration for dynamic data display
4. Preserve punt strategy when switching views

**Deliverable**: Seamless stat view switching with preserved rankings

**Key Files**:
```typescript
// src/modules/stat-display/display-service.js
export class StatDisplayService implements IStatDisplayService;

// src/modules/stat-display/toggle-component.js
export function initStatToggleUI(alpineData: any): void;
```

**Integration Points**:
- Tabulator column data updates
- Alpine.js reactive bindings
- Ranking service coordination

### Phase 4: Visual Indicators (Days 5-6)

#### Day 5: Indicator Calculation
**Goal**: Determine best/worst categories for each player

**Tasks**:
1. Create `src/modules/visual-indicators/` module
2. Implement best/worst category identification
3. Add dynamic updating when punt strategy changes
4. Performance optimization for large datasets

**Deliverable**: Accurate visual indicator calculations

**Key Files**:
```typescript
// src/modules/visual-indicators/indicator-service.js
export class VisualIndicatorService implements IVisualIndicatorService;
```

#### Day 6: UI Integration
**Goal**: Apply visual highlighting to player table

**Tasks**:
1. Create Tabulator custom cell formatters
2. Implement CSS classes for green/red highlighting
3. Add responsive updates when categories change
4. Final integration testing and performance validation

**Deliverable**: Complete visual indicator system integrated with table

**Key Files**:
```typescript
// src/modules/visual-indicators/table-formatters.js
export function createHighlightFormatter(indicators: PlayerVisualIndicators[]): Tabulator.Formatter;
```

## Implementation Order

### User Story Priority Implementation
1. **P1: Z-Score Algorithm** (Days 1-2) - Core value proposition
2. **P1: Punt Strategy** (Day 3) - Key competitive advantage
3. **P2: Stat Toggle** (Day 4) - Analytical enhancement
4. **P2: Visual Indicators** (Days 5-6) - User experience improvement

### Daily Targets
- **Day 1**: Z-score calculations working with tests
- **Day 2**: Complete ranking service with performance optimization
- **Day 3**: Punt strategy system with category selection UI
- **Day 4**: Stat view toggle with preserved strategy state  
- **Day 5**: Visual indicator calculation engine
- **Day 6**: Complete UI integration and final testing

## Key Integration Points

### Alpine.js Data Structure
```javascript
const coreLogicData = {
  // State
  players: [],
  rankings: [],
  activeStrategy: null,
  currentStatView: 'projected',
  visualIndicators: {},
  
  // Computed properties
  get sortedPlayers() {
    return this.rankings
      .filter(r => !r.player.isDrafted)
      .sort((a, b) => a.rank - b.rank)
      .map(r => r.player);
  },
  
  // Actions
  async toggleCategory(category) {
    await this.puntStrategyService.toggleCategory(category);
    await this.refreshRankings();
  },
  
  async toggleStatView() {
    this.currentStatView = await this.statDisplayService.toggleView();
    await this.refreshRankings();
  }
};
```

### Tabulator Configuration
```javascript
const tableConfig = {
  columns: [
    {title: "Expert Rank", field: "expertRank"},
    {title: "Algo Rank", field: "algoRank", formatter: rankingFormatter},
    {title: "Player", field: "name"},
    {title: "PTS", field: "stats.pts", formatter: statFormatter},
    {title: "AST", field: "stats.ast", formatter: statFormatter},
    // ... other stat columns with visual indicator formatters
  ],
  data: coreLogicData.sortedPlayers
};
```

## Testing Strategy

### Unit Tests (Target: 100% coverage)
- Mathematical functions in `calculations.js`
- Service class methods
- Validation logic
- Performance benchmarks

### Integration Tests
- End-to-end user workflows
- Cross-module data flow
- Alpine.js reactivity
- Tabulator integration

### Performance Tests  
- 200 player ranking calculation (<100ms)
- Visual indicator updates (<50ms)
- Stat view toggle (<50ms)
- Memory usage monitoring

## Performance Targets

### Response Time Requirements
- **Ranking calculation**: <100ms for 200 players
- **Category toggle**: <100ms for recalculation
- **Stat view toggle**: <50ms for UI update
- **Visual indicators**: <50ms for highlighting update

### Optimization Strategies
- Memoize category statistics calculations
- Use incremental updates for draft status changes
- Batch DOM updates for visual indicators
- Implement efficient array operations

## Error Handling

### User-Facing Errors
- Invalid data format notifications
- Performance threshold warnings
- Strategy validation messages

### Developer Debugging
- Console logging for calculation steps
- Performance timing instrumentation
- Data validation checkpoints

## Success Criteria Verification

Before marking complete, verify:
- ✅ All user stories pass acceptance scenarios
- ✅ Performance targets met in testing
- ✅ Mathematical accuracy validated against known datasets
- ✅ Integration with existing features working
- ✅ Error handling graceful and informative
- ✅ Code coverage targets achieved

## Deployment Checklist

- [ ] Unit tests passing
- [ ] Integration tests passing  
- [ ] Performance benchmarks meeting targets
- [ ] Cross-browser compatibility verified
- [ ] Memory usage acceptable
- [ ] User interface responsive and intuitive
- [ ] Documentation updated
- [ ] Feature flag ready for production toggle