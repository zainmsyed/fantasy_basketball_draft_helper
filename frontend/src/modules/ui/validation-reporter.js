// Alpine.js validation reporter component
import { validatePlayers } from '../../modules/data/data-validator.js'

export function createValidationReporter() {
  return {
    report: null,
    showDetails: false,
    filterSeverity: 'all', // all | error | warning | info

    get hasErrors() {
      return !!(this.report && this.report.errorCount && this.report.errorCount > 0)
    },

    get hasWarnings() {
      return !!(this.report && this.report.warningCount && this.report.warningCount > 0)
    },

    get canProceed() {
      return !this.hasErrors
    },

    setReportFromPlayers(players = [], meta = {}) {
      try {
        const result = validatePlayers(players)
        // normalize to ValidationReport shape expected by UI
        const totalPlayers = Array.isArray(players) ? players.length : 0
        const matchedPlayers = players.filter(p => p.hasHistoricalData).length
        const unmatchedPlayers = players.filter(p => !p.hasHistoricalData).map(p => p.name || '')
        const playerIssues = new Map()
        let errorCount = 0
        let warningCount = 0
        let infoCount = 0

        for (const r of result) {
          const issues = r.issues || []
          if (issues.length) {
            playerIssues.set(r.player.id || String(r.player.csvRowIndex || r.player.name || ''), issues)
            for (const it of issues) {
              if (it.severity === 'error') errorCount++
              else if (it.severity === 'warning') warningCount++
              else infoCount++
            }
          }
        }

        this.report = {
          totalPlayers,
          validPlayers: Math.max(0, totalPlayers - errorCount),
          matchedPlayers,
          unmatchedPlayers,
          errorCount,
          warningCount,
          infoCount,
          playerIssues,
          fgThresholdFailures: [],
          ftThresholdFailures: [],
          generatedAt: new Date(),
          csvFileName: meta.csvFileName || ''
        }
      } catch (e) {
        console.warn('setReportFromPlayers failed', e)
        this.report = null
      }
    },

    toggleDetails() {
      this.showDetails = !this.showDetails
    },

    filterBySeverity(s) {
      this.filterSeverity = s || 'all'
    },

    getPlayerIssues(playerKey) {
      if (!this.report || !this.report.playerIssues) return []
      return this.report.playerIssues.get(playerKey) || []
    },

    dismissInfo() {
      // for now just clear info count
      if (this.report) this.report.infoCount = 0
    },

    confirmWarnings() {
      // placeholder: UI should call confirmUpload with force=true
      return true
    }
  }
}

export default { createValidationReporter }
