import Papa from 'papaparse';

/**
 * Parse a CSV file (File object or CSV string) and return structured result
 * @param {File|string} input
 * @param {Object} options
 * @returns {Promise<{data: any[], meta: {columns: string[], delimiter: string, rowCount:number, aborted:boolean}, errors: any[]}>}
 */
export function parseCSV(input, options = {}) {
  return new Promise((resolve, reject) => {
    const config = {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      transformHeader: h => (h ? String(h).trim() : h),
      ...options,
      complete: (results) => {
        // Normalize meta to include columns and rowCount for our app
        if (results && results.meta) {
          results.meta.columns = results.meta.fields || results.meta.columns || [];
          results.meta.rowCount = Array.isArray(results.data) ? results.data.length : 0;
        }
        resolve(results);
      },
      error: (err) => reject(err)
    };

    if (typeof input === 'string') {
      Papa.parse(input, config);
    } else {
      Papa.parse(input, config);
    }
  });
}

export function autoDetectMapping(columns) {
  // very small heuristic for tests
  const lower = columns.map(c => c.toLowerCase());
  const mapping = {};
  if (lower.includes('player name')) mapping.playerNameColumn = columns[lower.indexOf('player name')];
  else if (lower.includes('player')) mapping.playerNameColumn = columns[lower.indexOf('player')];
  if (lower.includes('team')) mapping.teamColumn = columns[lower.indexOf('team')];
  if (lower.includes('position')) mapping.positionColumn = columns[lower.indexOf('position')];
  return mapping;
}
