import { loadSampleData } from '../../modules/data/sample-loader.js'
import { createTableConfig } from '../../modules/table/tabulator-config.js'
import { loadUIState, saveUIState } from '../../utils/storage.js'
import { TIMING, UI } from '../../config/constants.js'
import { isPersistentStorageAvailable } from '../../utils/storage.js'
import { parseCSV } from '../../modules/data/csv-parser.js'
import { createColumnMapper } from './column-mapper.js'
import { matchPlayers } from '../../modules/data/name-matcher.js'
import { loadHistoricalStats, normalizeHistoricalList, saveIntegratedPlayers, saveOverrides, loadOverrides, loadIntegratedPlayers, saveValidationReport, clearUploadData, checkStorageQuota } from '../../utils/storage.js'
import { mergeFromPreview } from '../../modules/data/data-merger.js'
import { validatePlayers } from '../../modules/data/data-validator.js'
import { transformRowToUploaded, validateMappingComplete } from '../../modules/data/csv-transformer.js'
import { puntStrategyManager } from '../../modules/punt-strategy/index.js'

/**
 * Creates the main Alpine.js store for the Basketball Draft Helper application.
 * Manages application state, UI interactions, data processing, and persistence.
 *
 * @returns {Object} Alpine.js reactive store object with methods and state
 */
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
  // context for the current error (parse|save|null) so UI can show contextual actions
  errorContext: null,
    loading: false,
  // last raw CSV text read from file (used to retry parsing without re-upload)
  lastCSVText: null,
  // CSV upload state
  uploadedCSV: null,
  csvColumns: [],
  // ensure columnMapper is always an object to avoid Alpine reading null.mapping
  columnMapper: createColumnMapper([]),
  showLargeFileModal: false,
  mappingPreview: null,
  // preview / metadata
  uploadedFileName: null,
  uploadedFileSize: 0,
  uploadedRowCount: 0,
  parseTimeMs: 0,
  previewRows: [],
  // rows skipped due to blank player names (store row numbers)
  skippedRows: [],
  // matching indicator (shows spinner when running name matching)
  matching: false,
  // success toast
  showSuccessToast: false,
  successMessage: '',
  fileWarnings: [],
  parseErrors: [],
  // last integrated players (in-memory) for preview
  lastIntegratedPlayers: [],
  // integrated preview derived from mappingPreview (not yet saved)
  integratedPreview: [],
  // last match summary counts for quick feedback
  lastMatchSummary: null,
  // current table view mode: 'rankings' (default sample data) or 'integrated'
  viewMode: 'rankings',
  // track source of current integrated view: 'preview' or 'saved'
  currentIntegratedSource: null,
  // last validation report generated after merge
  lastValidationReport: null,
  // debug helper: disabled by default; set true via console to reveal the widget
  debugReady: false,
  // UI modal state for validation confirmation
  showValidationModal: false,
  // re-upload overwrite confirmation modal
  showReuploadModal: false,
  // clear persisted upload confirmation modal
  showClearUploadConfirm: false,
  transformedUploadedPlayers: [],
  // manual override UI state
  overrideIndex: null,
  overrideChoice: null,
  overrides: [],
  // preview selection for bulk actions
  selectedPreviewIndexes: [],
  // which alternative index to apply in bulk
  bulkAlternativeIndex: 0,
    searchTimeout: null,
    _filterRAF: null,
    _saveTimer: null,

    /**
     * Initializes the application store.
     * Loads sample data, restores UI state, sets up table, and installs error boundaries.
     */
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
        // load saved overrides
        try {
          this.overrides = loadOverrides() || []
        } catch {}

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

        // Initialize punt strategy manager
        try {
          await puntStrategyManager.initialize()
        } catch (error) {
          console.warn('Failed to initialize punt strategy manager:', error)
        }

        // Listen for strategy changes to update rankings
        this.setupStrategyChangeListener()
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

    // Convert integrated players into table rows expected by Tabulator config
    _toTableRows(integrated = []) {
      const rows = []
      for (const p of integrated) {
        try {
          const hs = p && p.historicalStats ? p.historicalStats : {}
          const stats = hs || {}
          const positions = Array.isArray(p.positions) ? p.positions : (typeof p.position === 'string' && p.position ? p.position.split('/').map(s=>s.trim()) : [])
          const posMap = {}
          for (const x of positions) posMap[x] = true
          rows.push({
            id: p.id,
            name: p.name || '',
            team: p.team || null,
            _pos_display: positions.join('/'),
            _name_lc: (p.name || '').toLowerCase(),
            _pos_map: posMap,
            gp: Number(stats.gp || 0),
            pts: Number(stats.pts || 0),
            ast: Number(stats.ast || 0),
            reb: Number(stats.reb || 0),
            threes: Number(stats.threes || stats.fg3m || 0),
            fg_pct: Number(stats.fg_pct != null ? stats.fg_pct : 0),
            ft_pct: Number(stats.ft_pct != null ? stats.ft_pct : 0),
            stl: Number(stats.stl || 0),
            blk: Number(stats.blk || 0),
            to: Number(stats.to || stats.tov || 0),
            expert_rank: p.expertRank != null ? Number(p.expertRank) : null,
            algo_rank: hs && hs.algo_rank != null ? Number(hs.algo_rank) : null,
            hasHistoricalData: !!p.hasHistoricalData,
            matchConfidence: typeof p.matchConfidence === 'number' ? p.matchConfidence : 0,
          })
        } catch (e) {
          continue
        }
      }
      return rows
    },

    // Replace table data with integrated preview (unsaved) or saved integrated list
    applyIntegratedToTable(source = 'saved') {
      try {
        const list = source === 'preview' ? (this.integratedPreview || []) : (this.lastIntegratedPlayers || [])
        const rows = this._toTableRows(list)
        if (this.table && this.table.replaceData) {
          this.table.replaceData(rows)
          this.viewMode = 'integrated'
          this.currentIntegratedSource = source
        }
        return rows.length
      } catch (e) {
        console.warn('applyIntegratedToTable failed', e)
        return 0
      }
    },

    // Save the current preview (when viewing preview in table)
    async saveCurrentPreview() {
      if (this.currentIntegratedSource !== 'preview' || !this.integratedPreview || !this.integratedPreview.length) {
        return false
      }
      // Temporarily set integratedPreview as lastIntegratedPlayers for confirmUpload
      const temp = this.lastIntegratedPlayers
      this.lastIntegratedPlayers = this.integratedPreview
      const result = await this.confirmUpload()
      if (!result) {
        this.lastIntegratedPlayers = temp // restore if failed
      }
      return result
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

    // File input handler: reads file as text and delegates to loadCSVFromString
    /**
     * Handles CSV file upload event.
     * Reads the file, parses CSV, validates, and prepares for mapping.
     * @param {Event} ev - File input change event
     */
    async handleFile(ev) {
      try {
        const file = ev && ev.target && ev.target.files ? ev.target.files[0] : null
        if (!file) return
        // basic file type validation
        this.fileWarnings = []
        const type = file.type || ''
        if (!type.includes('csv') && !file.name.toLowerCase().endsWith('.csv')) {
          this.fileWarnings.push('Selected file does not appear to be a CSV')
        }
        // size validation (5MB hard limit recommended)
        this.uploadedFileName = file.name
        this.uploadedFileSize = file.size || 0
        if (this.uploadedFileSize > 5 * 1024 * 1024) {
          this.fileWarnings.push('File exceeds 5MB recommended limit')
        }

  this.loading = true
        const t0 = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now()
        // Attempt robust decoding: try UTF-8, fallback to windows-1252 if replacement chars detected
        const arrayBuffer = await file.arrayBuffer()
        let text = null
        try {
          const utf8 = new TextDecoder('utf-8', { fatal: false }).decode(arrayBuffer)
          // If replacement character present, attempt windows-1252 fallback
          if (utf8.indexOf('\uFFFD') !== -1) {
            try {
              const win = new TextDecoder('windows-1252', { fatal: false }).decode(arrayBuffer)
              // if windows-1252 produces fewer replacement chars, use it
              if (win.indexOf('\uFFFD') === -1 || win.indexOf('\uFFFD') < utf8.indexOf('\uFFFD')) {
                text = win
                this.fileWarnings.push('File decoded with windows-1252 fallback due to invalid UTF-8 characters.')
              } else {
                text = utf8
                this.fileWarnings.push('File contains invalid UTF-8 characters; some characters may be replaced.')
              }
            } catch (we) {
              text = utf8
              this.fileWarnings.push('File contains invalid UTF-8 characters; decoding fallback failed.')
            }
          } else {
            text = utf8
          }
        } catch (e) {
          // Last resort: try windows-1252
          try {
            text = new TextDecoder('windows-1252', { fatal: false }).decode(arrayBuffer)
            this.fileWarnings.push('File decoded with windows-1252 fallback due to UTF-8 decode error.')
          } catch (ee) {
            throw new Error('Failed to decode uploaded file as UTF-8 or windows-1252')
          }
        }
        const t1 = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now()
        this.parseTimeMs = Math.max(0, t1 - t0)
  // store last raw CSV so user can retry parse without re-uploading
  try { this.lastCSVText = text } catch (e) {}
  await this.loadCSVFromString(text)
      } catch (err) {
        console.error('file read error', err)
        this.errorMessage = `Failed to read CSV: ${String(err)}`
        // indicate parse-related error context so UI can offer retry
        try { this.errorContext = 'parse' } catch (e) {}
      } finally {
        this.loading = false
      }
    },

    async loadCSVFromString(csvText) {
      try {
        const t0 = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now()
        const res = await parseCSV(csvText)
        const t1 = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now()
        // set parse time (ms)
        this.parseTimeMs = Math.max(0, t1 - t0)
        this.uploadedCSV = res
        this.csvColumns = res && res.meta && res.meta.columns ? res.meta.columns : []
        this.uploadedRowCount = res && res.meta && res.meta.rowCount ? res.meta.rowCount : (Array.isArray(res.data) ? res.data.length : 0)
        // prepare a small preview of first 10 rows
        // ensure each row has a stable row index for reporting (PapaParse may not include one)
        const rows = Array.isArray(res.data) ? res.data : []
        for (let i = 0; i < rows.length; i++) {
          if (rows[i] && rows[i].__rowNum__ == null) rows[i].__rowNum__ = i + 1
          if (rows[i] && rows[i]._rowIndex == null) rows[i]._rowIndex = i + 1
        }
        this.previewRows = rows.slice(0, 10)
        // capture parse errors (PapaParse returns results.errors[])
        this.parseErrors = Array.isArray(res.errors) ? res.errors.map(e => ({row: e.row, message: e.message, code: e.code})) : []
        if (this.parseErrors.length) {
          this.fileWarnings.push(`${this.parseErrors.length} parsing issue(s) detected`)
        }
        // missing header detection
        if (!this.csvColumns || this.csvColumns.length === 0) {
          this.fileWarnings.push('CSV appears to have no header row. Please include headers or use the "Has header" option.')
        }
        // encoding detection: look for replacement characters in text
        if (typeof csvText === 'string' && csvText.indexOf('\uFFFD') !== -1) {
          this.fileWarnings.push('File encoding may be invalid or contains unsupported characters. Ensure UTF-8 encoding.')
        }
        // large file guidance
        if (this.uploadedRowCount > 500) {
          this.fileWarnings.push('Large file detected (>500 rows). Consider trimming to top 200-300 players for performance.')
          // show modal once to recommend trimming
          try { this.showLargeFileModal = true } catch (e) {}
        }
        // performance warning: parsing time threshold
        if (this.parseTimeMs > 3000) {
          this.fileWarnings.push('Parsing took longer than expected (>3000ms). Consider reducing file size.')
        }
        // create a new mapper for these columns and init
        this.columnMapper = createColumnMapper(this.csvColumns)
        await this.columnMapper.init()
        // run an initial preview if historical data is available
        try {
          const histRaw = await loadHistoricalStats()
          const hist = normalizeHistoricalList(histRaw)
          // create csvPlayer objects for matching using transformRowToUploaded to include
          // positions and projectedStats so validation has meaningful data
          this.skippedRows = []
          const players = (res.data || []).map((r, idx) => {
            const transformed = transformRowToUploaded(r, this.columnMapper ? this.columnMapper.mapping : {})
            // ensure csvRowIndex present
            if (!transformed.csvRowIndex) transformed.csvRowIndex = r.__rowNum__ != null ? r.__rowNum__ : (r._rowIndex != null ? r._rowIndex : idx + 1)
            return transformed
          }).filter(p => {
            if (!p || !p.name || String(p.name).trim() === '') {
              try { this.skippedRows.push(p && p.csvRowIndex ? p.csvRowIndex : null) } catch (e) {}
              return false
            }
            return true
          })
          if (this.skippedRows && this.skippedRows.length) {
            this.fileWarnings.push(`Skipped ${this.skippedRows.length} row(s) with blank player name(s): ${this.skippedRows.filter(Boolean).join(', ')}`)
          }
          try {
            this.matching = true
            this.mappingPreview = matchPlayers(players, hist)
          } finally {
            this.matching = false
          }
          // build integrated preview for immediate visibility
          try {
            this.integratedPreview = mergeFromPreview(this.mappingPreview || [])
          } catch (e) {
            this.integratedPreview = []
          }
          // compute match summary and log for feedback
          try {
            const total = Array.isArray(this.mappingPreview) ? this.mappingPreview.length : 0
            const matched = total ? this.mappingPreview.filter(x => x && x.historicalMatch).length : 0
            const ambiguous = total ? this.mappingPreview.filter(x => x && x.matchType === 'ambiguous').length : 0
            const unmatched = Math.max(0, total - matched)
            this.lastMatchSummary = { total, matched, ambiguous, unmatched, at: new Date() }
            try { console.info('[match] preview', this.lastMatchSummary) } catch {}
          } catch (e) {
            this.lastMatchSummary = null
          }
          // apply any saved manual overrides to the preview
          try {
            const saved = loadOverrides() || []
            if (Array.isArray(saved) && saved.length && Array.isArray(this.mappingPreview)) {
              this.applySavedOverrides(saved)
            }
          } catch (e) {
            // ignore override application failures
          }
        } catch (e) {
          // historical load may fail in tests or offline; that's ok for preview
          this.mappingPreview = null
        }
      } catch (err) {
        console.error('parseCSV error', err)
        this.errorMessage = `CSV parse failed: ${String(err)}`
        // remember last input so user can retry
        try { this.lastCSVText = csvText } catch (e) {}
        try { this.errorContext = 'parse' } catch (e) {}
      }
    },

    // Trim uploadedCSV to top N rows (useful for large files)
    trimToTopN(n = 250) {
      try {
        if (!this.uploadedCSV || !Array.isArray(this.uploadedCSV.data)) return false
        this.uploadedCSV.data = this.uploadedCSV.data.slice(0, n)
        this.uploadedRowCount = this.uploadedCSV.data.length
        this.previewRows = this.uploadedCSV.data.slice(0, 10)
        // recompute mapping preview asynchronously
        this.applyMappingPreview()
        return true
      } catch (e) {
        console.warn('trimToTopN failed', e)
        return false
      }
    },

    // Save current mapping via columnMapper
    saveMapping() {
      try {
        if (this.columnMapper) return this.columnMapper.saveMapping()
        return false
      } catch (e) {
        return false
      }
    },

    // Trigger preview after mapping selections updated
    async applyMappingPreview() {
      if (!this.uploadedCSV || !this.columnMapper) return
      try {
        const res = this.uploadedCSV
        try { console.info('[match] starting on-demand preview for', (res.data || []).length, 'rows') } catch {}
        // Build players list for matching using transformRowToUploaded so position/stats present
        this.skippedRows = []
        const players = (res.data || []).map((r, idx) => {
          const transformed = transformRowToUploaded(r, this.columnMapper ? this.columnMapper.mapping : {})
          if (!transformed.csvRowIndex) transformed.csvRowIndex = r.__rowNum__ != null ? r.__rowNum__ : (r._rowIndex != null ? r._rowIndex : idx + 1)
          return transformed
        }).filter(p => {
          if (!p || !p.name || String(p.name).trim() === '') {
            try { this.skippedRows.push(p && p.csvRowIndex ? p.csvRowIndex : null) } catch (e) {}
            return false
          }
          return true
        })
  const histRaw = await loadHistoricalStats()
  const hist = normalizeHistoricalList(histRaw)
        if (this.skippedRows && this.skippedRows.length) {
          this.fileWarnings.push(`Skipped ${this.skippedRows.length} row(s) with blank player name(s): ${this.skippedRows.filter(Boolean).join(', ')}`)
        }
        try {
          this.matching = true
          this.mappingPreview = matchPlayers(players, hist)
        } finally {
          this.matching = false
        }
        try {
          this.integratedPreview = mergeFromPreview(this.mappingPreview || [])
        } catch (e) {
          this.integratedPreview = []
        }
        // compute match summary and log for feedback
        try {
          const total = Array.isArray(this.mappingPreview) ? this.mappingPreview.length : 0
          const matched = total ? this.mappingPreview.filter(x => x && x.historicalMatch).length : 0
          const ambiguous = total ? this.mappingPreview.filter(x => x && x.matchType === 'ambiguous').length : 0
          const unmatched = Math.max(0, total - matched)
          this.lastMatchSummary = { total, matched, ambiguous, unmatched, at: new Date() }
          try { console.info('[match] on-demand', this.lastMatchSummary) } catch {}
        } catch (e) {
          this.lastMatchSummary = null
        }
        // apply saved overrides if present
        try {
          const saved = loadOverrides() || []
          if (Array.isArray(saved) && saved.length && Array.isArray(this.mappingPreview)) {
            this.applySavedOverrides(saved)
          }
        } catch (e) {
          // ignore
        }
      } catch (e) {
        console.warn('applyMappingPreview failed', e)
        this.mappingPreview = null
      }
    },

    // Apply saved overrides (array of {key, selected}) to current mappingPreview
    applySavedOverrides(savedOverrides = []) {
      try {
        if (!this.mappingPreview || !Array.isArray(this.mappingPreview)) return
        const map = new Map()
        for (const o of savedOverrides) {
          if (o && o.key) map.set(o.key, o.selected)
        }
        for (const entry of this.mappingPreview) {
          try {
            const key = entry.csvPlayer && (entry.csvPlayer.name || entry.csvPlayer.playerName)
            if (!key) continue
            if (map.has(key)) {
              const sel = map.get(key)
              // find alternative that matches selected by name or id
              if (entry.alternatives && Array.isArray(entry.alternatives)) {
                const found = entry.alternatives.find(a => {
                  const p = a.player || {}
                  return p.name === sel || p.id === sel || String(p.id) === String(sel)
                })
                if (found) {
                  entry.historicalMatch = found.player
                  entry.confidence = found.confidence || entry.confidence
                  entry.matchType = 'manual'
                }
              }
            }
          } catch (e) {
            // per-entry failure shouldn't break overall application
            continue
          }
        }
      } catch (e) {
        // swallow errors
      }
    },

    // Merge preview results and save integrated players
    /**
     * Merges preview data, validates, and saves integrated players to storage.
     * Switches to integrated view and cleans up upload UI.
     * @returns {boolean} Success status
     */
    async confirmUpload() {
      // mappingPreview contains match results; ensure it's an array
      if (!this.mappingPreview || !Array.isArray(this.mappingPreview)) return false
      try {
        const integrated = mergeFromPreview(this.mappingPreview)
        this.lastIntegratedPlayers = integrated

        // run validation before persisting
        try {
          const reportResults = validatePlayers(integrated)
          // synthesize a minimal ValidationReport for UI
          const totalPlayers = integrated.length
          let errorCount = 0
          let warningCount = 0
          let infoCount = 0
          const playerIssues = new Map()
          for (let i = 0; i < reportResults.length; i++) {
            const r = reportResults[i]
            if (r.issues && r.issues.length) {
              playerIssues.set(r.player.id || String(r.player.csvRowIndex || i), r.issues)
              for (const it of r.issues) {
                if (it.severity === 'error') errorCount++
                else if (it.severity === 'warning') warningCount++
                else infoCount++
              }
            }
          }
          this.lastValidationReport = {
            totalPlayers,
            validPlayers: Math.max(0, totalPlayers - errorCount),
            matchedPlayers: integrated.filter(p => p.hasHistoricalData).length,
            unmatchedPlayers: integrated.filter(p => !p.hasHistoricalData).map(p => p.name || ''),
            skippedRows: Array.isArray(this.skippedRows) ? this.skippedRows.filter(Boolean) : [],
            errorCount,
            warningCount,
            infoCount,
            playerIssues,
            generatedAt: new Date(),
            csvFileName: this.uploadedFileName || '',
          }

          // Record validation errors/warnings for the UI. Default behavior: do not block persistence
          if (errorCount > 0) {
            this.errorMessage = 'Validation errors detected. Review the report before proceeding.'
            // NOTE: by default do not block persistence to preserve existing integration flow/tests.
            // Upstream UI can choose to prevent calling confirmUpload when errors exist.
          }
        } catch (ve) {
          console.warn('validation step failed', ve)
          // allow persistence to proceed if validation itself fails unexpectedly
        }

        // storage quota check and re-upload warning
        try {
          const quota = await checkStorageQuota()
          if (quota && quota.warning) {
            this.fileWarnings.push('Storage usage above 80% - saving may fail.')
          }
        } catch (e) {
          // ignore quota check failures
        }

        // If existing integrated data present, we warn before overwrite
        try {
          const existing = loadIntegratedPlayers()
          if (existing && existing.length) {
            // indicate re-upload warning to UI; UI may call uiConfirmUpload which shows modal
            this.fileWarnings.push('Existing draft data detected; uploading will overwrite stored draft.')
          }
        } catch (e) {}

        // attempt to persist
        await saveIntegratedPlayers(integrated)
        // also persist validation report if available
        try { if (this.lastValidationReport) saveValidationReport(this.lastValidationReport) } catch (e) {}
        // show a brief success toast
        try {
          this.successMessage = `Integrated list saved: ${integrated.length} players`
          this.showSuccessToast = true
          setTimeout(() => { try { this.showSuccessToast = false } catch {} }, UI.TOAST_DURATION_MS)
        } catch (e) {}
        // load integrated list into main table view immediately
        try {
          this.applyIntegratedToTable('saved')
        } catch (e) {}
        // clean up upload UI after successful save
        try {
          this.uploadedCSV = null
          this.csvColumns = []
          this.columnMapper = createColumnMapper([])
          this.mappingPreview = null
          this.integratedPreview = []
          this.lastMatchSummary = null
          this.uploadedFileName = null
          this.uploadedFileSize = 0
          this.uploadedRowCount = 0
          this.parseTimeMs = 0
          this.previewRows = []
          this.skippedRows = []
          this.matching = false
          this.fileWarnings = []
          this.parseErrors = []
          this.transformedUploadedPlayers = []
          this.overrides = []
          this.selectedPreviewIndexes = []
          this.bulkAlternativeIndex = 0
          this.overrideIndex = null
          this.overrideChoice = null
        } catch (e) {}
        return true
      } catch (e) {
        console.error('confirmUpload failed', e)
        this.errorMessage = `Failed to save integrated players: ${String(e)}`
        try { this.errorContext = 'save' } catch (err) {}
        return false
      }
    },

    // Retry operations for recoverable errors
    async retryParse() {
      try {
        if (!this.lastCSVText) return false
        this.errorMessage = null
        this.errorContext = null
        // re-run parse using last saved CSV text
        await this.loadCSVFromString(this.lastCSVText)
        return true
      } catch (e) {
        this.errorMessage = `Retry parse failed: ${String(e)}`
        this.errorContext = 'parse'
        return false
      }
    },

    async retrySave() {
      try {
        this.errorMessage = null
        this.errorContext = null
        // if we have lastIntegratedPlayers, try to persist them again
        if (this.lastIntegratedPlayers && this.lastIntegratedPlayers.length) {
          return await this.confirmUpload()
        }
        // otherwise, attempt full confirm (will regenerate integrated list)
        return await this.confirmUpload()
      } catch (e) {
        this.errorMessage = `Retry save failed: ${String(e)}`
        this.errorContext = 'save'
        return false
      }
    },

    // Clear persisted upload data then try saving again (helpful when quota is full)
    async retrySaveAfterClear() {
      try {
        // attempt to clear persisted upload data
        try { clearUploadData() } catch (e) { /* ignore */ }
        return await this.retrySave()
      } catch (e) {
        this.errorMessage = `Retry after clear failed: ${String(e)}`
        this.errorContext = 'save'
        return false
      }
    },

    // Clear persisted upload data (integrated players, mapping, overrides, validation)
    clearUploadData() {
      try {
        const ok = clearUploadData()
        if (ok) {
          this.fileWarnings.push('Saved upload data cleared from storage.')
        } else {
          this.fileWarnings.push('Failed to clear saved upload data.')
        }
        return ok
      } catch (e) {
        console.warn('clearUploadData UI call failed', e)
        return false
      }
    },

    // UI-facing confirm which shows modal on warnings/errors. Keeps confirmUpload() behavior unchanged for tests.
    async uiConfirmUpload() {
      // ensure mappingPreview exists
      if (!this.mappingPreview || !Array.isArray(this.mappingPreview)) return false
      // generate integrated players and validation report without persisting yet
      const integrated = mergeFromPreview(this.mappingPreview)
      // run validation
      try {
        const reportResults = validatePlayers(integrated)
        let errorCount = 0
        let warningCount = 0
        const playerIssues = new Map()
        for (let i = 0; i < reportResults.length; i++) {
          const r = reportResults[i]
          if (r.issues && r.issues.length) {
            playerIssues.set(r.player.id || String(r.player.csvRowIndex || i), r.issues)
            for (const it of r.issues) {
              if (it.severity === 'error') errorCount++
              else if (it.severity === 'warning') warningCount++
            }
          }
        }
        this.lastValidationReport = {
          totalPlayers: integrated.length,
          errorCount,
          warningCount,
          playerIssues,
          generatedAt: new Date(),
          csvFileName: this.uploadedFileName || ''
        }

        // If errors or warnings exist, surface modal for user action
        if (errorCount > 0 || warningCount > 0) {
          this.showValidationModal = true
          return false
        }
      } catch (e) {
        console.warn('uiConfirmUpload validation failed', e)
        // fall back to direct confirmUpload
      }

      // If there's existing saved draft data, ask user to confirm overwrite
      try {
        const existing = loadIntegratedPlayers()
        if (existing && existing.length) {
          this.showReuploadModal = true
          // ui will call proceedAfterReuploadModal() to continue
          return false
        }
      } catch (e) {
        // ignore load errors and continue
      }

      // No issues - proceed to persist
      return await this.confirmUpload()
    },

    // Called by re-upload modal when user confirms overwrite
    async proceedAfterReuploadModal() {
      this.showReuploadModal = false
      return await this.confirmUpload()
    },

    // Open clear upload confirmation
    openClearUploadConfirm() {
      this.showClearUploadConfirm = true
    },

    // Called by clear upload modal to actually clear persisted data
    doClearUploadData() {
      try {
        const ok = clearUploadData()
        this.showClearUploadConfirm = false
        if (ok) {
          this.fileWarnings.push('Saved upload data cleared from storage.')
          // refresh in-memory state
          this.lastIntegratedPlayers = []
          this.lastValidationReport = null
        } else {
          this.fileWarnings.push('Failed to clear saved upload data.')
        }
        return ok
      } catch (e) {
        console.warn('doClearUploadData failed', e)
        this.showClearUploadConfirm = false
        return false
      }
    },

    // Called by modal when user chooses to proceed despite warnings/errors
    async proceedAfterValidationModal() {
      this.showValidationModal = false
      // call confirmUpload to persist
      return await this.confirmUpload()
    },

    // Transform all CSV rows into UploadedPlayer[] using current mapping
    transformUploadedRows() {
      if (!this.uploadedCSV || !this.columnMapper) return []
      const mapping = this.columnMapper.mapping || {}
      if (!validateMappingComplete(mapping)) {
        this.errorMessage = 'Mapping incomplete; map required fields before transforming.'
        return []
      }
      const rows = this.uploadedCSV.data || []
      const transformed = rows.map(r => transformRowToUploaded(r, mapping))
      this.transformedUploadedPlayers = transformed
      return transformed
    },

    mappingComplete() {
      if (!this.columnMapper || !this.columnMapper.mapping) return false
      try {
        return validateMappingComplete(this.columnMapper.mapping)
      } catch (e) {
        return false
      }
    },

    // Manual override helpers for mappingPreview
    openOverride(i) {
      this.overrideIndex = i
      try {
        const entry = this.mappingPreview && Array.isArray(this.mappingPreview) ? this.mappingPreview[i] : null
        if (entry && entry.alternatives && entry.alternatives.length) {
          this.overrideChoice = 0
        } else {
          this.overrideChoice = null
        }
      } catch (e) {
        this.overrideChoice = null
      }
    },

    closeOverride() {
      this.overrideIndex = null
      this.overrideChoice = null
    },

    setOverrideChoice(idx) {
      this.overrideChoice = Number(idx)
    },

    applyOverride() {
      const i = this.overrideIndex
      const choice = this.overrideChoice
      if (i == null || choice == null) return false
      try {
        const entry = this.mappingPreview[i]
        if (!entry || !entry.alternatives || !entry.alternatives[choice]) return false
        const selected = entry.alternatives[choice].player
        entry.historicalMatch = selected
        entry.confidence = entry.alternatives[choice].confidence || entry.confidence
        entry.matchType = 'manual'
        // close UI
        this.closeOverride()
        // persist overrides map (store by csv player name -> selected historical id)
        try {
          const key = entry.csvPlayer && (entry.csvPlayer.name || entry.csvPlayer.playerName)
          if (key) {
            this.overrides = this.overrides.filter(o => o.key !== key)
            this.overrides.push({ key, selected: selected.name || selected.id || selected })
            try { saveOverrides(this.overrides) } catch {}
          }
        } catch (e) {}
        return true
      } catch (e) {
        console.warn('applyOverride failed', e)
        return false
      }
    },

    // Bulk-apply an override choice (alternative index) to multiple preview entries
    // selection: array of preview indexes (numbers) or the string 'all_unmatched' meaning apply to unmatched entries
    bulkApplyOverride(selection, alternativeIndex) {
      if (!this.mappingPreview || !Array.isArray(this.mappingPreview)) return 0
      const applied = []
      const toApply = Array.isArray(selection)
        ? selection.map(Number).filter(i => !Number.isNaN(i))
        : selection === 'all_unmatched'
        ? this.mappingPreview.map((e, idx) => ({ idx, e })).filter(x => !x.e.historicalMatch).map(x => x.idx)
        : []

      for (const i of toApply) {
        const entry = this.mappingPreview[i]
        if (!entry || !entry.alternatives || !entry.alternatives[alternativeIndex]) continue
        try {
          const chosen = entry.alternatives[alternativeIndex].player
          entry.historicalMatch = chosen
          entry.confidence = entry.alternatives[alternativeIndex].confidence || entry.confidence
          entry.matchType = 'manual'
          // persist override entry
          const key = entry.csvPlayer && (entry.csvPlayer.name || entry.csvPlayer.playerName)
          if (key) {
            this.overrides = this.overrides.filter(o => o.key !== key)
            this.overrides.push({ key, selected: chosen.name || chosen.id || chosen })
          }
          applied.push(i)
        } catch (e) {
          // continue on per-entry errors
          continue
        }
      }
      try { saveOverrides(this.overrides) } catch (e) {}
      return applied.length
    },

    // Helper to apply the currently selected alternative to the selectedPreviewIndexes
    bulkApplySelected() {
      try {
        const indexes = Array.isArray(this.selectedPreviewIndexes) ? this.selectedPreviewIndexes.map(Number).filter(i => !Number.isNaN(i)) : []
        if (!indexes.length) return 0
        const alt = Number(this.bulkAlternativeIndex) || 0
        const applied = this.bulkApplyOverride(indexes, alt)
        // clear selection after applying
        this.selectedPreviewIndexes = []
        return applied
      } catch (e) {
        console.warn('bulkApplySelected failed', e)
        return 0
      }
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

    // temporary debug helper: run a named action on the store from the UI
    async runDebugAction(action) {
      try {
        if (!action) return false
        switch (action) {
          case 'applyPreview':
            await this.applyMappingPreview()
            return true
          case 'saveMapping':
            return this.saveMapping()
          case 'confirmUpload':
            return await this.uiConfirmUpload()
          case 'transform':
            this.transformUploadedRows()
            return true
          default:
            return false
        }
      } catch (e) {
        this.errorMessage = `Debug action failed: ${String(e)}`
        return false
      }
    },

    /**
     * Set up event listener for punt strategy changes
     * Updates table rankings when strategy changes
     */
    setupStrategyChangeListener() {
      // Listen for strategy-changed events from punt strategy components
      document.addEventListener('strategy-changed', (event) => {
        try {
          console.info('Strategy changed, updating rankings:', event.detail)
          // Trigger ranking recalculation and table update
          this.updateRankings()
        } catch (error) {
          console.error('Failed to update rankings after strategy change:', error)
        }
      })
    },

    /**
     * Update rankings after strategy changes
     */
    updateRankings() {
      try {
        // If we have a table, trigger a data refresh
        if (this.table && this.table.replaceData) {
          // Get current data and re-sort (this will trigger ranking recalculation)
          const currentData = this.table.getData()
          if (currentData && currentData.length > 0) {
            this.table.replaceData(currentData)
          }
        }
      } catch (error) {
        console.error('Failed to update table rankings:', error)
      }
    },
  }
}
