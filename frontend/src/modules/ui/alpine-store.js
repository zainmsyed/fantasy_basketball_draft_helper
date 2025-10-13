import { loadSampleData } from '../../modules/data/sample-loader.js'
import { createTableConfig } from '../../modules/table/tabulator-config.js'
import { loadUIState, saveUIState } from '../../utils/storage.js'

export function createDraftHelperStore() {
  return {
    activeStatView: '2024-25',
    searchQuery: '',
    positionFilters: [],
    table: null,
    allPlayers: [],
    filteredPlayers: [],
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
        await this.loadData()
        this.initializeTable()
        // apply filters initially (restore state)
        this.applyFilters()
      } catch (err) {
        console.error('init error', err)
        alert('Failed to initialize app')
      }
    },

    async loadData() {
      const bundle = await loadSampleData(this.activeStatView)
      this.allPlayers = bundle.players || []
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
      await this.loadData()
      // replace table data with full dataset then apply table-side filters
      if (this.table) this.table.replaceData(this.allPlayers)
      this.applyFilters()
      this.saveState()
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
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => this.applyFilters(), 250)
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
                  if (posMap[r]) { ok = true; break }
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
    saveStateThrottled() {
      if (this._saveTimer) return
      this._saveTimer = setTimeout(() => {
        this._saveTimer = null
        this.saveState()
      }, 400)
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
          sortField = first.column && typeof first.column.getField === 'function' ? first.column.getField() : (first.column || null)
        } catch (e) {
          sortField = null
        }
      }

      saveUIState({
        activeStatView: this.activeStatView,
        searchQuery: this.searchQuery,
        positionFilter: this.positionFilters,
        sortField,
        sortDirection
      })
    }
  }
}
