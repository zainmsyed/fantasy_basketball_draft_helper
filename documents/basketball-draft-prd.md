# Product Requirements Document: Basketball Draft Helper (MVP)

## 1. Overview

### 1.1 Product Vision
Basketball Draft Helper is a web-based tool designed for fantasy basketball enthusiasts participating in 9-category Head-to-Head (H2H) leagues. The tool enables users to make informed draft decisions by providing dynamic player rankings that adapt to different punt strategies.

### 1.2 Target User
Fantasy basketball players in 9-category H2H leagues (typically 10-team formats) who want to optimize their draft strategy based on specific builds.

### 1.3 Core Value Proposition
- Import expert rankings and enhance them with historical and projected statistical data
- Dynamically rerank players based on customized punt strategies
- Track drafted players and monitor team composition in real-time during drafts

---

## 2. Scope

### 2.1 In Scope for MVP
- CSV upload with flexible column mapping
- Integration with Basketball Reference API for stat retrieval
- Dynamic player ranking algorithm using Z-scores
- Punt strategy customization and saving
- Draft tracking (mark players as drafted)
- Team summary statistics
- Strategy export functionality
- Browser local storage for data persistence

### 2.2 Out of Scope for MVP
- User accounts and authentication
- Multi-device synchronization
- Round-by-round draft board view
- Roster size limits
- Mobile-specific optimization
- Real-time multi-user draft synchronization
- Projection generation (relies on existing projections)

---

## 3. User Stories

### 3.1 Core Workflow
**As a fantasy basketball player, I want to:**
1. Upload my pre-draft player rankings
2. Have the system automatically fetch relevant statistics
3. See how players rank using an algorithmic approach
4. Customize rankings based on categories I plan to punt
5. Track which players have been drafted
6. Monitor my team's statistical profile
7. Save and reuse successful punt strategies

---

## 4. Functional Requirements

### 4.1 Data Input

#### 4.1.1 CSV Upload
- **File Format:** Accept .csv files only
- **Required Data Fields:**
  - Player Name
  - Team
  - Position
  - Rank (Expert Rank)
- **Column Mapping:**
  - Flexible column detection allowing users to map CSV columns to required fields
  - No persistence of column mappings between sessions
  - Fresh mapping required for each upload

#### 4.1.2 Statistical Categories
The system will track 9 fantasy categories:
1. Points (PTS)
2. Assists (AST)
3. Rebounds (REB)
4. Three-Pointers Made (3PM)
5. Field Goal Percentage (FG%)
6. Free Throw Percentage (FT%)
7. Steals (STL)
8. Blocks (BLK)
9. Turnovers (TO) - *negative category, fewer is better*

#### 4.1.3 Statistical Data Types
- **Last Year Stats:** Actual performance from previous season
- **Projected Stats:** Forecasted performance for upcoming season
- **Data Sources:** Basketball Reference API (fetched once and cached)

### 4.2 Data Processing

#### 4.2.1 API Integration
- **Trigger:** Automatic fetch upon CSV upload completion
- **Caching:** Store fetched statistics in browser local storage
- **No repeated API calls** unless user explicitly refreshes data
- **Missing Players:** Leave statistics blank if player not found in Basketball Reference

#### 4.2.2 Percentage Stat Thresholds
To ensure statistical relevance:
- **FG% Qualification:** Minimum 5 FGA per game
- **FT% Qualification:** Minimum 2 FTA per game
- Players below thresholds are excluded from percentage calculations in ranking algorithm

### 4.3 Ranking Algorithm

#### 4.3.1 Methodology
- **Algorithm Type:** Z-score based ranking (industry standard for 9-cat leagues)
- **Category Weighting:** All 9 categories weighted equally by default
- **Turnover Handling:** Treated as purely negative (inverted Z-score)
- **Dynamic Recalculation:** Rankings update automatically when:
  - Categories are removed (punt strategies)
  - Players are marked as drafted

#### 4.3.2 Rank Display
- **Expert Rank:** Original ranking from uploaded CSV (static)
- **Algo Rank:** System-calculated ranking based on Z-scores (dynamic)
- Both ranks displayed side-by-side for comparison

#### 4.3.3 Auto-Reranking on Draft Picks
- When players are marked as drafted, remaining players automatically rerank
- Example: If #1 ranked player is drafted, #2 becomes new #1
- Performance target: Recalculation in milliseconds (<100ms)

### 4.4 Punt Strategy Customization

#### 4.4.1 Category Selection
- **Interface:** Checkboxes or toggle buttons for each of the 9 categories
- **Multiple Selection:** Users can remove multiple categories simultaneously
- **Visual Feedback:** Removed categories remain visible in data table but excluded from Algo Rank calculation

