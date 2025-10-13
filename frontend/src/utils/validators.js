export function validatePlayer(p) {
  if (!p || typeof p !== 'object') return false
  if (!p.id || !p.name) return false
  if (!Array.isArray(p.positions) || p.positions.length === 0) return false
  if (!p.stats || typeof p.stats.gp !== 'number') return false
  return true
}

export function validateBundle(bundle) {
  if (!bundle || !Array.isArray(bundle.players)) return false
  return bundle.players.every(validatePlayer)
}
