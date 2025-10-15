# Core Logic Service Contracts

**Date**: 2025-10-14  
**Phase**: 1 - Design & Contracts  
**Feature**: Core Logic Implementation

This document defines the service contracts for the core logic implementation. Since this is a client-side application, these represent TypeScript interfaces and method signatures rather than HTTP APIs.

## RankingService Contract

### Interface Definition
```typescript
interface IRankingService {
  // Core calculation methods
  calculateZScores(players: PlayerStats[], includedCategories: CategoryName[]): Promise<PlayerRanking[]>;
  calculatePlayerRanking(player: PlayerStats, categoryStats: CategoryStatsMap, includedCategories: CategoryName[]): PlayerRanking;
  
  // Real-time update methods  
  updateRankingsOnDraft(playerId: string, isDrafted: boolean): Promise<PlayerRanking[]>;
  updateRankingsOnCategoryChange(includedCategories: CategoryName[]): Promise<PlayerRanking[]>;
  
  // Qualification checking
  checkQualificationThresholds(player: PlayerStats): QualificationStatus;
  
  // Performance monitoring
  benchmarkCalculation(playerCount: number): Promise<PerformanceMetrics>;
}
```

### Method Specifications

#### calculateZScores
```typescript
calculateZScores(
  players: PlayerStats[], 
  includedCategories: CategoryName[]
): Promise<PlayerRanking[]>
```
**Purpose**: Calculate Z-scores and rankings for all players based on included categories  
**Preconditions**: 
- players array not empty
- includedCategories contains at least 1 valid category
- All players have complete statistical data for included categories
**Postconditions**:
- Returns sorted array by total Z-score (descending)
- Each PlayerRanking contains category-specific Z-scores
- Qualification thresholds applied for percentage stats
**Performance**: Must complete in <100ms for 200 players
**Error handling**: Throws `InvalidDataError` for malformed input

#### updateRankingsOnDraft
```typescript
updateRankingsOnDraft(
  playerId: string, 
  isDrafted: boolean
): Promise<PlayerRanking[]>
```
**Purpose**: Recalculate rankings when player draft status changes  
**Preconditions**: playerId exists in current dataset
**Postconditions**: 
- If isDrafted=true: player excluded from rankings, remaining players reranked
- If isDrafted=false: player included in rankings, all players reranked
**Performance**: Must complete in <100ms
**Error handling**: Throws `PlayerNotFoundError` for invalid playerId

#### checkQualificationThresholds
```typescript
checkQualificationThresholds(player: PlayerStats): QualificationStatus
```
**Purpose**: Determine if player meets minimum thresholds for percentage categories  
**Preconditions**: player has valid GP, FGA, FTA values
**Postconditions**: Returns qualification status for FG% and FT%
**Calculation**: 
- FG% qualified: (FGA / GP) >= 5.0
- FT% qualified: (FTA / GP) >= 2.0

## PuntStrategyService Contract

### Interface Definition
```typescript
interface IPuntStrategyService {
  // Strategy management
  saveStrategy(strategy: PuntStrategy): Promise<void>;
  loadStrategy(strategyId: string): Promise<PuntStrategy>;
  deleteStrategy(strategyId: string): Promise<void>;
  listStrategies(): Promise<PuntStrategy[]>;
  
  // Active strategy management
  setActiveStrategy(strategy: PuntStrategy): Promise<void>;
  getActiveStrategy(): Promise<PuntStrategy | null>;
  resetToDefault(): Promise<PuntStrategy>;
  
  // Category validation
  validateCategorySelection(categories: CategoryName[]): ValidationResult;
}
```

### Method Specifications

#### saveStrategy
```typescript
saveStrategy(strategy: PuntStrategy): Promise<void>
```
**Purpose**: Persist punt strategy to local storage  
**Preconditions**: strategy has valid name and category selection
**Postconditions**: Strategy saved to LocalForage with unique ID
**Error handling**: Throws `InvalidStrategyError` for invalid category selection

#### validateCategorySelection
```typescript
validateCategorySelection(categories: CategoryName[]): ValidationResult
```
**Purpose**: Ensure category selection meets business rules  
**Validation rules**:
- At least 1 category must be included
- Maximum 9 categories allowed
- All category names must be valid CategoryName values
**Returns**: ValidationResult with success/failure and error messages

## VisualIndicatorService Contract

### Interface Definition
```typescript
interface IVisualIndicatorService {
  // Indicator calculation
  calculateIndicators(players: PlayerStats[], includedCategories: CategoryName[]): PlayerVisualIndicators[];
  updateIndicatorsOnCategoryChange(includedCategories: CategoryName[]): Promise<PlayerVisualIndicators[]>;
  
  // CSS class generation
  generateHighlightClasses(playerId: string): HighlightClasses;
  
  // Performance optimization
  batchUpdateIndicators(playerIds: string[]): Promise<void>;
}
```