#### 4.4.2 Strategy Management
- **Save Strategy:** 
  - User can name and save current punt configuration
  - Unlimited saved strategies
  - Stored in browser local storage
- **Load Strategy:** Quick access to previously saved configurations
- **Export Strategy:** Download reranked player list as CSV file based on selected strategy

### 4.5 Draft Tracking

#### 4.5.1 Marking Players
- **Drafted Status:** Click to mark any player as drafted
- **Visual Treatment:** Crossed-out text + grayed out appearance
- **Visibility:** Drafted players remain in list (not hidden)
- **Team Assignment:** Not tracked in MVP (simple "drafted" flag only)

#### 4.5.2 Undo Functionality
- **One-level undo:** Click again to unmark player as drafted
- Essential for correcting mistakes during live drafts

#### 4.5.3 User Team Tracking
- **My Team:** Separate designation for players drafted by the user
- **No Roster Limits:** Flexible team size for MVP
- **Visual Distinction:** Different styling from other drafted players

### 4.6 Team Summary Statistics

#### 4.6.1 Display Metrics
- **Player Count:** Number of players on user's team
- **Weekly Totals:** Projected team performance across all 9 categories
  - Example: "126.5 PTS per week"
- **Visibility:** All categories shown regardless of punt strategy

#### 4.6.2 Location
- Side panel or bottom section of main interface
- Always visible during draft

### 4.7 User Interface Features

#### 4.7.1 Data Table Functionality
- **Sorting:** Ascending/descending by any column
- **Filtering:** 
  - By position (including multi-position eligibility)
  - Example: Filtering for "SG" shows PG/SG, SG/SF players
- **Search Bar:** Quick player name lookup
- **Column Visibility:** All stat columns always visible

#### 4.7.2 Statistical Display Toggle
- **View Modes:**
  - Last Year Stats
  - Projected Stats
- **Toggle Control:** Switch between views (only one visible at a time)

#### 4.7.3 Visual Indicators (Per Player)
- **Green Highlight:** Player's best statistical category
- **Red Highlight:** Player's worst statistical category
- **Purpose:** Quick identification of player strengths/weaknesses

### 4.8 Data Persistence

