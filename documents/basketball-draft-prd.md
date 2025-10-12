### 7.5 Deployment
- **Frontend Hosting:** Netlify, Vercel, or GitHub Pages (static site)
- **No Backend Required:** Fully client-side application
- **Assets:** Bundle includes `last_year_stats.json` file (~500KB-1MB estimated)# Product Requirements Document: Basketball Draft Helper (MVP)

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
  - Projected Stats (PTS, AST, REB, 3PM, FG%, FT%, STL, BLK, TO)
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

**Non-Weighted Informational Stats:**
- Games Played (GP) - Displayed for context (injury history) but not used in ranking calculations

#### 4.1.3 Statistical Data Sources
- **Last Year Stats:** Pre-generated from `nba_api` Python library (see Section 7.4)
- **Projected Stats:** Included in user's uploaded CSV
- **Data Format:** JSON file (`last_year_stats.json`) bundled with application

### 4.2 Data Processing

#### 4.2.1 Statistical Data Integration
- **Last Year Stats Source:** Pre-generated JSON file from Python script using `nba_api`
  - Python script runs once pre-season to fetch previous season stats
  - Outputs `last_year_stats.json` file included with web app
  - No live API calls during user sessions
- **Projected Stats Source:** User-provided CSV (included in their rankings upload)
- **Data Merging:** App matches player names between uploaded CSV and JSON file
- **Missing Players:** Leave statistics blank if player not found in JSON data

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
- **Sticky Headers:** Column headers remain fixed/visible when scrolling through player list

#### 4.7.2 Statistical Display Toggle
- **View Modes:**
  - Last Year Stats
  - Projected Stats
- **Toggle Control:** Switch between views (only one visible at a time)

#### 4.7.3 Visual Indicators (Per Player)
- **Green Highlight:** Player's best statistical category (among the 9 fantasy categories only)
- **Red Highlight:** Player's worst statistical category (among the 9 fantasy categories only)
- **Excluded from Highlighting:** GP (Games Played), Team, Position, Expert Rank, Algo Rank
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
- **Initial Load:** < 2 seconds (including JSON file load)
- **CSV Upload Processing:** < 3 seconds for 200 players
- **Data Merging:** < 1 second (CSV + JSON matching)
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
- Columns: Player Name, Team, Position, GP (Games Played), Expert Rank, Algo Rank, PTS, AST, REB, 3PM, FG%, FT%, STL, BLK, TO
- Sortable headers
- Position filter
- Green/red highlighting per player (excludes GP, Team, Position from highlighting)
- Drafted player styling (crossed-out, grayed)

**Side Panel or Bottom Section - Team Summary:**
- "My Team" heading
- List of drafted players on user's team
- Weekly total projections for all 9 categories
- Player count

---

## 7. Technical Architecture

### 7.1 Frontend
- **Build Tool:** Vite (vanilla JavaScript template)
- **Reactive Framework:** Alpine.js (lightweight reactivity, ~15kb)
- **Styling:** Tailwind CSS with DaisyUI component library
- **Table Component:** Tabulator (full-featured table with built-in sorting/filtering)
- **Data Management:** LocalForage (enhanced localStorage)

### 7.2 Data Layer
- **CSV Parsing:** PapaParse library
- **Data Manipulation:** Lodash utilities
- **Static Data:** Pre-generated `last_year_stats.json` file (bundled with app)
- **Storage:** LocalForage for persisting user data (drafts, strategies)

### 7.3 Algorithm Implementation
- **Z-Score Calculation:** Pure JavaScript mathematical functions
- **Real-time Recalculation:** Triggered by Alpine.js reactive state changes

### 7.4 Python Data Pipeline (Pre-Season Setup)
- **Purpose:** One-time generation of historical stats
- **Library:** `nba_api` (official NBA stats API wrapper)
- **Script:** `fetch_stats.py`
- **Output:** `last_year_stats.json` (placed in `/public` or `/src/data` directory)
- **Execution:** Run manually before each fantasy season
- **No Runtime Dependency:** Python not required for web app to function

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
- `nba_api` Python library provides accurate historical stats
- User's CSV includes projected stats for upcoming season
- 150-200 player pool is sufficient for most drafts
- Users have stable internet connection during uploads
- CSV files from users are reasonably well-formatted
- JSON file size (~1MB) loads quickly on standard connections

