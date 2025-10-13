import Fuse from 'fuse.js';
import { normalizeName } from '../../utils/string-utils';

/**
 * Match CSV players to historical data
 * @param {Array<{name:string,team?:string}>} csvPlayers
 * @param {Record<string, any>} historicalData - keyed by canonical name or array
 * @param {Object} options
 * @returns {Array}
 */
export function matchPlayers(csvPlayers, historicalData, options = {}) {
  const confidenceThreshold = options.confidenceThreshold ?? 85;
  const useTeamTiebreaker = options.useTeamTiebreaker ?? true;

  // historicalData may be an object keyed by name or an array
  const historicalList = Array.isArray(historicalData) ? historicalData : Object.values(historicalData || {});

  // build Fuse index
  const fuse = new Fuse(historicalList, {
    keys: ['name'],
    threshold: 0.15,
    ignoreLocation: true,
    includeScore: true
  });

  return csvPlayers.map(csvPlayer => {
    const name = csvPlayer.name || '';
    const team = csvPlayer.team || null;
    const norm = normalizeName(name);

    // exact match attempt (normalized) - prefer same team when available
    const exactTeam = historicalList.find(h => normalizeName(h.name) === norm && h.team === team);
    if (exactTeam) {
      return {
        csvPlayer,
        historicalMatch: exactTeam,
        confidence: 100,
        matchType: 'exact',
        alternatives: []
      };
    }

    const exact = historicalList.find(h => normalizeName(h.name) === norm);
    if (exact) {
      return {
        csvPlayer,
        historicalMatch: exact,
        confidence: 100,
        matchType: 'exact',
        alternatives: []
      };
    }

    // fuzzy search
    const results = fuse.search(name || '');
    if (!results || results.length === 0) {
      return { csvPlayer, historicalMatch: null, confidence: 0, matchType: 'none', alternatives: [] };
    }

    // prepare alternatives with confidence
    const alternatives = results.map(r => ({ player: r.item, confidence: Math.round((1 - r.score) * 100) }));

    // pick top candidate
    let top = alternatives[0];

    // if multiple similar and team tiebreaker enabled, prefer same team
    if (useTeamTiebreaker && team) {
      const teamMatch = alternatives.find(a => a.player.team === team);
      if (teamMatch) top = teamMatch;
    }

    const confidence = top ? top.confidence : 0;
    const matchType = confidence === 100 ? 'exact' : 'fuzzy';

    return {
      csvPlayer,
      historicalMatch: top ? top.player : null,
      confidence,
      matchType: confidence === 0 ? 'none' : matchType,
      alternatives
    };
  });
}
