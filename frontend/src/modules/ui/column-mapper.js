import { loadColumnMapping, saveColumnMapping } from '../../utils/storage';

export function createColumnMapper(initialColumns = []) {
  return {
    csvColumns: initialColumns.slice(),
    mapping: {},

    async init() {
      // attempt to auto-detect mapping on init
      this.autoDetectMapping();
      // attempt to load saved mapping and auto-apply if columns match exactly
      try {
        const saved = loadColumnMapping();
        if (saved && Array.isArray(saved.csvColumns)) {
          const columnsMatch = this.csvColumns.length === saved.csvColumns.length &&
            this.csvColumns.every((c, i) => c === saved.csvColumns[i]);
          if (columnsMatch && saved.mapping) {
            this.mapping = { ...this.mapping, ...saved.mapping };
          }
        }
      } catch (e) {
        // ignore corrupted saved mapping
      }
    },

    autoDetectMapping() {
      const lower = this.csvColumns.map(c => c.toLowerCase());
      const map = {};
      const find = (patterns) => {
        for (const p of patterns) {
          const idx = lower.findIndex(c => c.includes(p));
          if (idx !== -1) return this.csvColumns[idx];
        }
        return undefined;
      };

      map.playerNameColumn = find(['player name', 'player', 'name']);
      map.teamColumn = find(['team', 'tm']);
      map.positionColumn = find(['position', 'pos']);
      map.rankColumn = find(['rank', 'adp', 'expert']);

      this.mapping = { ...this.mapping, ...map };
      return this.mapping;
    },

    updateMapping(field, column) {
      this.mapping[field] = column;
    },

    saveMapping() {
      try {
        const payload = {
          csvColumns: this.csvColumns.slice(),
          mapping: this.mapping,
          savedAt: new Date().toISOString()
        };
        saveColumnMapping(payload);
        return true;
      } catch (e) {
        return false;
      }
    },

    isComplete() {
      const required = ['playerNameColumn', 'teamColumn', 'positionColumn', 'rankColumn'];
      return required.every(k => !!this.mapping[k]);
    }
  };
}
