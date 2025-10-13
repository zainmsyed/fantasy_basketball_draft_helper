export function searchPlayers(players, query) {
  const q = query.toLowerCase()
  return players.filter((p) => (p.name || '').toLowerCase().includes(q))
}

export function filterByPosition(players, positions = []) {
  if (!positions || positions.length === 0) return players
  return players.filter((p) => {
    const pos = p.positions || []
    return positions.some((r) => pos.includes(r))
  })
}
