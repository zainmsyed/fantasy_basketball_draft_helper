# Basketball Draft Helper - Constitution

## 1. Project Identity

### 1.1 Mission Statement
Basketball Draft Helper is a **single-purpose, offline-first fantasy basketball draft optimization tool** that provides clean, algorithmic player rankings with punt strategy customization for 9-category Head-to-Head leagues.

### 1.2 Core Principles
- **Simplicity First**: Every feature must have clear, immediate value to the draft process
- **Data Integrity**: Statistical calculations must be mathematically sound and transparent
- **Performance**: All operations must feel instantaneous during live drafts
- **Offline-First**: Core functionality works without internet after initial data load
- **No Vendor Lock-in**: Users own their data; export capabilities are fundamental

---

## 2. Technical Architecture Constitution

### 2.1 Technology Stack Constraints

#### Frontend Framework
- **Vanilla JavaScript + Modern Web APIs** for core functionality
- **No Heavy Frameworks**: Avoid React/Vue/Angular to maintain simplicity and performance
- **Progressive Enhancement**: HTML-first approach with JavaScript enhancements

#### Data Architecture
- **Browser LocalStorage as Single Source of Truth**
- **No Backend Dependencies** for core functionality
- **API Integration**: Basketball Reference only, with full offline fallback

#### Styling
- **CSS Custom Properties** for theming
- **No CSS Frameworks**: Custom CSS for full control and minimal bundle size
- **Mobile-Last Approach**: Desktop-optimized first, mobile as enhancement

### 2.2 Code Organization Principles

#### File Structure
```
src/
├── core/               # Business logic modules
│   ├── ranking.js      # Z-score calculations
│   ├── storage.js      # LocalStorage abstraction
│   └── stats.js        # Statistical utilities
├── data/               # Data handling
│   ├── csv-parser.js   # CSV upload and parsing
│   └── api-client.js   # Basketball Reference integration
├── ui/                 # User interface modules
│   ├── table.js        # Player data table
│   ├── controls.js     # Strategy and filter controls
│   └── summary.js      # Team summary panel
├── utils/              # Shared utilities
│   └── helpers.js      # Common functions
└── app.js              # Application bootstrap
```

#### Module Design Rules
- **Single Responsibility**: Each module handles one domain concept
- **Pure Functions**: Business logic functions must be side-effect free
- **Dependency Injection**: Modules receive dependencies rather than importing them
- **Event-Driven Communication**: UI components communicate via custom events

### 2.3 Data Flow Architecture

#### State Management
```
User Input → Data Validation → Core Logic → State Update → UI Refresh
```

#### State Shape (LocalStorage Schema)
```javascript
{
  // Raw user data
  players: [/* original CSV data */],
  
  // Enriched data
  playersWithStats: [/* players + fetched statistics */],
  
  // User preferences
  puntStrategy: {
    name: string,
    excludedCategories: string[]
  },
  savedStrategies: [/* named strategies */],
  
  // Draft state
  draftedPlayers: Set<string>,
  myTeam: Set<string>,
  
  // UI state
  currentStatsView: 'lastYear' | 'projected',
  filters: {
    position: string[],
    searchText: string
  }
}
```

---

## 3. Business Logic Constitution

### 3.1 Statistical Calculation Rules

#### Z-Score Algorithm
```javascript
// Standardized formula for all categories
const zScore = (playerValue, leagueMean, leagueStdDev) => {
  return (playerValue - leagueMean) / leagueStdDev;
};

// Turnover inversion (fewer is better)
const turnoverZScore = (playerTO, leagueMean, leagueStdDev) => {
  return -(playerTO - leagueMean) / leagueStdDev;
};
```

#### Percentage Qualification Thresholds
- **FG%**: Minimum 5 FGA per game
- **FT%**: Minimum 2 FTA per game
- **Unqualified players**: Excluded from percentage category calculations only

#### Ranking Aggregation
```javascript
const calculatePlayerRank = (player, excludedCategories) => {
  const qualifyingCategories = ALL_CATEGORIES
    .filter(cat => !excludedCategories.includes(cat))
    .filter(cat => playerQualifiesForCategory(player, cat));
    
  return qualifyingCategories
    .map(cat => calculateZScore(player, cat))
    .reduce((sum, zScore) => sum + zScore, 0);
};
```

### 3.2 Draft Logic Rules

#### Player Status Hierarchy
1. **Available**: Default state, included in all calculations
2. **Drafted (Others)**: Excluded from rankings, visible but grayed out
3. **My Team**: Excluded from rankings, special visual treatment

#### Re-ranking Triggers
- Category selection changes (punt strategy)
- Player draft status changes
- Statistical view toggle (last year ↔ projected)

---

## 4. User Experience Constitution

### 4.1 Interaction Principles

#### Performance Standards
- **Initial Load**: < 3 seconds (including CSV upload UI)
- **CSV Processing**: < 5 seconds for 200 players
- **Re-ranking**: < 100ms (must feel instantaneous)
- **Search/Filter**: < 50ms response time

