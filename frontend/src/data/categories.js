// Fantasy basketball statistical categories
export const FANTASY_CATEGORIES = [
  'pts',     // Points
  'ast',     // Assists
  'reb',     // Rebounds
  'threes',  // Three-pointers made
  'fg_pct',  // Field goal percentage
  'ft_pct',  // Free throw percentage
  'stl',     // Steals
  'blk',     // Blocks
  'to'       // Turnovers (negative category)
];

export const CATEGORY_DISPLAY_NAMES = {
  pts: 'Points',
  ast: 'Assists',
  reb: 'Rebounds',
  threes: '3-Pointers',
  fg_pct: 'FG%',
  ft_pct: 'FT%',
  stl: 'Steals',
  blk: 'Blocks',
  to: 'Turnovers'
};

export const CATEGORY_DESCRIPTIONS = {
  pts: 'Total points scored per game',
  ast: 'Assists per game',
  reb: 'Total rebounds per game',
  threes: 'Three-point field goals made per game',
  fg_pct: 'Field goal shooting percentage',
  ft_pct: 'Free throw shooting percentage',
  stl: 'Steals per game',
  blk: 'Blocks per game',
  to: 'Turnovers per game (negative stat)'
};

export const NEGATIVE_CATEGORIES = ['to'];