### Method Specifications

#### calculateIndicators
```typescript
calculateIndicators(
  players: PlayerStats[], 
  includedCategories: CategoryName[]
): PlayerVisualIndicators[]
```
**Purpose**: Determine best/worst categories for visual highlighting  
**Algorithm**:
- For each player, find highest stat value among included categories (best)
- Find lowest stat value among included categories (worst)  
- Handle ties by selecting first occurrence
- Exclude non-statistical columns (GP, Team, Position, Ranks)
**Performance**: Must complete in <50ms for 200 players

## StatDisplayService Contract

### Interface Definition
```typescript
interface IStatDisplayService {
  // View management
  toggleStatView(): Promise<'projected' | 'lastYear'>;
  setStatView(view: 'projected' | 'lastYear'): Promise<void>;
  getCurrentView(): 'projected' | 'lastYear';
  
  // Data formatting
  formatStatsForDisplay(player: PlayerStats, view: 'projected' | 'lastYear'): DisplayStats;
  
  // Integration with ranking
  syncWithRankingCalculations(view: 'projected' | 'lastYear'): Promise<void>;
}
```

### Method Specifications

#### toggleStatView
```typescript
toggleStatView(): Promise<'projected' | 'lastYear'>
```
**Purpose**: Switch between projected and historical stat views  
**Behavior**: 
- If current view is 'projected', switch to 'lastYear'
- If current view is 'lastYear', switch to 'projected'
- Persist new view to local storage
**Postconditions**: Rankings recalculated using stats from new view
**Performance**: View switch must complete in <50ms

## Error Handling Contracts

### Error Types
```typescript
class InvalidDataError extends Error {
  constructor(public field: string, public value: any) {
    super(`Invalid data for field ${field}: ${value}`);
  }
}

class PlayerNotFoundError extends Error {
  constructor(public playerId: string) {
    super(`Player not found: ${playerId}`);
  }
}

class InvalidStrategyError extends Error {
  constructor(public reason: string) {
    super(`Invalid punt strategy: ${reason}`);
  }
}

class PerformanceThresholdError extends Error {
  constructor(public operation: string, public actualTime: number, public threshold: number) {
    super(`Performance threshold exceeded for ${operation}: ${actualTime}ms > ${threshold}ms`);
  }
}
```

## Performance Contracts

### Service Level Agreements
```typescript
interface PerformanceMetrics {
  operationName: string;
  executionTime: number; // milliseconds
  playerCount: number;
  categoryCount: number;
  memoryUsage?: number; // bytes
}

interface PerformanceThresholds {
  RANKING_CALCULATION: 100; // ms for 200 players
  VISUAL_INDICATOR_UPDATE: 50; // ms for 200 players  
  STAT_VIEW_TOGGLE: 50; // ms
  CATEGORY_SELECTION_UPDATE: 100; // ms
}
```

### Monitoring Requirements
- All service methods must log performance metrics
- Performance threshold violations must trigger warnings
- Benchmark tests must validate SLA compliance
- Memory usage must be monitored for large datasets

## Integration Contracts

### With Alpine.js Reactivity
```typescript
interface ReactiveDataBinding {
  // Data properties that trigger UI updates
  players: PlayerStats[];
  rankings: PlayerRanking[];
  activeStrategy: PuntStrategy;
  currentStatView: 'projected' | 'lastYear';
  visualIndicators: Record<string, PlayerVisualIndicators>;
  
  // Computed properties
  get filteredPlayers(): PlayerStats[];
  get sortedRankings(): PlayerRanking[];
  
  // Action methods  
  onCategoryToggle(category: CategoryName): void;
  onPlayerDraft(playerId: string): void;
  onStatViewToggle(): void;
}
```

### With Tabulator Integration
```typescript
interface TabulatorIntegration {
  // Column definitions with custom formatters
  rankingColumn: Tabulator.ColumnDefinition;
  statColumns: Tabulator.ColumnDefinition[];
  visualIndicatorColumns: Tabulator.ColumnDefinition[];
  
  // Event handlers
  onDataUpdate(newData: PlayerStats[]): void;
  onSort(field: string, direction: 'asc' | 'desc'): void;
  
  // Custom formatters
  rankingFormatter(cell: Tabulator.CellComponent): string;
  visualIndicatorFormatter(cell: Tabulator.CellComponent): string;
  statFormatter(cell: Tabulator.CellComponent, view: 'projected' | 'lastYear'): string;
}