#### Visual Feedback Requirements
- **Immediate**: All clicks/taps show visual response within 16ms
- **Loading States**: Any operation > 200ms shows progress indicator
- **Error States**: All failures show clear, actionable error messages

### 4.2 Data Table Constitution

#### Column Priorities (Left to Right)
1. Player Name (always visible, sortable)
2. Team (3-letter abbreviation)
3. Position (multi-position display: "PG/SG")
4. Expert Rank (from CSV)
5. Algo Rank (calculated)
6. Statistical Categories (based on current view)

#### Sorting Behavior
- **Default**: Algo Rank ascending (best players first)
- **Secondary Sort**: Expert Rank when Algo Ranks are equal
- **Drafted Players**: Always sort to bottom regardless of other sorting

#### Visual Enhancement Rules
- **Best Category**: Green highlight on highest Z-score stat
- **Worst Category**: Red highlight on lowest Z-score stat
- **Drafted Players**: 50% opacity, strikethrough text
- **My Team**: Bold text, distinct background color

### 4.3 Strategy Management UX

#### Punt Strategy Selection
- **Multi-select Interface**: Checkboxes for each category
- **Real-time Preview**: Rankings update as categories are toggled
- **Visual Feedback**: Removed categories remain visible but dimmed

#### Strategy Persistence
- **Auto-save**: Current strategy automatically saved as "Last Used"
- **Named Strategies**: User can save with custom names
- **Strategy Export**: Generate CSV with current rankings and strategy name

---

## 5. Data Integrity Constitution

### 5.1 CSV Input Validation

#### Required Fields Validation
```javascript
const REQUIRED_COLUMNS = ['playerName', 'team', 'position', 'expertRank'];

const validateCSVData = (rows) => {
  // Check for required columns
  // Validate data types
  // Check for duplicates
  // Return validation errors or cleaned data
};
```

#### Data Cleaning Rules
- **Player Names**: Trim whitespace, normalize casing
- **Team Abbreviations**: Validate against known NBA teams
- **Positions**: Standardize format (PG, SG, SF, PF, C)
- **Rankings**: Must be positive integers

### 5.2 API Data Handling

#### Basketball Reference Integration
- **Caching Strategy**: Store API responses with timestamp
- **Cache Invalidation**: Data expires after 24 hours
- **Error Handling**: Graceful degradation when API unavailable
- **Rate Limiting**: Respect API limits with request queuing

#### Missing Data Protocol
```javascript
const handleMissingPlayer = (playerName) => {
  // Log missing player for user awareness
  // Continue processing other players
  // Show empty stats for missing players
  // Allow manual stat entry (future enhancement)
};
```

---

## 6. Development Workflow Constitution

### 6.1 Code Quality Standards

#### JavaScript Standards
- **ES6+ Features**: Use modern JavaScript features
- **Strict Mode**: All files must use 'use strict'
- **No Global Variables**: Everything in module scope or explicit namespacing
- **Error Handling**: All async operations must have error handling

#### Testing Requirements
- **Unit Tests**: All business logic functions (core/) must have tests
- **Integration Tests**: Data flow between modules
- **Manual Testing**: UI interactions and edge cases
- **Performance Tests**: Validate speed requirements

#### Documentation Standards
- **Function Documentation**: JSDoc for all public functions
- **Module Documentation**: Purpose and public API description
- **README**: Installation, usage, and contribution guidelines

### 6.2 Git Workflow

