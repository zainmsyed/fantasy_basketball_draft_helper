export function isValidPosition(pos) {
  if (!pos) return false;
  return /^(PG|SG|SF|PF|C)(\/(PG|SG|SF|PF|C))*$/.test(pos);
}

export function isValidPercentage(p) {
  if (p === null || p === undefined) return true;
  const num = Number(p);
  if (Number.isNaN(num)) return false;
  return num >= 0 && num <= 1;
}

export function countNonNullStats(stats) {
  if (!stats) return 0;
  return Object.values(stats).filter(v => v !== null && v !== undefined).length;
}
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
