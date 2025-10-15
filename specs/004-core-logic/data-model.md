# Data Model: Core Logic Implementation

**Date**: 2025-10-14  
**Phase**: 1 - Design & Contracts  
**Feature**: Core Logic Implementation

## Core Entities

### Player Stats
```typescript
interface PlayerStats {
  // Identification
  id: string;
  name: string;
  team: string;
  position: string[];
  
  // Core statistics (9 fantasy categories)
  stats: {
    pts: number;     // Points
    ast: number;     // Assists  
    reb: number;     // Rebounds
    threes: number;  // Three-pointers made (3PM)
    fg_pct: number;  // Field goal percentage
    ft_pct: number;  // Free throw percentage
    stl: number;     // Steals
    blk: number;     // Blocks
    to: number;      // Turnovers (negative category)
  };
  
  // Supporting data
  gp: number;        // Games played (informational only)
  fga: number;       // Field goal attempts (for qualification)
  fta: number;       // Free throw attempts (for qualification)
  
  // Ranking information
  expertRank: number;     // Original CSV ranking
  algoRank?: number;      // Calculated Z-score ranking
  
  // Draft status
  isDrafted: boolean;
  isMyTeam: boolean;
}
```

### Punt Strategy
```typescript
interface PuntStrategy {
  id: string;
  name: string;
  includedCategories: CategoryName[];
  createdAt: Date;
  isActive: boolean;
}

type CategoryName = 'pts' | 'ast' | 'reb' | 'threes' | 'fg_pct' | 'ft_pct' | 'stl' | 'blk' | 'to';
```

### Z-Score Calculation
```typescript
interface ZScoreCalculation {
  category: CategoryName;
  mean: number;
  standardDeviation: number;
  playerScores: Map<string, number>; // playerId -> z-score
}

interface PlayerRanking {
  playerId: string;
  totalZScore: number;
  categoryZScores: Record<CategoryName, number>;
  rank: number;
  qualifiesForPercentages: {
    fg_pct: boolean;  // >= 5 FGA per game
    ft_pct: boolean;  // >= 2 FTA per game
  };
}
```

### Visual Indicators
```typescript
interface PlayerVisualIndicators {
  playerId: string;
  bestCategory: CategoryName | null;
  worstCategory: CategoryName | null;
  highlightedStats: {
    [key in CategoryName]?: 'best' | 'worst' | 'neutral';
  };
}
```

### Stat Display Configuration
```typescript
interface StatDisplayConfig {
  currentView: 'projected' | 'lastYear';
  availableViews: ('projected' | 'lastYear')[];
}
```

## Data Relationships

### Player -> Stats
- One-to-many: Each player has both projected and historical stats
- Constraint: All 9 fantasy categories must be present (can be null for missing data)
- Validation: Percentage stats require minimum attempt thresholds for qualification

### Player -> Rankings  
- One-to-one: Each player has exactly one current algorithmic ranking
- Dependency: Rankings recalculated when punt strategy changes
- Constraint: Drafted players excluded from ranking calculations

### Strategy -> Categories
- Many-to-many: Each strategy includes/excludes multiple categories
- Constraint: At least one category must be included
- Default: All 9 categories included for new strategies

### Calculation -> Rankings
- One-to-many: Each calculation set produces rankings for all qualified players
- Constraint: Only players meeting qualification thresholds included in percentage categories
- Update trigger: Any change to included categories or player draft status

## State Transitions

### Player Draft Status
```
Available -> Drafted (any user action)
Drafted -> Available (undo action)
Available -> MyTeam (user drafts player)
MyTeam -> Available (undo action)
```

### Punt Strategy Lifecycle
```
Default (all categories) -> Custom (user modifications)
Custom -> Saved (user saves strategy)
Saved -> Active (user loads saved strategy)
```

### Ranking Calculation Triggers
```
Data Load -> Initial Calculation
Category Change -> Recalculation  
Player Drafted -> Filtered Recalculation
Stat View Toggle -> View-Specific Calculation
```

## Validation Rules

### Statistical Data
- All stat values must be non-negative (except TO which can be zero)
- Percentage stats (FG%, FT%) must be between 0.0 and 1.0
- Games played (GP) must be positive integer
- Attempt totals (FGA, FTA) must be >= 0

### Qualification Thresholds
- FG% qualification: (FGA / GP) >= 5.0
- FT% qualification: (FTA / GP) >= 2.0
- Unqualified players excluded from percentage category calculations

### Punt Strategy
- Minimum 1 category must be included
- Maximum 9 categories can be included
- Category names must match defined CategoryName type

### Performance Constraints
- Maximum 200 players supported
- Ranking calculations must complete in <100ms
- Visual indicator updates must be immediate (<50ms)

## Data Storage Schema

### LocalForage Keys
```typescript
const STORAGE_KEYS = {
  PUNT_STRATEGIES: 'draft_helper_punt_strategies',
  ACTIVE_STRATEGY: 'draft_helper_active_strategy', 
  STAT_DISPLAY_CONFIG: 'draft_helper_stat_display',
  CALCULATION_CACHE: 'draft_helper_calculation_cache'
} as const;
```

### Cache Structure
```typescript
interface CalculationCache {
  lastUpdated: Date;
  includedCategories: CategoryName[];
  categoryStats: Record<CategoryName, {
    mean: number;
    standardDeviation: number;
    qualifiedPlayerCount: number;
  }>;
  playerRankings: PlayerRanking[];
  visualIndicators: Record<string, PlayerVisualIndicators>;
}
```

## Integration Points

### With Existing Data Layer
- Extends existing Player entity from CSV processor
- Integrates with LocalForage storage service
- Compatible with Tabulator table data format

### With UI Components  
- Reactive bindings with Alpine.js data
- Custom Tabulator cell formatters for visual indicators
- Real-time updates through observable data patterns

### Performance Optimizations
- Memoized calculation results
- Incremental updates for draft status changes
- Efficient array operations for large datasets