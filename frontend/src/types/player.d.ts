export interface ProjectedStats {
  pts: number | null;
  ast: number | null;
  reb: number | null;
  threes: number | null;
  fg_pct: number | null;
  ft_pct: number | null;
  stl: number | null;
  blk: number | null;
  to: number | null;
}

export interface UploadedPlayer {
  name: string;
  team?: string;
  position: string;
  expertRank: number;
  projectedStats: ProjectedStats;
  csvRowIndex: number;
}

export interface HistoricalStats {
  name: string;
  team: string;
  gp: number;
  pts: number;
  ast: number;
  reb: number;
  threes: number;
  fg_pct: number;
  ft_pct: number;
  fga: number;
  fta: number;
  stl: number;
  blk: number;
  to: number;
}

export interface ColumnMapping {
  playerNameColumn: string;
  teamColumn: string;
  positionColumn: string;
  rankColumn: string;
  statColumns: Record<string, string>;
  csvColumns: string[];
  autoDetected: boolean;
  savedAt: string | null;
}

export interface IntegratedPlayer extends UploadedPlayer {
  id: string;
  historicalStats: HistoricalStats | null;
  matchConfidence: number;
  hasHistoricalData: boolean;
  matchedBy: 'exact' | 'fuzzy' | 'manual' | 'none';
  dataQualityFlags: any[];
  validationIssues: any[];
  createdAt: string;
  updatedAt: string;
}
export interface PlayerStats {
  gp: number
  pts: number
  ast: number
  reb: number
  threes?: number
  fg_pct?: number
  ft_pct?: number
  stl?: number
  blk?: number
  to?: number
}

export interface Player {
  id: string
  name: string
  team: string
  positions: string[]
  stats: PlayerStats
  expert_rank?: number | null
  algo_rank?: number | null
}

export interface SampleDataBundle {
  players: Player[]
}
