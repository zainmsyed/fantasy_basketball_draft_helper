import { v4 as uuidv4 } from 'uuid'

/**
 * Merge preview results into IntegratedPlayer objects.
 * @param {Array} previewResults - array of { csvPlayer, historicalMatch, confidence }
 * @returns {Array} integratedPlayers
 */
export function mergeFromPreview(previewResults = []) {
  return (previewResults || []).map((r) => {
  const csv = r.csvPlayer || {}
  const hist = r.historicalMatch || null

    // positions normalization: accept string 'PG/SF' or array
    let positions = []
    if (Array.isArray(csv.positions)) positions = csv.positions
    else if (Array.isArray(csv.position)) positions = csv.position
    else if (typeof csv.position === 'string' && csv.position.length) positions = csv.position.split('/').map(s => s.trim())

  const projectedStats = csv.projectedStats || csv.stats || {}

    const integrated = {
      id: uuidv4(),
      name: csv.name || (csv.playerName || ''),
      team: csv.team || null,
      positions,
  // keep original single position string too when available for validator compatibility
  position: csv.position || (Array.isArray(positions) && positions.length ? positions.join('/') : ''),
  expertRank: csv.expertRank != null ? csv.expertRank : (csv.rank != null ? csv.rank : null),
      projectedStats,
      // include original csv row index when available for error reporting
      csvRowIndex: csv.csvRowIndex != null ? csv.csvRowIndex : (csv.rowIndex != null ? csv.rowIndex : null),
      hasHistoricalData: !!hist,
      historicalStats: hist && (hist.stats || hist) ? (hist.stats || hist) : (hist || null),
      matchConfidence: typeof r.confidence === 'number' ? r.confidence : 0,
      matchedBy: r.matchType || (r.confidence === 100 ? 'exact' : 'fuzzy')
    }

    return integrated
  })
}

export default { mergeFromPreview }
