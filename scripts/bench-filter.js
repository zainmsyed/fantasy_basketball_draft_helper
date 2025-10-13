const fs = require('fs')
const path = require('path')

function loadData(file) {
  const p = path.resolve(__dirname, '..', 'frontend', 'public', 'data', file)
  const raw = fs.readFileSync(p, 'utf8')
  return JSON.parse(raw).players || []
}

function precompute(players) {
  for (const p of players) {
    p._name_lc = (p.name || '').toLowerCase()
    p._pos_map = {}
    const positions = Array.isArray(p.positions) ? p.positions : []
    positions.forEach(pos => { p._pos_map[pos] = true })
  }
}

function filterPlayers(players, query, positions) {
  const q = (query || '').trim().toLowerCase()
  const wantPositions = new Set(positions || [])
  return players.filter(p => {
    if (q) {
      if (!p._name_lc.includes(q)) return false
    }
    if (wantPositions.size) {
      // check any overlap
      let ok = false
      for (const pos of wantPositions) {
        if (p._pos_map[pos]) { ok = true; break }
      }
      if (!ok) return false
    }
    return true
  })
}

function bench(players, runs = 2000) {
  const samples = []
  const positionsList = [[], ['PG'], ['SG'], ['PF'], ['C'], ['PG','SG']]
  const queries = ['', 'a', 'an', 'anth', 'le', 'john']

  for (let i = 0; i < runs; i++) {
    const q = queries[i % queries.length]
    const pos = positionsList[i % positionsList.length]
    const t0 = process.hrtime.bigint()
    filterPlayers(players, q, pos)
    const t1 = process.hrtime.bigint()
    samples.push(Number(t1 - t0) / 1e6) // ms
  }

  samples.sort((a,b) => a-b)
  const p50 = samples[Math.floor(samples.length * 0.5)]
  const p90 = samples[Math.floor(samples.length * 0.9)]
  const p99 = samples[Math.floor(samples.length * 0.99)]
  const max = samples[samples.length - 1]
  return {p50,p90,p99,max}
}

async function main() {
  console.log('loading data...')
  const players = loadData('sample-2024.json')
  console.log('players:', players.length)
  precompute(players)
  console.log('running benchmark...')
  const res = bench(players, 2000)
  console.log('results (ms):', res)
}

main().catch(err => { console.error(err); process.exit(1) })
