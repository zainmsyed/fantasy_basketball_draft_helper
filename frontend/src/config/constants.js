export const ERROR_MESSAGES = {
  INVALID_FILE: 'Invalid file format. Please upload a CSV file.',
  STORAGE_QUOTA_EXCEEDED: 'Storage quota exceeded. Please clear some drafts.'
};

export const PERFORMANCE_TARGETS = {
  csvParsing: 3000,
  nameMatching: 1000,
  validation: 100
};

export const VALIDATION_THRESHOLDS = {
  minStatsRequired: 6,
  fgAttemptThreshold: 5,
  ftAttemptThreshold: 2
};
export const TIMING = {
  SEARCH_DEBOUNCE_MS: 100,
  STATE_SAVE_THROTTLE_MS: 400,
}

export const UI = {
  TABLE_HEIGHT: '600px',
  STORAGE_KEY: 'draft_helper_state',
  STORAGE_TEST_KEY: '__draft_helper_test__',
  TOAST_DURATION_MS: 3500
}

export const DATA_VIEWS = {
  ACTUAL_2024: '2024-25',
  PROJECTED_2025: '2025-26',
}

export const MATCHING = {
  CONFIDENCE_THRESHOLD: 85,
  USE_TEAM_TIEBREAKER: true
};
