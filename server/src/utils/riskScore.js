// Central place that maps violation event types to base severities,
// and computes an aggregate risk level for an attempt.

const SEVERITY_MAP = {
  TAB_SWITCH: 'MEDIUM',
  VISIBILITY_CHANGE: 'MEDIUM',
  WINDOW_BLUR: 'LOW',
  FULLSCREEN_EXIT: 'MEDIUM',
  COPY: 'LOW',
  CUT: 'LOW',
  PASTE: 'LOW',
  RIGHT_CLICK: 'LOW',
  SUSPICIOUS_SHORTCUT: 'MEDIUM',
  WEBCAM_DISCONNECT: 'HIGH',
  NO_FACE: 'MEDIUM',
  MULTIPLE_FACES: 'HIGH',
  LOOKING_AWAY: 'MEDIUM',
  REFRESH_ATTEMPT: 'MEDIUM',
  DUPLICATE_SESSION: 'CRITICAL'
};

const WEIGHT = { LOW: 1, MEDIUM: 3, HIGH: 6, CRITICAL: 12 };

function severityFor(eventType) {
  return SEVERITY_MAP[eventType] || 'LOW';
}

// Given the full list of violation events for an attempt, compute an
// aggregate risk level. Thresholds are admin-configurable via exam settings
// but we provide sane server-side defaults here.
function computeRiskLevel(events, thresholds = {}) {
  const { medium = 8, high = 18, critical = 30 } = thresholds;
  const score = events.reduce((sum, e) => sum + (WEIGHT[e.severity] || 0), 0);
  if (score >= critical) return 'CRITICAL';
  if (score >= high) return 'HIGH';
  if (score >= medium) return 'MEDIUM';
  return 'LOW';
}

module.exports = { severityFor, computeRiskLevel, WEIGHT };