#### Branch Strategy
- **main**: Production-ready code only
- **develop**: Integration branch for features
- **feature/***: Individual feature development
- **hotfix/***: Critical production fixes

#### Commit Standards
```
type(scope): description

feat(ranking): add punt strategy save/load functionality
fix(csv): handle malformed position data gracefully
docs(api): update Basketball Reference integration guide
test(core): add z-score calculation edge cases
```

---

## 7. Deployment Constitution

### 7.1 Build Process

#### Development Build
- **Live Reload**: Automatic browser refresh on file changes
- **Source Maps**: Full debugging capability
- **No Minification**: Readable code for development

#### Production Build
- **Minification**: JavaScript and CSS optimization
- **Asset Optimization**: Image compression, font subsetting
- **Cache Busting**: Filename hashing for browser cache invalidation

### 7.2 Hosting Requirements

#### Static Site Hosting
- **No Server Required**: Can be hosted on any static file server
- **CDN Compatible**: All assets can be cached at edge
- **Offline Capability**: Service worker for offline functionality

#### Deployment Targets
- **Primary**: GitHub Pages (free, integrated with repository)
- **Alternative**: Netlify, Vercel (for custom domain/features)
- **Local**: Can run from file:// protocol for development

---

## 8. Security Constitution

### 8.1 Data Security

#### User Data Protection
- **No Server Storage**: User data never leaves their device
- **LocalStorage Encryption**: Consider encrypting sensitive strategy data
- **No Tracking**: No analytics or user behavior tracking
- **Export Control**: Users have full control over their data export

#### Input Sanitization
```javascript
const sanitizeInput = (userInput) => {
  // Remove HTML tags
  // Escape special characters
  // Validate against expected patterns
  // Return safe string or throw validation error
};
```

### 8.2 API Security

#### Basketball Reference API
- **No API Keys**: Use public endpoints only
- **Rate Limiting**: Implement client-side rate limiting
- **Error Handling**: Don't expose API errors to users
- **Fallback Data**: Cached data when API unavailable

---

## 9. Maintenance Constitution

### 9.1 Dependency Management

#### External Dependencies
- **Minimize Dependencies**: Only include truly necessary libraries
- **Security Updates**: Regular dependency auditing and updates
- **Bundle Size**: Monitor and limit total JavaScript bundle size
- **Browser Compatibility**: Test across supported browsers

#### Allowed Dependencies
- **CSV Parsing**: PapaParse (proven, lightweight)
- **Date Utilities**: Native Date API (no library needed)
- **HTTP Requests**: Fetch API (native)
- **Testing**: Jest (development only)

### 9.2 Performance Monitoring

#### Metrics to Track
- **Bundle Size**: JavaScript + CSS total size
- **Load Time**: Time to interactive measurement
- **Memory Usage**: Monitor for memory leaks
- **Calculation Speed**: Z-score and ranking performance

#### Performance Budgets
- **JavaScript Bundle**: < 100KB gzipped
- **Initial Load**: < 3 seconds on 3G connection
- **Re-ranking**: < 100ms for 200 players
- **Memory**: < 50MB total memory usage

---

## 10. Evolution Guidelines

### 10.1 Feature Addition Process

#### New Feature Evaluation
1. **User Value**: Does it directly improve draft decisions?
2. **Complexity Cost**: Does it maintain simplicity principle?
3. **Performance Impact**: Does it meet performance standards?
4. **Maintenance Burden**: Can it be maintained long-term?

#### Feature Approval Criteria
- **80/20 Rule**: Feature must benefit 80% of users
- **No Configuration Creep**: Avoid adding too many options
- **Mobile Consideration**: Must work on mobile devices
- **Export Compatibility**: Must work with export functionality

### 10.2 Breaking Change Policy

#### Backward Compatibility
- **LocalStorage Schema**: Migrations required for breaking changes
- **CSV Format**: Must support existing CSV formats
- **Export Format**: Generated files must remain compatible

#### Version Management
- **Semantic Versioning**: MAJOR.MINOR.PATCH format
- **Change Documentation**: All breaking changes documented
- **Migration Guides**: Step-by-step upgrade instructions

---

## 11. Success Metrics Constitution

### 11.1 Technical Metrics

#### Performance KPIs
- **Page Load Speed**: < 3 seconds (target: < 2 seconds)
- **Error Rate**: < 1% of user sessions
- **Browser Compatibility**: 95% of target browsers
- **Offline Functionality**: 100% core features work offline

#### Code Quality KPIs
- **Test Coverage**: > 80% for business logic
- **Bundle Size**: < 100KB total
- **Technical Debt**: Regular refactoring schedule
- **Documentation**: 100% public API documented

### 11.2 User Experience Metrics

#### Usability KPIs
- **Time to First Draft**: < 5 minutes from CSV upload
- **Feature Discovery**: Core features used within first session
- **Error Recovery**: Users can recover from all error states
- **Data Persistence**: 100% reliability for saved data

---

## 12. Decision Records

### 12.1 Architecture Decisions

#### ADR-001: Vanilla JavaScript Over Frameworks
**Decision**: Use vanilla JavaScript instead of React/Vue/Angular
**Reasoning**: Simplicity, performance, and minimal dependencies
**Consequences**: More manual DOM management, but full control

#### ADR-002: LocalStorage Over Backend
**Decision**: Use browser LocalStorage as primary data store
**Reasoning**: Offline-first requirement, user data ownership
**Consequences**: No cross-device sync, limited storage space

#### ADR-003: Basketball Reference API
**Decision**: Use Basketball Reference as sole data source
**Reasoning**: Reliable, comprehensive, free access
**Consequences**: Dependency on external service, rate limiting

### 12.2 Business Logic Decisions

#### ADR-004: Z-Score Ranking Algorithm
**Decision**: Implement Z-score based player ranking
**Reasoning**: Industry standard, mathematically sound
**Consequences**: Complex calculations, but accurate rankings

#### ADR-005: Equal Category Weighting
**Decision**: All categories weighted equally in rankings
**Reasoning**: Simplicity, user controls via punt strategies
**Consequences**: No advanced weighting, but clear user control

---

This constitution serves as the immutable foundation for the Basketball Draft Helper project. All implementation decisions must align with these principles, and any deviations require explicit justification and documentation as additional decision records.