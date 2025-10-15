export interface PlayerStats {
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