### 10.2 Validation Needed
- `nba_api` library testing for data completeness and accuracy
- Player name matching algorithm between CSV and JSON data
- Testing with various CSV formats from popular sources (Yahoo, ESPN, FantasyPros)
- Browser storage limits for typical use case
- Z-score calculation accuracy validation against known fantasy tools
- JSON file size optimization

---

## 11. Release Criteria

### 11.1 MVP Must-Have Features
✅ CSV upload with flexible column mapping (including projections)  
✅ Pre-generated JSON file with last year stats from `nba_api`  
✅ Player name matching between CSV and JSON data  
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
- Python data generation script functional and tested
- Player name matching algorithm reliable (handles variations)
- Z-score calculations validated
- No critical bugs in draft tracking
- Local storage save/load working reliably
- CSV parsing handles edge cases gracefully

---

## 12. Timeline Estimate (Development)

**Phase 0 - Data Preparation (Week 1)**
- Python script development using `nba_api`
- Generate `last_year_stats.json`
- Data validation and testing

**Phase 1 - Foundation (Week 2-3)**
- Vite + Alpine.js project setup
- UI layout with Tailwind + DaisyUI
- Tabulator integration for data table

**Phase 2 - Data Integration (Week 4)**
- CSV upload and parsing with PapaParse
- Player name matching algorithm (CSV ↔ JSON)
- Data merging and validation

**Phase 3 - Core Logic (Week 5)**
- Z-score ranking algorithm
- Category selection and dynamic reranking
- Last year/projected stats toggle

**Phase 4 - Draft Features (Week 6)**
- Draft tracking (mark drafted, my team)
- Team summary calculations
- Undo functionality

**Phase 5 - Strategy Management (Week 7)**
- Save/load strategies
- Export functionality
- LocalForage implementation

**Phase 6 - Polish & Testing (Week 8)**
- Visual indicators (green/red highlighting)
- Performance optimization
- Cross-browser testing
- Bug fixes and refinement

**Total Estimated Timeline:** 8 weeks for single developer

---

## Appendix A: Data Schema Examples

### CSV Input Format (Example)
```
Player Name,Team,Position,Rank,Proj PTS,Proj AST,Proj REB,Proj 3PM,Proj FG%,Proj FT%,Proj STL,Proj BLK,Proj TO
LeBron James,LAL,SF/PF,15,24.5,7.0,8.0,1.9,0.510,0.740,1.2,0.5,3.3
Stephen Curry,GSW,PG,8,28.2,6.5,5.1,4.8,0.462,0.915,1.6,0.4,3.1
Nikola Jokic,DEN,C,1,26.8,9.2,12.1,0.8,0.632,0.825,1.3,0.7,3.2
```

### JSON Structure (last_year_stats.json from nba_api)
```javascript
{
  "LeBron James": {
    "team": "LAL",
    "gp": 71,  // Games Played
    "pts": 25.7,
    "ast": 7.3,
    "reb": 8.3,
    "threes": 2.1,
    "fg_pct": 0.504,
    "ft_pct": 0.750,
    "fga": 19.5,
    "fta": 6.8,
    "stl": 1.3,
    "blk": 0.6,
    "to": 3.5
  },
  // ... more players
}
```

### Python Script Example (fetch_stats.py)
```python
from nba_api.stats.endpoints import leaguedashplayerstats
import json

# Fetch 2023-24 season stats
stats = leaguedashplayerstats.LeagueDashPlayerStats(
    season='2023-24',
    per_mode_detailed='PerGame'
)

# Process and format data
player_data = {}
for player in stats.get_dict()['resultSets'][0]['rowSet']:
    player_data[player[1]] = {  # player[1] is player name
        "team": player[4],
        "gp": player[5],  # Games played
        "pts": player[26],
        "ast": player[21],
        "reb": player[20],
        # ... map other stats
    }

# Save to JSON
with open('last_year_stats.json', 'w') as f:
    json.dump(player_data, f, indent=2)
```

### Local Storage Structure (Conceptual)
```javascript
{
  uploadedPlayers: [...],
  lastYearStats: {...},  // Loaded from JSON file
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