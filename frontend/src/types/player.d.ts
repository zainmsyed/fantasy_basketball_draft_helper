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