#### 4.8.1 Browser Local Storage
- **Stored Data:**
  - Uploaded CSV data and mapped columns
  - Fetched statistical data
  - Saved punt strategies
  - Draft tracking (drafted players, user's team)
  - Current UI state
- **Persistence:** Data remains after browser close/reopen
- **Limitations:**
  - Device/browser specific
  - Cleared with browser data
  - No cross-device access

---

## 5. Non-Functional Requirements

### 5.1 Performance
- **Initial Load:** < 3 seconds
- **CSV Upload Processing:** < 5 seconds for 200 players
- **API Fetch:** < 10 seconds for full player pool
- **Reranking Calculation:** < 100ms
- **Search/Filter Response:** < 100ms

### 5.2 Usability
- **Learning Curve:** Intuitive for users familiar with fantasy basketball
- **No Tutorial Required:** Clean, self-explanatory interface for MVP
- **Responsive Interactions:** Immediate visual feedback for all actions

### 5.3 Browser Compatibility
- **Primary Support:** Chrome, Firefox, Safari, Edge (latest versions)
- **JavaScript Required:** Modern ES6+ support
- **Local Storage Required:** Minimum 5MB available

### 5.4 Data Accuracy
- **Statistical Data:** Sourced from Basketball Reference (reputable)
- **Z-Score Calculation:** Industry-standard mathematical approach
- **Validation:** Column mapping validation during CSV upload

---

## 6. User Interface Layout

### 6.1 Single Page Application
**Top Section - Controls:**
- CSV upload button
- Last Year / Projected stats toggle
- Search bar
- Category selectors (punt strategy)
- Save/Load/Export strategy buttons

**Main Section - Player Table:**
- Columns: Player Name, Team, Position, Expert Rank, Algo Rank, PTS, AST, REB, 3PM, FG%, FT%, STL, BLK, TO
- Sortable headers
- Position filter
- Green/red highlighting per player
- Drafted player styling (crossed-out, grayed)

**Side Panel or Bottom Section - Team Summary:**
- "My Team" heading
- List of drafted players on user's team
- Weekly total projections for all 9 categories
- Player count

---

## 7. Technical Architecture (High-Level)

### 7.1 Frontend
- **Framework:** Vanilla JavaScript or lightweight framework (React recommended for component structure)
- **Styling:** CSS with responsive design principles
- **Data Management:** Browser Local Storage API

### 7.2 Data Layer
- **CSV Parsing:** JavaScript library (e.g., PapaParse)
- **API Integration:** Fetch API for Basketball Reference
- **Caching Strategy:** Store API responses in local storage with timestamps

### 7.3 Algorithm Implementation
- **Z-Score Calculation:** Pure JavaScript mathematical functions
- **Real-time Recalculation:** Triggered by state changes (category toggles, draft picks)

---

## 8. Success Metrics (Post-MVP)

### 8.1 User Engagement
- Number of CSV uploads per session
- Average time spent in draft mode
- Number of saved punt strategies per user

### 8.2 Feature Usage
- Percentage of users utilizing punt strategy customization
- Frequency of stat toggle usage (last year vs. projected)
- Draft tracking completion rate

### 8.3 Performance
- Page load times
- Calculation speed benchmarks
- API fetch success rate

---

## 9. Future Enhancements (Post-MVP)

### 9.1 Phase 2 Features
- User accounts and cloud storage
- Mobile-responsive design
- Advanced filtering (multiple positions, stat thresholds)
- Keeper league support
- Trade analyzer

### 9.2 Phase 3 Features
- Live draft integration with major platforms
- Projection generation based on historical trends
- Team builder with roster constraints
- Mock draft simulator
- Chrome extension for major fantasy sites

---

## 10. Open Questions & Assumptions

### 10.1 Assumptions
- Users have basic familiarity with 9-cat fantasy basketball
- Basketball Reference API is freely accessible without rate limits
- 150-200 player pool is sufficient for most drafts
- Users have stable internet connection during uploads
- CSV files from users are reasonably well-formatted

### 10.2 Validation Needed
- Basketball Reference API documentation review for exact endpoints
- Testing with various CSV formats from popular sources (Yahoo, ESPN)
- Browser storage limits for typical use case
- Z-score calculation accuracy validation against known fantasy tools

---

## 11. Release Criteria

### 11.1 MVP Must-Have Features
✅ CSV upload with flexible column mapping  
✅ Basketball Reference API integration  
✅ Z-score based algo ranking  
✅ Punt strategy customization (remove multiple categories)  
✅ Save/load strategies  
✅ Export reranked list  
✅ Draft tracking with undo  
✅ Team summary with weekly totals  
✅ Search and filter functionality  
✅ Last year/projected stats toggle  
✅ Per-player visual indicators (green/red)  
✅ Browser local storage persistence  

### 11.2 Launch Blockers
- API integration functional and tested
- Z-score calculations validated
- No critical bugs in draft tracking
- Local storage save/load working reliably
- CSV parsing handles edge cases gracefully

---

## 12. Timeline Estimate (Development)

**Phase 1 - Foundation (Week 1-2)**
- UI layout and component structure
- CSV upload and parsing
- Data table with sorting/filtering

**Phase 2 - Core Logic (Week 3-4)**
- Basketball Reference API integration
- Z-score ranking algorithm
- Category selection and reranking

**Phase 3 - Draft Features (Week 5)**
- Draft tracking (mark drafted, my team)
- Team summary calculations
- Undo functionality

**Phase 4 - Strategy Management (Week 6)**
- Save/load strategies
- Export functionality
- Local storage implementation

**Phase 5 - Polish & Testing (Week 7-8)**
- Visual indicators (green/red highlighting)
- Performance optimization
- Cross-browser testing
- Bug fixes and refinement

**Total Estimated Timeline:** 8 weeks for single developer

---

## Appendix A: Data Schema Examples

### CSV Input Format (Example)
```
Player Name,Team,Position,Rank
LeBron James,LAL,SF/PF,15
Stephen Curry,GSW,PG,8
Nikola Jokic,DEN,C,1
```

### API Response Structure (Conceptual)
```javascript
{
  playerName: "LeBron James",
  lastYear: {
    pts: 25.7,
    ast: 7.3,
    reb: 8.3,
    threes: 2.1,
    fg_pct: 0.504,
    ft_pct: 0.750,
    stl: 1.3,
    blk: 0.6,
    to: 3.5
  },
  projected: {
    pts: 24.5,
    ast: 7.0,
    reb: 8.0,
    threes: 1.9,
    fg_pct: 0.510,
    ft_pct: 0.740,
    stl: 1.2,
    blk: 0.5,
    to: 3.3
  }
}
```

### Local Storage Structure (Conceptual)
```javascript
{
  uploadedPlayers: [...],
  fetchedStats: {...},
  savedStrategies: [
    {
      name: "Punt FT% + TO",
      excludedCategories: ["ft_pct", "to"]
    }
  ],
  draftedPlayers: [...],
  myTeam: [...],
  currentView: "projected"
}
```