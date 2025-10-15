export type CategoryName = 'pts' | 'ast' | 'reb' | 'threes' | 'fg_pct' | 'ft_pct' | 'stl' | 'blk' | 'to';

export interface ZScoreCalculation {
  category: CategoryName;
  mean: number;
  standardDeviation: number;
  playerScores: Map<string, number>; // playerId -> z-score
}

export interface PlayerRanking {
  playerId: string;
  totalZScore: number;
  categoryZScores: Record<CategoryName, number>;
  rank: number;
  qualifiesForPercentages: {
    fg_pct: boolean;  // >= 5 FGA per game
    ft_pct: boolean;  // >= 2 FTA per game
  };
}

export interface PlayerVisualIndicators {
  playerId: string;
  bestCategory: CategoryName | null;
  worstCategory: CategoryName | null;
  highlightedStats: {
    [key in CategoryName]?: 'best' | 'worst' | 'neutral';
  };
}