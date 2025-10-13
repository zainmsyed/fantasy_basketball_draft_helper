import { loadSampleData } from '../../modules/data/sample-loader.js'
import { createTableConfig } from '../../modules/table/tabulator-config.js'
import { loadUIState, saveUIState } from '../../utils/storage.js'
import { TIMING } from '../../config/constants.js'
import { isPersistentStorageAvailable } from '../../utils/storage.js'

export function createDraftHelperStore() {
  return {
    activeStatView: '2024-25',
    searchQuery: '',
    positionFilters: [],
    table: null,
    allPlayers: [],
    filteredPlayers: [],
    // profiler/dev tooling
    profilerRunning: false,
    profilerResults: [],
    showProfiler: false,
    storageAvailable: true,
    // global error state for user-friendly error boundaries
    errorMessage: null,
    loading: false,
    searchTimeout: null,
    _filterRAF: null,
    _saveTimer: null,

    async init() {
      try {
        const saved = loadUIState()
        if (saved) {
          this.activeStatView = saved.activeStatView || this.activeStatView
          this.searchQuery = saved.searchQuery || ''
          this.positionFilters = saved.positionFilter || []
        }
        this.loading = true
        try {
          await this.loadData()
        } finally {
          this.loading = false
        }
        // surface persistence availability
        this.storageAvailable = isPersistentStorageAvailable()
        // enable dev profiler UI when ?profiler is present in the URL
        try {
          this.showProfiler =
            typeof window !== 'undefined' &&
            window.location &&
            window.location.search &&
            window.location.search.indexOf('profiler') !== -1
        } catch {
          this.showProfiler = false
        }
        this.initializeTable()
        // apply filters initially (restore state)
        this.applyFilters()

        // Install a simple global error boundary to surface uncaught errors to the UI
        try {
          const self = this
          if (typeof window !== 'undefined' && window.addEventListener) {
            window.addEventListener('error', function (ev) {
              try {
                const msg = ev && ev.message ? ev.message : String(ev)
                console.error('Uncaught error', ev)
                self.errorMessage = `An unexpected error occurred: ${msg}`
              } catch {}
            })
            window.addEventListener('unhandledrejection', function (ev) {
              try {
                const reason = ev && ev.reason ? ev.reason : ev
                console.error('Unhandled rejection', ev)
                self.errorMessage = `An unexpected error occurred: ${String(reason)}`
              } catch {}
            })
          }
        } catch {
          // swallow - error boundary best-effort
        }
      } catch (err) {
        console.error('init error', err)
        alert('Failed to initialize app')
      }
    },

    clearError() {
      this.errorMessage = null
    },

    async loadData() {
      const bundle = await loadSampleData(this.activeStatView)
      this.allPlayers = bundle.players || []
      if (!this.allPlayers || this.allPlayers.length === 0) {
        // Inform user that the selected stat view has no data
        console.warn('Loaded stat view has no players:', this.activeStatView)
        // Use a friendly alert for now; can be replaced with a nicer UI message
        alert(`No data available for ${this.activeStatView}`)
      }
      // precompute fields for performance
      for (const p of this.allPlayers) {
        p._name_lc = (p.name || '').toLowerCase()
        const posArr = Array.isArray(p.positions) ? p.positions : []
        const posMap = {}
        for (const x of posArr) posMap[x] = true
        p._pos_map = posMap
        const s = p.stats || {}
        p.gp = Number(s.gp || 0)
        p.pts = Number(s.pts || 0)
        p.ast = Number(s.ast || 0)
        p.reb = Number(s.reb || 0)
        p.threes = Number(s.threes || s.fg3m || 0)
        p.fg_pct = Number(s.fg_pct != null ? s.fg_pct : 0)
        p.ft_pct = Number(s.ft_pct != null ? s.ft_pct : 0)
        p.stl = Number(s.stl || 0)
        p.blk = Number(s.blk || 0)
        p.to = Number(s.to || s.tov || 0)
        p._pos_display = posArr.join('/')
      }
      this.filteredPlayers = [...this.allPlayers]
    },

    async changeStatView() {
      this.loading = true
      try {
        await this.loadData()
        // replace table data with full dataset then apply table-side filters
        if (this.table) this.table.replaceData(this.allPlayers)
        this.applyFilters()
        this.saveState()
      } finally {
        // ensure spinner hides even on error
        this.loading = false
      }
    },

    // Wait until the filter rAF job has cleared
    async _waitForFilterFlush() {
      // poll for the RAF handle to be cleared
      return new Promise((resolve) => {
        const check = () => {
          if (!this._filterRAF) return resolve()
          setTimeout(check, 10)
        }
        check()
      })
    },

    // Simple in-app profiler for T037 (dev-only): runs a few interactions and measures durations.
    async runProfiler() {
      if (this.profilerRunning) return
      this.profilerRunning = true
      this.profilerResults = []
      const measures = []

      const measure = async (name, fn) => {
        const t0 =
          typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now()
        await fn()
        // if filters were queued, wait until they finish
        try {
          await this._waitForFilterFlush()
  } catch {}
        const t1 =
          typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now()
        const dur = t1 - t0
        measures.push({ name, durationMs: dur })
        // keep console-friendly output
        try {
          console.info(`[profiler] ${name}: ${dur.toFixed(2)} ms`)
        } catch (e) {}
      }

      try {
        // 1) Warmup: ensure table is present
        await measure('warmup-noop', async () => {
          /* noop */
        })

        // 2) Search filter: simulate a user typing a query and applying filter
        await measure('search-filter', async () => {
          this.searchQuery = 'lebron'
          // apply and wait for filter flush
          this.applyFilters()
        })

        // 3) Position toggle
        await measure('position-filter', async () => {
          this.positionFilters = ['PG']
          this.applyFilters()
        })

        // 4) Stat view switch to projected (async load)
        await measure('statview-switch-to-projected', async () => {
          this.activeStatView = this.activeStatView === '2025-26' ? '2024-25' : '2025-26'
          // reuse changeStatView to fully reload and replace table data
          await this.changeStatView()
        })

        // 5) Stat view switch back
        await measure('statview-switch-back', async () => {
          this.activeStatView = this.activeStatView === '2025-26' ? '2024-25' : '2025-26'
          await this.changeStatView()
        })

        // finalize results
        this.profilerResults = measures
        // compute simple aggregates
        const durations = measures.map((m) => m.durationMs).sort((a, b) => a - b)
        const p = (i) =>
          durations.length
            ? durations[Math.min(durations.length - 1, Math.floor(i * durations.length))]
            : 0
        const summary = { p50: p(0.5), p90: p(0.9), p99: p(0.99), raw: measures }
        try {
          console.info('[profiler] summary', summary)
  } catch {}
        this.profilerResults = { summary, measures }
      } catch (err) {
        console.error('profiler error', err)
        this.profilerResults = { error: String(err), measures }
      } finally {
        this.profilerRunning = false
      }
    },

    initializeTable() {
      const config = createTableConfig(this.filteredPlayers)
      this.table = new Tabulator('#player-table', config)
      this.table.on('dataSorted', () => this.saveState())

      // Restore sort state if exists (use field name, not column component)
      const saved = loadUIState()
      if (saved && saved.sortField && saved.sortDirection && this.table) {
        try {
          this.table.setSort(saved.sortField, saved.sortDirection)
        } catch (e) {
          // ignore if column not present
        }
      }
    },

    debounceSearch() {
      // shorter debounce to keep UX snappy but avoid excessive redraws
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => this.applyFilters(), TIMING.SEARCH_DEBOUNCE_MS)
    },

    applyFilters() {
      // Batch filter application to the next animation frame to avoid repeated
      // synchronous work when toggling multiple controls quickly.
      if (this._filterRAF) cancelAnimationFrame(this._filterRAF)
      this._filterRAF = requestAnimationFrame(() => {
        const q = (this.searchQuery || '').trim().toLowerCase()
        const positions = this.positionFilters || []

        if (this.table && this.table.setFilter) {
          if (!q && (!positions || positions.length === 0)) {
            this.table.clearFilter(true)
          } else {
            this.table.setFilter((data) => {
              if (q) {
                const name = data._name_lc || (data.name || '').toLowerCase()
                if (!name.includes(q)) return false
              }
              if (positions && positions.length) {
                const posMap = data._pos_map || {}
                let ok = false
                for (const r of positions) {
                  if (posMap[r]) {
                    ok = true
                    break
                  }
                }
                if (!ok) return false
              }
              return true
            })
          }
        }
        this._filterRAF = null
        this.saveStateThrottled()
      })
    },

    resetFilters() {
      this.searchQuery = ''
      this.positionFilters = []
      // apply and persist
      this.applyFilters()
      this.saveState()
    },
    saveStateThrottled() {
      if (this._saveTimer) return
      this._saveTimer = setTimeout(() => {
        this._saveTimer = null
        this.saveState()
      }, TIMING.STATE_SAVE_THROTTLE_MS)
    },

    saveState() {
      const sort = (this.table && this.table.getSort && this.table.getSort()) || []
      const first = sort[0]
      // extract stable field name when available
      let sortField = null
      let sortDirection = null
      if (first) {
        sortDirection = first.dir || null
        try {
          sortField =
            first.column && typeof first.column.getField === 'function'
              ? first.column.getField()
              : first.column || null
        } catch (e) {
          sortField = null
        }
      }

      saveUIState({
        activeStatView: this.activeStatView,
        searchQuery: this.searchQuery,
        positionFilter: this.positionFilters,
        sortField,
        sortDirection,
      })
    },
  }
}
