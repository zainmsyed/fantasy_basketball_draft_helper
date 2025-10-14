// Minimal data validator for US4 (skeleton)
export const SEVERITY = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
}

function missingName(player) {
  return !player || !player.name || String(player.name).trim() === ''
}

function missingPosition(player) {
  return !player || !player.position || player.position.trim() === ''
}

export function countNonNullStats(player) {
  if (!player || !player.projectedStats) return 0
  return Object.values(player.projectedStats).filter(v => v !== null && v !== undefined && v !== '').length
}

function toNumber(val, fallback = null) {
  const n = Number(val)
  return Number.isFinite(n) ? n : fallback
}

function readAttemptRate(stats = {}, keys = []) {
  for (const k of keys) {
    if (stats && stats[k] != null) {
      const n = toNumber(stats[k])
      if (n != null) return n
    }
  }
  return null
}

export function validateSinglePlayer(player) {
  const issues = []
  if (missingName(player)) {
    // Treat missing name as an error but allow callers to skip blank rows before merging
    issues.push({ severity: SEVERITY.ERROR, code: 'MISSING_NAME', message: 'Player name is missing' })
  }
  if (missingPosition(player)) {
    issues.push({ severity: SEVERITY.ERROR, code: 'MISSING_POSITION', message: 'Player position is missing' })
  }
  const statCount = countNonNullStats(player)
  if (statCount < 5) {
    issues.push({ severity: SEVERITY.WARNING, code: 'FEW_STATS', message: `Player has only ${statCount} stats` })
  }
  // position mismatch: historicalStats may store 'position' or 'positions' array or 'primaryPosition'
  if (player && player.hasHistoricalData && player.historicalStats && player.position) {
    try {
      const hs = player.historicalStats || {}
      let histPositions = []
      if (hs.position && typeof hs.position === 'string') histPositions = [hs.position]
      else if (Array.isArray(hs.positions)) histPositions = hs.positions
      else if (hs.primaryPosition) histPositions = [hs.primaryPosition]

      // normalize simple string comparisons (case-insensitive, accept partial overlap)
      const csvPos = Array.isArray(player.positions) && player.positions.length ? player.positions : (player.position ? (Array.isArray(player.position) ? player.position : String(player.position).split('/').map(s=>s.trim())) : [])
      const mismatch = csvPos.length && histPositions.length && !csvPos.some(cp => histPositions.some(hp => String(cp).toLowerCase() === String(hp).toLowerCase()))
      if (mismatch) {
        issues.push({ severity: SEVERITY.INFO, code: 'POSITION_MISMATCH', message: 'CSV position differs from historical position' })
      }
    } catch (e) {
      // ignore position check errors
    }
  }

  // Rookie or no-history indicator
  if (player && !player.hasHistoricalData) {
    issues.push({ severity: SEVERITY.INFO, code: 'ROOKIE_OR_NO_HISTORY', message: 'No historical data available' })
  }

  // Low confidence match warning when applicable
  if (player && player.hasHistoricalData) {
    const conf = toNumber(player.matchConfidence, null)
    if (conf != null && conf < 90) {
      issues.push({ severity: SEVERITY.WARNING, code: 'LOW_CONFIDENCE_MATCH', message: `Match confidence ${conf}% is below 90%` })
    }
  }

  // FG/FT attempt thresholds (per-game proxies). Use common key variants if present.
  if (player && player.hasHistoricalData && player.historicalStats) {
    const hs = player.historicalStats
    const fga = readAttemptRate(hs, ['fga', 'fga_pg', 'fga_per_g', 'fg_att', 'fg_attempts'])
    if (fga != null && fga < 5) {
      issues.push({ severity: SEVERITY.INFO, code: 'LOW_FGA', message: `FG attempts per game below threshold: ${fga}` })
    }
    const fta = readAttemptRate(hs, ['fta', 'fta_pg', 'fta_per_g', 'ft_att', 'ft_attempts'])
    if (fta != null && fta < 2) {
      issues.push({ severity: SEVERITY.INFO, code: 'LOW_FTA', message: `FT attempts per game below threshold: ${fta}` })
    }
  }
  return issues
}

export function validatePlayers(players) {
  const results = []
  // precompute normalized name counts for duplicate detection
  const nameCounts = new Map()
  for (const p of players) {
    const n = p && p.name ? String(p.name).trim().toLowerCase() : ''
    nameCounts.set(n, (nameCounts.get(n) || 0) + 1)
  }

  for (const p of players) {
    const issues = validateSinglePlayer(p)
    // duplicate name without team disambiguation -> warning
    try {
      const n = p && p.name ? String(p.name).trim().toLowerCase() : ''
      if (n && nameCounts.get(n) > 1) {
        // If teams are present and differ, this may not be a problem. Only warn when team missing or identical.
        if (!p.team || players.filter(x => x.name && String(x.name).trim().toLowerCase() === n && (!x.team || x.team === p.team)).length > 1) {
          issues.push({ severity: SEVERITY.WARNING, code: 'DUPLICATE_NAME', message: 'Duplicate player name detected; verify team for disambiguation' })
        }
      }
    } catch (e) {}

    results.push({ player: p, issues })
  }

  return results
}
