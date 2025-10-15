import Fuse from 'fuse.js';
import { normalizeName } from '../../utils/string-utils';
import { MATCHING } from '../../config/constants';

/**
 * Match CSV players to historical data
 * @param {Array<{name:string,team?:string}>} csvPlayers
 * @param {Record<string, any>} historicalData - keyed by canonical name or array
 * @param {Object} options
 * @returns {Array}
 */
export function matchPlayers(csvPlayers, historicalData, options = {}) {
  const confidenceThreshold = options.confidenceThreshold ?? MATCHING.CONFIDENCE_THRESHOLD;
  const useTeamTiebreaker = options.useTeamTiebreaker ?? MATCHING.USE_TEAM_TIEBREAKER;

  // historicalData may be an object keyed by name or an array
  const historicalList = Array.isArray(historicalData) ? historicalData : Object.values(historicalData || {});

  // Precompute normalized name index to speed exact/duplicate lookups and avoid repeated normalization
  const normIndex = new Map()
  for (const h of historicalList) {
    try {
      const n = normalizeName(h && h.name ? h.name : '')
      const arr = normIndex.get(n) || []
      arr.push(h)
      normIndex.set(n, arr)
    } catch (e) {
      // ignore normalization failures per-entry
    }
  }

  // Convert confidence threshold (0-100) to Fuse.js score (0-1)
  const fuseThreshold = 1 - (confidenceThreshold / 100);

  // build Fuse index once over historicalList (search uses original names for fuzzy scoring)
  const fuse = new Fuse(historicalList, {
    keys: ['name'],
    threshold: fuseThreshold,
    ignoreLocation: true,
    includeScore: true
  });

  return csvPlayers.map(csvPlayer => {
    const name = csvPlayer.name || '';
    const team = csvPlayer.team || null;
    const norm = normalizeName(name);

    // exact match attempt (normalized) - prefer same team when available
    const exactNormArr = normIndex.get(norm) || []
    const exactTeam = exactNormArr.find(h => h.team === team)
    if (exactTeam) {
      return {
        csvPlayer,
        historicalMatch: exactTeam,
        confidence: 100,
        matchType: 'exact',
        alternatives: []
      };
    }

    // find all exact-normalized matches (to detect duplicates/ambiguous exact matches)
    const exactNormMatches = exactNormArr
    if (exactNormMatches && exactNormMatches.length === 1) {
      const exact = exactNormMatches[0]
      return {
        csvPlayer,
        historicalMatch: exact,
        confidence: 100,
        matchType: 'exact',
        alternatives: []
      };
    }

    // If multiple exact-normalized matches exist, mark as ambiguous and expose alternatives
    if (exactNormMatches && exactNormMatches.length > 1) {
      const alts = exactNormMatches.map(p => ({ player: p, confidence: 100 }));
      return {
        csvPlayer,
        historicalMatch: null,
        confidence: 0,
        matchType: 'ambiguous',
        alternatives: alts
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
