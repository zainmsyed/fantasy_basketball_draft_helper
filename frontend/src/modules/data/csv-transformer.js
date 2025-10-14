import { normalizePercentage } from '../../utils/string-utils.js'

/**
 * Transform a CSV row into UploadedPlayer using mapping
 * @param {Object} row - parsed CSV row
 * @param {Object} mapping - mapping object produced by column-mapper
 * @returns {Object} UploadedPlayer
 */
export function transformRowToUploaded(row = {}, mapping = {}) {
  const nameKey = mapping.playerNameColumn || Object.keys(row)[0]
  const teamKey = mapping.teamColumn
  const posKey = mapping.positionColumn

  const name = row[nameKey]
  const team = teamKey ? row[teamKey] : undefined
  let positionRaw = posKey ? row[posKey] : undefined
  if (positionRaw && typeof positionRaw === 'string') positionRaw = positionRaw.trim()

  // Positions: accept 'PG/SF' or 'PG' or array
  let positions = []
  if (Array.isArray(positionRaw)) positions = positionRaw
  else if (typeof positionRaw === 'string' && positionRaw.length) positions = positionRaw.split('/').map(s => s.trim())

  // collect stats from mapping where mapping.statsColumns maps stat name -> column name
  const projectedStats = {}
  if (mapping.statsColumns && typeof mapping.statsColumns === 'object') {
    for (const [statName, col] of Object.entries(mapping.statsColumns)) {
      const raw = row[col]
      // normalize percentage-looking values
      if (statName.endsWith('_pct') || statName === 'fg_pct' || statName === 'ft_pct') {
        projectedStats[statName] = normalizePercentage(raw)
      } else {
        projectedStats[statName] = raw === '' || raw === null || raw === undefined ? null : Number(raw)
      }
    }
  }

  return {
    name: name || '',
    team: team || null,
    positions,
    position: positionRaw,
    projectedStats,
    // if parser included a row index, keep it for reporting
    csvRowIndex: row.__rowNum__ != null ? row.__rowNum__ : (row._rowIndex != null ? row._rowIndex : null)
  }
}

export function validateMappingComplete(mapping = {}) {
  // require at least the base required keys and allow optional stats to be present under statsColumns
  // mapping may either have direct keys for stats (e.g., pts) or a statsColumns map
  const base = ['playerNameColumn', 'teamColumn', 'positionColumn']
  const baseOk = base.every(k => !!mapping[k])
  if (!baseOk) return false
  // If mapping provides statsColumns mapping, ensure commonly required stats are present
  if (mapping.statsColumns && typeof mapping.statsColumns === 'object') {
    const neededStats = ['pts', 'ast', 'reb']
    const hasStats = neededStats.every(s => !!mapping.statsColumns[s])
    return hasStats
  }

  // Otherwise accept base-only mapping as valid (stats can be optional)
  return true
}

export default { transformRowToUploaded, validateMappingComplete }
