export async function loadSampleData(view = '2024-25') {
  // Fetch JSON at runtime from /data to avoid bundling large sample files into the main JS.
  // Keep a dynamic-import fallback for test environments that don't serve public files.
  const file = view === '2024-25' ? '/data/sample-2024.json' : '/data/sample-2025.json'
  try {
    if (typeof fetch === 'function') {
      const resp = await fetch(file)
      if (!resp.ok) throw new Error(`fetch failed: ${resp.status}`)
      return await resp.json()
    }
  } catch (err) {
    // fallback to dynamic import for environments without a network / fetch (e.g., unit tests)
    try {
      if (view === '2024-25') {
        const mod = await import('../../data/sample-2024.json', { assert: { type: 'json' } })
        return mod.default || mod
      } else {
        const mod = await import('../../data/sample-2025.json', { assert: { type: 'json' } })
        return mod.default || mod
      }
    } catch (innerErr) {
      console.warn('Sample data load failed, returning empty bundle', innerErr)
      return { players: [] }
    }
  }
}
