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
    else if (typeof csv.position === 'string' && csv.position.length) positions = csv.position.split('/').map(s => s.trim())

    const projectedStats = csv.stats || {}

    const integrated = {
      id: uuidv4(),
      name: csv.name || (csv.playerName || ''),
      team: csv.team || null,
      positions,
      projectedStats,
      hasHistoricalData: !!hist,
      historicalStats: hist && hist.stats ? hist.stats : (hist || null),
      matchConfidence: typeof r.confidence === 'number' ? r.confidence : 0,
    }

    return integrated
  })
}

export default { mergeFromPreview }
