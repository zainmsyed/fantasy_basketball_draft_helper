// Minimal data validator for US4 (skeleton)
export const SEVERITY = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
}

function missingName(player) {
  return !player || !player.name || player.name.trim() === ''
}

function missingPosition(player) {
  return !player || !player.position || player.position.trim() === ''
}

export function countNonNullStats(player) {
  if (!player || !player.projectedStats) return 0
  return Object.values(player.projectedStats).filter(v => v !== null && v !== undefined && v !== '').length
}

export function validateSinglePlayer(player) {
  const issues = []
  if (missingName(player)) {
    issues.push({ severity: SEVERITY.ERROR, code: 'MISSING_NAME', message: 'Player name is missing' })
  }
  if (missingPosition(player)) {
    issues.push({ severity: SEVERITY.ERROR, code: 'MISSING_POSITION', message: 'Player position is missing' })
  }
  const statCount = countNonNullStats(player)
  if (statCount < 5) {
    issues.push({ severity: SEVERITY.WARNING, code: 'FEW_STATS', message: `Player has only ${statCount} stats` })
  }
  // placeholder info check: position mismatch (requires historical data)
  if (player && player.hasHistoricalData && player.historicalStats && player.position && player.historicalStats.position && player.position !== player.historicalStats.position) {
    issues.push({ severity: SEVERITY.INFO, code: 'POSITION_MISMATCH', message: 'CSV position differs from historical position' })
  }
  return issues
}

export function validatePlayers(players) {
  return players.map(p => ({ player: p, issues: validateSinglePlayer(p) }))
}
