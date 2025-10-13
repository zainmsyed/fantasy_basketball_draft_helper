export async function loadSampleData(view = '2024-25') {
  // simple dynamic import to keep bundle small; fallback to same file if missing
  try {
    if (view === '2024-25') {
      // correct relative path: modules/data -> ../../data
      const mod = await import('../../data/sample-2024.json', { assert: { type: 'json' } })
      return mod.default || mod
    } else {
      const mod = await import('../../data/sample-2025.json', { assert: { type: 'json' } })
      return mod.default || mod
    }
  } catch (err) {
    console.warn('Sample data load failed, returning empty bundle', err)
    return { players: [] }
  }
}
